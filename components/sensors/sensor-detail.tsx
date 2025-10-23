// Sensor detail view - expanded view when clicking a sensor card

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Thermometer, AlertTriangle } from "lucide-react";
import type { Sensor } from "@/app/sensors/page";
import { TemperatureChart } from "./temperature-chart";
import {
  getTempStatus,
  getStatusColor,
  getStatusBadgeText,
} from "@/lib/sensors/temperature-utils";
import { AlertResolutionForm } from "./alert-resolution-form";

interface SensorDetailProps {
  sensor: Sensor;
  tempUnit: "C" | "F";
  timeRange: "24h" | "7d" | "30d";
  onClose: () => void;
}

export function SensorDetail({
  sensor,
  tempUnit,
  timeRange,
  onClose,
}: SensorDetailProps) {
  const [readings, setReadings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch readings
        const readingsResponse = await fetch(
          `/api/sensors/${sensor.id}/readings?range=${timeRange}&unit=${tempUnit}`
        );
        const readingsData = await readingsResponse.json();
        setReadings(readingsData.readings || []);

        // Fetch alerts
        const alertsResponse = await fetch(
          `/api/sensors/${sensor.id}/alerts?status=active`
        );
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      } catch (error) {
        console.error("Error fetching sensor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sensor.id, tempUnit, timeRange]);

  const latestReading = sensor.latest_reading;
  const currentTemp = latestReading
    ? tempUnit === "C"
      ? latestReading.temperature_celsius
      : latestReading.temperature_fahrenheit
    : 0;

  const minTemp =
    tempUnit === "C"
      ? sensor.min_temp_celsius
      : (sensor.min_temp_celsius * 9) / 5 + 32;
  const maxTemp =
    tempUnit === "C"
      ? sensor.max_temp_celsius
      : (sensor.max_temp_celsius * 9) / 5 + 32;

  const status = getTempStatus(currentTemp, minTemp, maxTemp);
  const statusColor = getStatusColor(status);
  const statusText = getStatusBadgeText(status);

  const activeAlert = alerts.find((a) => a.status === "active");

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        className="hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Grid
      </Button>

      {/* Sensor Header Card */}
      <Card className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-gray-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl text-white flex items-center gap-3">
                <Thermometer className="h-8 w-8 text-[#c4dfc4]" />
                {sensor.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                <MapPin className="h-4 w-4" />
                {sensor.location}
              </div>
            </div>
            <div className="text-right">
              <Badge
                style={{ backgroundColor: statusColor }}
                className="text-black font-semibold text-lg px-4 py-2"
              >
                {statusText}
              </Badge>
              <div className="mt-2 text-sm text-gray-400 capitalize">
                {sensor.equipment_type}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Temperature */}
            <div className="text-center">
              <div className="text-6xl font-bold text-white">
                {currentTemp.toFixed(1)}°{tempUnit}
              </div>
              <div className="text-sm text-gray-400 mt-2">Current</div>
            </div>

            {/* Range */}
            <div className="text-center">
              <div className="text-xl text-gray-300">
                {minTemp.toFixed(1)}° - {maxTemp.toFixed(1)}°{tempUnit}
              </div>
              <div className="text-sm text-gray-400 mt-2">Acceptable Range</div>
            </div>

            {/* Status Info */}
            <div className="text-center">
              <div className="text-xl text-gray-300">
                {sensor.alert_delay_minutes} minutes
              </div>
              <div className="text-sm text-gray-400 mt-2">Alert Delay</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alert Card */}
      {activeAlert && (
        <Card className="bg-[#ff6b6b]/10 border-[#ff6b6b]/30 border-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#ff6b6b]" />
              Active Temperature Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertResolutionForm
              alert={activeAlert}
              sensor={sensor}
              onResolved={() => {
                // Refresh data
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Temperature Chart */}
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            Temperature History ({timeRange.toUpperCase()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin h-12 w-12 border-4 border-[#c4dfc4] border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <TemperatureChart
              readings={readings}
              minTemp={minTemp}
              maxTemp={maxTemp}
              tempUnit={tempUnit}
            />
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      {alerts.length > 0 && (
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg"
                >
                  <div>
                    <div className="font-medium text-white">
                      {alert.temp_fahrenheit.toFixed(1)}°F
                      {alert.status === "resolved" && " (Resolved)"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(alert.started_at).toLocaleString()}
                      {alert.duration_minutes && ` • ${alert.duration_minutes}m`}
                    </div>
                  </div>
                  <Badge
                    className={
                      alert.status === "active"
                        ? "bg-[#ff6b6b]"
                        : "bg-[#c4dfc4] text-black"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

