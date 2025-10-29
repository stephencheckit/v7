"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkInstanceCard } from "./work-instance-card";
import type { LucideIcon } from "lucide-react";
import type { FormInstance } from "@/lib/types/cadence";

interface WorkSectionProps {
  title: string;
  icon: LucideIcon;
  color: 'red' | 'yellow' | 'green' | 'blue';
  instances: Array<FormInstance & {
    form?: { id: string; title: string; description?: string };
    cadence?: { id: string; name: string };
  }>;
  showTimeRemaining?: boolean;
  showStartTime?: boolean;
}

const COLOR_STYLES = {
  red: {
    card: 'border-red-500/30 bg-red-500/5',
    icon: 'text-red-500',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  yellow: {
    card: 'border-yellow-500/30 bg-yellow-500/5',
    icon: 'text-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  green: {
    card: 'border-green-500/30 bg-green-500/5',
    icon: 'text-green-500',
    badge: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  blue: {
    card: 'border-blue-500/30 bg-blue-500/5',
    icon: 'text-blue-500',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
};

export function WorkSection({ 
  title, 
  icon: Icon, 
  color, 
  instances, 
  showTimeRemaining = false,
  showStartTime = false
}: WorkSectionProps) {
  const styles = COLOR_STYLES[color];

  if (instances.length === 0) {
    return null;
  }

  return (
    <Card className={`border-2 ${styles.card}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Icon className={`w-6 h-6 ${styles.icon}`} />
          <span>{title}</span>
          <Badge className={styles.badge}>
            {instances.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {instances.map(instance => (
            <WorkInstanceCard
              key={instance.id}
              instance={instance}
              showTimeRemaining={showTimeRemaining}
              showStartTime={showStartTime}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

