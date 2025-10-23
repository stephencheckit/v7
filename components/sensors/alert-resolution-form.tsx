// Alert resolution form component

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Sensor } from "@/app/sensors/page";

interface AlertResolutionFormProps {
  alert: any;
  sensor: Sensor;
  onResolved: () => void;
}

const RESOLUTION_ACTIONS = [
  { value: "door_closed", label: "Door closed" },
  { value: "fridge_plugged_in", label: "Fridge plugged in" },
  { value: "compressor_repaired", label: "Compressor repaired" },
  { value: "temperature_adjusted", label: "Temperature adjusted" },
  { value: "equipment_replaced", label: "Equipment replaced" },
  { value: "false_alarm", label: "False alarm" },
  { value: "other", label: "Other" },
];

export function AlertResolutionForm({
  alert,
  sensor,
  onResolved,
}: AlertResolutionFormProps) {
  const [resolutionAction, setResolutionAction] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolutionAction) {
      alert("Please select a resolution action");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/sensors/${sensor.id}/alerts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId: alert.id,
          status: "resolved",
          resolved_by: "Charlie Checkit",
          resolution_action: resolutionAction,
          resolution_notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      // Success!
      onResolved();
    } catch (error) {
      console.error("Error resolving alert:", error);
      alert("Failed to resolve alert");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDuration = () => {
    const start = new Date(alert.started_at);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return minutes;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-300 mb-4">
          Temperature has been out of range for{" "}
          <span className="font-bold text-white">
            {calculateDuration()} minutes
          </span>
          . Please resolve this alert.
        </p>
      </div>

      {/* Resolution Action Dropdown */}
      <div>
        <Label htmlFor="resolution-action" className="text-white">
          What action did you take?
        </Label>
        <Select value={resolutionAction} onValueChange={setResolutionAction}>
          <SelectTrigger
            id="resolution-action"
            className="mt-1 bg-[#2a2a2a] border-gray-700 text-white"
          >
            <SelectValue placeholder="Select action..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2a2a] border-gray-700">
            {RESOLUTION_ACTIONS.map((action) => (
              <SelectItem
                key={action.value}
                value={action.value}
                className="text-white focus:bg-[#3a3a3a] focus:text-white"
              >
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-white">
          Notes (optional)
        </Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full px-3 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c4dfc4] min-h-[80px]"
          placeholder="Add any additional details..."
        />
      </div>

      {/* Resolved By */}
      <div>
        <Label className="text-white">Resolved By</Label>
        <div className="mt-1 px-3 py-2 bg-[#2a2a2a]/50 border border-gray-700 rounded-md text-gray-400">
          Charlie Checkit
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={submitting || !resolutionAction}
        className="w-full bg-[#c4dfc4] text-black hover:bg-[#b0ccb0] disabled:opacity-50"
      >
        {submitting ? "Resolving..." : "Resolve Alert"}
      </Button>
    </form>
  );
}

