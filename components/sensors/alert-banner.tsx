// Alert banner for active temperature violations

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";
import type { Sensor } from "@/app/sensors/page";
import { useState } from "react";

interface AlertBannerProps {
  sensors: Sensor[];
  tempUnit: "C" | "F";
}

export function AlertBanner({ sensors, tempUnit }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const sensorsWithAlerts = sensors.filter((s) => s.has_active_alert);

  if (sensorsWithAlerts.length === 0 || dismissed) {
    return null;
  }

  const totalAlerts = sensorsWithAlerts.reduce(
    (sum, s) => sum + s.active_alerts_count,
    0
  );

  return (
    <Card className="bg-[#ff6b6b]/10 border-[#ff6b6b]/30 border-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-[#ff6b6b] animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {totalAlerts} Active Temperature {totalAlerts === 1 ? "Alert" : "Alerts"}
              </h3>
              <p className="text-sm text-gray-400">
                {sensorsWithAlerts.map((s, i) => (
                  <span key={s.id}>
                    <span className="text-white font-medium">{s.name}</span>
                    {i < sensorsWithAlerts.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/sensors"
              className="px-4 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff5555] transition-colors text-sm font-medium"
            >
              View Details
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

