"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Thermometer, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Food Safety Data
const complianceData = [
  { name: "Compliant", value: 87, color: "#c4dfc4" },
  { name: "Minor Issues", value: 10, color: "#f5edc8" },
  { name: "Critical", value: 3, color: "#ff6b6b" },
];

const temperatureData = [
  { name: "Mon", cold: 38, hot: 165, ideal: 40 },
  { name: "Tue", cold: 39, hot: 167, ideal: 40 },
  { name: "Wed", cold: 37, hot: 164, ideal: 40 },
  { name: "Thu", cold: 41, hot: 169, ideal: 40 },
  { name: "Fri", cold: 38, hot: 166, ideal: 40 },
  { name: "Sat", cold: 39, hot: 168, ideal: 40 },
  { name: "Sun", cold: 38, hot: 165, ideal: 40 },
];

const violationTrends = [
  { month: "Jan", violations: 12, resolved: 11 },
  { month: "Feb", violations: 8, resolved: 8 },
  { month: "Mar", violations: 15, resolved: 13 },
  { month: "Apr", violations: 6, resolved: 6 },
  { month: "May", violations: 4, resolved: 4 },
  { month: "Jun", violations: 3, resolved: 3 },
];

const inspectionScores = [
  { location: "Kitchen A", score: 98 },
  { location: "Kitchen B", score: 94 },
  { location: "Kitchen C", score: 96 },
  { location: "Prep Area", score: 92 },
  { location: "Storage", score: 99 },
];

export default function DashboardPage() {
  const [sensorAlerts, setSensorAlerts] = useState(0);

  useEffect(() => {
    // Fetch sensor alerts
    const fetchSensorAlerts = async () => {
      try {
        const response = await fetch("/api/sensors");
        if (response.ok) {
          const data = await response.json();
          const alertCount = data.sensors?.reduce(
            (sum: number, s: any) => sum + s.active_alerts_count,
            0
          ) || 0;
          setSensorAlerts(alertCount);
        }
      } catch (error) {
        console.error("Error fetching sensor alerts:", error);
      }
    };

    fetchSensorAlerts();
  }, []);

  return (
    <div className="w-full h-full overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                  <LayoutDashboard className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                  <span className="hidden sm:inline">Welcome back, Charlie</span>
                  <span className="sm:hidden">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                  Here's your food safety overview for today
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              {/* Sensor Alerts Card */}
              <Card className={`border-0 shadow-lg ${
                sensorAlerts > 0
                  ? "bg-gradient-to-br from-[#ff6b6b] to-[#ff6b6b]/80"
                  : "bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80"
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                    Sensor Alerts
                  </CardTitle>
                  <Thermometer className="h-4 w-4 text-[#0a0a0a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0a0a0a]">{sensorAlerts}</div>
                  <p className="text-xs text-[#0a0a0a]/70 mt-1">
                    {sensorAlerts === 0 ? "All sensors normal" : `${sensorAlerts} sensor${sensorAlerts === 1 ? '' : 's'} need attention`}
                  </p>
                  <Link 
                    href="/sensors" 
                    className="text-xs text-[#0a0a0a] underline hover:no-underline mt-2 inline-block"
                  >
                    View Dashboard →
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80 border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                    Compliance Score
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-[#0a0a0a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0a0a0a]">96.5%</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-[#0a0a0a]/70" />
                    <p className="text-xs text-[#0a0a0a]/70">+2.3% from last month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#f5edc8] to-[#f5edc8]/80 border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                    Temperature Violations
                  </CardTitle>
                  <Thermometer className="h-4 w-4 text-[#0a0a0a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0a0a0a]">3</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-[#0a0a0a]/70" />
                    <p className="text-xs text-[#0a0a0a]/70">-8 from last week</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#c8e0f5] to-[#c8e0f5]/80 border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                    Checklists Completed
                  </CardTitle>
                  <Badge className="bg-[#0a0a0a] text-[#c8e0f5]">Today</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0a0a0a]">42/45</div>
                  <p className="text-xs text-[#0a0a0a]/70 mt-1">
                    93% completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
              {/* Compliance Distribution Pie Chart */}
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle>Compliance Distribution</CardTitle>
                  <CardDescription>
                    Overall compliance status across all locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {complianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Temperature Monitoring */}
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle>Temperature Monitoring</CardTitle>
                  <CardDescription>
                    Cold storage & hot holding temps (°F) - Last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cold"
                        stroke="#c8e0f5"
                        strokeWidth={3}
                        name="Cold Storage"
                      />
                      <Line
                        type="monotone"
                        dataKey="hot"
                        stroke="#ff6b6b"
                        strokeWidth={3}
                        name="Hot Holding"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Violation Trends */}
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle>Violation Trends</CardTitle>
                  <CardDescription>
                    Monthly violations vs. resolutions - Trending down
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={violationTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="violations" fill="#ff6b6b" name="Violations" />
                      <Bar dataKey="resolved" fill="#c4dfc4" name="Resolved" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inspection Scores */}
              <Card className="shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle>Location Inspection Scores</CardTitle>
                  <CardDescription>
                    Latest audit scores by location - All above 90%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inspectionScores} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                      <YAxis dataKey="location" type="category" stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="score" fill="#c4dfc4" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Live Feed */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Live Activity Feed
                </CardTitle>
                <CardDescription>
                  Real-time updates from all locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#c4dfc4]/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Kitchen A - Morning checklist completed</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago • All items passed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#c8e0f5]/20 rounded-lg">
                    <Thermometer className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Storage Unit 3 - Temperature logged</p>
                      <p className="text-xs text-muted-foreground">8 minutes ago • 38°F - Within range</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#f5edc8]/20 rounded-lg">
                    <Users className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prep Area - Sanitization completed</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago • Signed by J. Martinez</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
