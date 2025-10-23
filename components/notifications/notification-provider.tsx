"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Notification Provider - subscribes to real-time sensor alerts
 * and displays toast notifications
 */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to new sensor alerts
    const subscription = supabase
      .channel("sensor-alerts-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_alerts",
          filter: "status=eq.active",
        },
        (payload) => {
          console.log("🚨 New alert notification:", payload);
          
          const alert = payload.new;
          
          // Show toast notification
          toast.error("🚨 Temperature Alert", {
            description: `Sensor temperature out of range`,
            duration: 10000,
            action: {
              label: "View",
              onClick: () => router.push("/sensors"),
            },
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sensor_alerts",
          filter: "status=eq.resolved",
        },
        (payload) => {
          console.log("✅ Alert resolved:", payload);
          
          // Optionally show success toast
          toast.success("✅ Alert Resolved", {
            description: "Temperature returned to normal",
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}

