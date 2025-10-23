"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import type { Sensor } from "@/app/sensors/page";
import { TemperatureChart } from "./temperature-chart";

interface SimpleChartViewProps {
  sensor: Sensor;
  tempUnit: "C" | "F";
  timeRange: "24h" | "7d" | "30d";
}

export function SimpleChartView({ sensor, tempUnit, timeRange }: SimpleChartViewProps) {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/sensors/${sensor.id}/readings?range=${timeRange}&unit=${tempUnit}`
        );
        const data = await response.json();
        setReadings(data.readings || []);
      } catch (error) {
        console.error("Error fetching readings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [sensor.id, tempUnit, timeRange]);

  const minTemp =
    tempUnit === "C"
      ? sensor.min_temp_celsius
      : (sensor.min_temp_celsius * 9) / 5 + 32;
  const maxTemp =
    tempUnit === "C"
      ? sensor.max_temp_celsius
      : (sensor.max_temp_celsius * 9) / 5 + 32;

  return (
    <Card className="bg-[#1a1a1a] border-gray-800 h-[600px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <Thermometer className="h-6 w-6 text-[#c4dfc4]" />
              {sensor.name}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {sensor.location} • {sensor.equipment_type}
            </CardDescription>
          </div>
          {sensor.latest_reading && (
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {tempUnit === "C"
                  ? sensor.latest_reading.temperature_celsius.toFixed(1)
                  : sensor.latest_reading.temperature_fahrenheit.toFixed(1)}
                °{tempUnit}
              </div>
              <div className="text-sm text-gray-400 mt-1">Current Temperature</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-140px)]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-[#c4dfc4] border-t-transparent rounded-full"></div>
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
  );
}

