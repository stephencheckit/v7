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
    <div className="flex flex-col gap-1.5">
      {/* Total Sensors */}
      <Card className="bg-gradient-to-br from-[#c8e0f5] to-[#c8e0f5]/80 border-0 shadow-lg">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-[#0a0a0a]/10 rounded-lg p-2">
            <Thermometer className="h-5 w-5 text-[#0a0a0a]/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium text-[#0a0a0a]/70 mb-0.5">Total Sensors</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#0a0a0a] leading-none">{totalSensors}</span>
              <span className="text-[9px] text-[#0a0a0a]/60">{onlineSensors.length} online</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className={`border-0 shadow-lg ${
        activeAlerts > 0 
          ? "bg-gradient-to-br from-[#ff6b6b] to-[#ff6b6b]/80"
          : "bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80"
      }`}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-[#0a0a0a]/10 rounded-lg p-2">
            {activeAlerts > 0 ? (
              <AlertTriangle className="h-5 w-5 text-[#0a0a0a]/50" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-[#0a0a0a]/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium text-[#0a0a0a]/70 mb-0.5">Active Alerts</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#0a0a0a] leading-none">{activeAlerts}</span>
              <span className="text-[9px] text-[#0a0a0a]/60">
                {activeAlerts === 0 ? "All normal" : "Need attention"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Temperature */}
      <Card className="bg-gradient-to-br from-[#ddc8f5] to-[#ddc8f5]/80 border-0 shadow-lg">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-[#0a0a0a]/10 rounded-lg p-2">
            <Activity className="h-5 w-5 text-[#0a0a0a]/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium text-[#0a0a0a]/70 mb-0.5">Avg Temperature</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#0a0a0a] leading-none">
                {sensorsWithReadings.length > 0 ? `${avgTemp.toFixed(1)}°${tempUnit}` : "—"}
              </span>
              <span className="text-[9px] text-[#0a0a0a]/60">All sensors</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uptime */}
      <Card className="bg-gradient-to-br from-[#f5edc8] to-[#f5edc8]/80 border-0 shadow-lg">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="bg-[#0a0a0a]/10 rounded-lg p-2">
            <Activity className="h-5 w-5 text-[#0a0a0a]/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium text-[#0a0a0a]/70 mb-0.5">Uptime</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#0a0a0a] leading-none">{uptimePercent.toFixed(0)}%</span>
              <span className="text-[9px] text-[#0a0a0a]/60">Last 10 min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

