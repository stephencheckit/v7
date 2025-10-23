"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { createClient } from "@/lib/supabase/client";
import { SensorCard } from "@/components/sensors/sensor-card";
import { SensorStats } from "@/components/sensors/sensor-stats";
import { AlertBanner } from "@/components/sensors/alert-banner";
import { TempUnitToggle } from "@/components/sensors/temp-unit-toggle";
import { SensorDetail } from "@/components/sensors/sensor-detail";
import { Thermometer } from "lucide-react";

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
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#c4dfc4] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading sensors...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full h-full overflow-auto">
        <div className="p-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
            {/* Sensor Detail View - Full Page */}
            {selectedSensor ? (
              <SensorDetail
                sensor={selectedSensor}
                tempUnit={tempUnit}
                timeRange={timeRange}
                onClose={() => setSelectedSensor(null)}
              />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                      <Thermometer className="h-10 w-10 text-[#c4dfc4]" />
                      Sensors Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Real-time temperature monitoring for food safety compliance
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-4">
                    <TempUnitToggle value={tempUnit} onChange={handleUnitChange} />
                    
                    {/* Time Range Selector */}
                    <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1">
                      {["24h", "7d", "30d"].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range as any)}
                          className={`px-4 py-2 rounded-md text-sm transition-colors ${
                            timeRange === range
                              ? "bg-[#c4dfc4] text-black"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <SensorStats sensors={sensors} tempUnit={tempUnit} />

                {/* Active Alerts Banner */}
                {activeAlertsCount > 0 && (
                  <AlertBanner sensors={sensors} tempUnit={tempUnit} />
                )}

                {/* Sensor Grid */}
                {sensors.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
                    <Thermometer className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No Sensors Yet
                    </h3>
                    <p className="text-gray-400">
                      Connect your first sensor to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sensors.map((sensor) => (
                      <SensorCard
                        key={sensor.id}
                        sensor={sensor}
                        tempUnit={tempUnit}
                        onClick={() => setSelectedSensor(sensor)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

