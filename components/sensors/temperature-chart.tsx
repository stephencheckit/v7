// Temperature chart component using Recharts

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

interface TemperatureChartProps {
  readings: Array<{
    temperature: number;
    recorded_at: string;
    is_in_range: boolean;
  }>;
  minTemp: number;
  maxTemp: number;
  tempUnit: "C" | "F";
}

export function TemperatureChart({
  readings,
  minTemp,
  maxTemp,
  tempUnit,
}: TemperatureChartProps) {
  // Format data for chart
  const chartData = readings.map((r) => ({
    time: format(new Date(r.recorded_at), "HH:mm"),
    fullTime: format(new Date(r.recorded_at), "MMM d, HH:mm"),
    temp: r.temperature,
    inRange: r.is_in_range,
  }));

  // Custom dot component to show red dots when out of range
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={payload.inRange ? "#c4dfc4" : "#ff6b6b"}
        stroke="white"
        strokeWidth={1}
      />
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-1">
            {data.temp.toFixed(1)}°{tempUnit}
          </p>
          <p className="text-xs text-gray-400">{data.fullTime}</p>
          <p className="text-xs mt-1">
            <span
              className={`font-medium ${
                data.inRange ? "text-[#c4dfc4]" : "text-[#ff6b6b]"
              }`}
            >
              {data.inRange ? "✓ In Range" : "✗ Out of Range"}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-[#1a1a1a] rounded-lg border border-gray-800">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="time" stroke="#6b7280" />
        <YAxis stroke="#6b7280" domain={["auto", "auto"]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {/* Reference lines for thresholds */}
        <ReferenceLine
          y={minTemp}
          stroke="#ff6b6b"
          strokeDasharray="3 3"
          strokeWidth={2}
          label={{
            value: `Min: ${minTemp.toFixed(1)}°${tempUnit}`,
            fill: "#ff6b6b",
            fontSize: 12,
          }}
        />
        <ReferenceLine
          y={maxTemp}
          stroke="#ff6b6b"
          strokeDasharray="3 3"
          strokeWidth={2}
          label={{
            value: `Max: ${maxTemp.toFixed(1)}°${tempUnit}`,
            fill: "#ff6b6b",
            fontSize: 12,
          }}
        />

        {/* Temperature line */}
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#c4dfc4"
          strokeWidth={3}
          dot={<CustomDot />}
          name={`Temperature (°${tempUnit})`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

