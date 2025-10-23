// Sensor statistics cards

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Thermometer, AlertTriangle, Activity, CheckCircle2 } from "lucide-react";
import type { Sensor } from "@/app/sensors/page";
import { convertTemp } from "@/lib/sensors/temperature-utils";

interface SensorStatsProps {
  sensors: Sensor[];
  tempUnit: "C" | "F";
}

export function SensorStats({ sensors, tempUnit }: SensorStatsProps) {
  // Calculate stats
  const totalSensors = sensors.length;
  const activeAlerts = sensors.reduce((sum, s) => sum + s.active_alerts_count, 0);
  
  // Calculate average temperature
  const sensorsWithReadings = sensors.filter(s => s.latest_reading);
  const avgTemp = sensorsWithReadings.length > 0
    ? sensorsWithReadings.reduce((sum, s) => {
        const temp = tempUnit === "C" 
          ? s.latest_reading!.temperature_celsius
          : s.latest_reading!.temperature_fahrenheit;
        return sum + temp;
      }, 0) / sensorsWithReadings.length
    : 0;

  // Calculate uptime (sensors that reported in last 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const onlineSensors = sensors.filter(s => {
    if (!s.last_reading_at) return false;
    return new Date(s.last_reading_at) > tenMinutesAgo;
  });
  const uptimePercent = totalSensors > 0 
    ? (onlineSensors.length / totalSensors) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sensors */}
      <Card className="bg-gradient-to-br from-[#c8e0f5] to-[#c8e0f5]/80 border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#0a0a0a]">
            Total Sensors
          </CardTitle>
          <Thermometer className="h-4 w-4 text-[#0a0a0a]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#0a0a0a]">
            {totalSensors}
          </div>
          <p className="text-xs text-[#0a0a0a]/70 mt-1">
            {onlineSensors.length} online
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className={`border-0 shadow-lg ${
        activeAlerts > 0 
          ? "bg-gradient-to-br from-[#ff6b6b] to-[#ff6b6b]/80"
          : "bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80"
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#0a0a0a]">
            Active Alerts
          </CardTitle>
          {activeAlerts > 0 ? (
            <AlertTriangle className="h-4 w-4 text-[#0a0a0a]" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-[#0a0a0a]" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#0a0a0a]">
            {activeAlerts}
          </div>
          <p className="text-xs text-[#0a0a0a]/70 mt-1">
            {activeAlerts === 0 ? "All sensors normal" : `${activeAlerts} need${activeAlerts === 1 ? 's' : ''} attention`}
          </p>
        </CardContent>
      </Card>

      {/* Average Temperature */}
      <Card className="bg-gradient-to-br from-[#ddc8f5] to-[#ddc8f5]/80 border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#0a0a0a]">
            Average Temperature
          </CardTitle>
          <Activity className="h-4 w-4 text-[#0a0a0a]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#0a0a0a]">
            {sensorsWithReadings.length > 0 ? `${avgTemp.toFixed(1)}°${tempUnit}` : "—"}
          </div>
          <p className="text-xs text-[#0a0a0a]/70 mt-1">
            Across all sensors
          </p>
        </CardContent>
      </Card>

      {/* Uptime */}
      <Card className="bg-gradient-to-br from-[#f5edc8] to-[#f5edc8]/80 border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#0a0a0a]">
            Uptime
          </CardTitle>
          <Activity className="h-4 w-4 text-[#0a0a0a]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#0a0a0a]">
            {uptimePercent.toFixed(0)}%
          </div>
          <p className="text-xs text-[#0a0a0a]/70 mt-1">
            Last 10 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

