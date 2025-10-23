// Sensor card component for grid display

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, MapPin, Clock } from "lucide-react";
import type { Sensor } from "@/app/sensors/page";
import {
  getTempStatus,
  getStatusColor,
  getStatusBadgeText,
  formatTemperature,
} from "@/lib/sensors/temperature-utils";
import { formatDistanceToNow } from "date-fns";
import { MiniChart } from "./mini-chart";

interface SensorCardProps {
  sensor: Sensor;
  tempUnit: "C" | "F";
  onClick: () => void;
}

export function SensorCard({ sensor, tempUnit, onClick }: SensorCardProps) {
  const latestReading = sensor.latest_reading;

  if (!latestReading) {
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow border-gray-800 bg-[#1a1a1a]"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white">{sensor.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {sensor.location}
              </CardDescription>
            </div>
            <Badge className="bg-gray-700 text-gray-300">
              OFFLINE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Thermometer className="h-12 w-12 mx-auto mb-2 text-gray-600" />
            <p className="text-gray-400 text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const temp =
    tempUnit === "C"
      ? latestReading.temperature_celsius
      : latestReading.temperature_fahrenheit;

  const minTemp =
    tempUnit === "C"
      ? sensor.min_temp_celsius
      : (sensor.min_temp_celsius * 9) / 5 + 32;

  const maxTemp =
    tempUnit === "C"
      ? sensor.max_temp_celsius
      : (sensor.max_temp_celsius * 9) / 5 + 32;

  const status = getTempStatus(temp, minTemp, maxTemp);
  const statusColor = getStatusColor(status);
  const statusText = getStatusBadgeText(status);

  // Format last updated
  const lastUpdated = formatDistanceToNow(new Date(latestReading.recorded_at), {
    addSuffix: true,
  });

  return (
    <Card
      className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all border-gray-800 bg-[#1a1a1a]"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-white">{sensor.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {sensor.location}
            </CardDescription>
          </div>
          <Badge
            style={{ backgroundColor: statusColor }}
            className="text-black font-semibold"
          >
            {statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Temperature Display */}
        <div className="text-center py-4">
          <div className="text-6xl font-bold text-white">
            {formatTemperature(temp, tempUnit, 1).replace(`°${tempUnit}`, "")}
            <span className="text-3xl text-gray-400">°{tempUnit}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Range: {minTemp.toFixed(1)}° - {maxTemp.toFixed(1)}°{tempUnit}
          </div>
        </div>

        {/* Mini Chart */}
        <MiniChart sensorId={sensor.id} tempUnit={tempUnit} />

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t border-gray-800">
          <Clock className="h-3 w-3" />
          Updated {lastUpdated}
        </div>

        {/* Equipment Type Badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800 text-xs text-gray-300">
            <Thermometer className="h-3 w-3" />
            {sensor.equipment_type === "freezer" ? "Freezer" : "Fridge"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

