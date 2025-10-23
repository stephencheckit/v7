"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SensorCard } from "@/components/sensors/sensor-card";
import { SensorStats } from "@/components/sensors/sensor-stats";
import { AlertBanner } from "@/components/sensors/alert-banner";
import { TempUnitToggle } from "@/components/sensors/temp-unit-toggle";
import { SensorDetail } from "@/components/sensors/sensor-detail";
import { SimpleChartView } from "@/components/sensors/simple-chart-view";
import { Thermometer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Sensor {
  id: string;
  name: string;
  location: string;
  equipment_type: string;
  min_temp_celsius: number;
  max_temp_celsius: number;
  alert_delay_minutes: number;
  is_active: boolean;
  last_reading_at: string | null;
  latest_reading?: {
    temperature_celsius: number;
    temperature_fahrenheit: number;
    is_in_range: boolean;
    recorded_at: string;
  } | null;
  active_alerts_count: number;
  has_active_alert: boolean;
}

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("F");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load temperature unit preference from localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem("tempUnit");
    if (savedUnit === "C" || savedUnit === "F") {
      setTempUnit(savedUnit);
    }
  }, []);

  // Save temperature unit preference
  const handleUnitChange = (unit: "C" | "F") => {
    setTempUnit(unit);
    localStorage.setItem("tempUnit", unit);
  };

  // Load sensors
  const loadSensors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sensors");

      if (!response.ok) {
        throw new Error("Failed to fetch sensors");
      }

      const data = await response.json();
      setSensors(data.sensors || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading sensors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  // Auto-select first sensor when sensors load
  useEffect(() => {
    if (sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0]);
    }
  }, [sensors, selectedSensor]);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClient();

    const subscription = supabase
      .channel("sensors-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        (payload) => {
          console.log("🔄 New reading received:", payload);
          // Reload sensors to get updated data
          loadSensors();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sensor_alerts" },
        (payload) => {
          console.log("🚨 Alert update:", payload);
          // Reload sensors to get updated alerts
          loadSensors();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Calculate active alerts
  const activeAlertsCount = sensors.reduce(
    (sum, s) => sum + s.active_alerts_count,
    0
  );

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#c4dfc4] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading sensors...</p>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-400">
            <p className="text-xl mb-2">Error loading sensors</p>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={loadSensors}
              className="mt-4 px-4 py-2 bg-[#c4dfc4] text-black rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[2000px]">
          {/* Always show the sidebar + chart layout */}
          <>
            {/* Compact Header - Single Row */}
            <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Thermometer className="h-5 w-5 md:h-6 md:w-6 text-[#c4dfc4]" />
                Sensors Dashboard
              </h1>
              
              {/* Right Side Controls */}
              <div className="w-full md:w-auto md:ml-auto flex flex-wrap items-center gap-2 md:gap-4">
                {/* Temp Unit Toggle */}
                <TempUnitToggle value={tempUnit} onChange={handleUnitChange} />
                
                {/* Time Range Selector */}
                <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1">
                  {["24h", "7d", "30d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range as any)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        timeRange === range
                          ? "bg-[#c4dfc4] text-black"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                
                {/* Sensor Selector Dropdown */}
                {sensors.length > 0 && (
                  <Select
                    value={selectedSensor?.id || ""}
                    onValueChange={(value) => {
                      const sensor = sensors.find(s => s.id === value);
                      if (sensor) setSelectedSensor(sensor);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[280px] bg-[#1a1a1a] border-gray-700">
                      <SelectValue placeholder="Select a sensor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sensors.map((sensor) => (
                        <SelectItem key={sensor.id} value={sensor.id}>
                          {sensor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

              {/* Main Layout: Sidebar (Stats) + Content (Sensors) */}
              <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Left Sidebar - Stats & Alerts */}
                <div className="w-full lg:w-[280px] flex-shrink-0 space-y-3">
                  {/* Stats Cards - 1x4 Column */}
                  <SensorStats sensors={sensors} tempUnit={tempUnit} />

                  {/* Active Alerts */}
                  {activeAlertsCount > 0 && (
                    <AlertBanner sensors={sensors} tempUnit={tempUnit} />
                  )}
                </div>

                {/* Right Content - Large Chart Area */}
                <div className="flex-1 min-w-0 space-y-6">
                  {sensors.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a] rounded-lg border border-gray-800 h-full flex items-center justify-center">
                      <div>
                        <Thermometer className="h-20 w-20 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                          No Sensors Yet
                        </h3>
                        <p className="text-gray-400">
                          Connect your first sensor to get started
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Large Chart Area */}
                      {selectedSensor && (
                        <SimpleChartView
                          sensor={selectedSensor}
                          tempUnit={tempUnit}
                          timeRange={timeRange}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
          </>
        </div>
      </div>
    </div>
  );
}

