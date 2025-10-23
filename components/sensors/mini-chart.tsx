// Mini sparkline chart for sensor cards

import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniChartProps {
  sensorId: string;
  tempUnit: "C" | "F";
}

export function MiniChart({ sensorId, tempUnit }: MiniChartProps) {
  const [data, setData] = useState<{ temp: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/sensors/${sensorId}/readings?range=24h&unit=${tempUnit}&limit=50`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch readings");
        }

        const result = await response.json();
        const chartData = result.readings.map((r: any) => ({
          temp: r.temperature,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching mini chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sensorId, tempUnit]);

  if (loading) {
    return (
      <div className="h-16 w-full bg-gray-900/50 rounded animate-pulse"></div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-16 w-full bg-gray-900/50 rounded flex items-center justify-center">
        <p className="text-xs text-gray-500">No data</p>
      </div>
    );
  }

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#c4dfc4"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

