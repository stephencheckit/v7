'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface AnalyticsData {
    summary: {
        totalVisits: number;
        uniqueBots: number;
        mostActiveBot: string;
        lastVisit: string | null;
    };
    botCounts: Record<string, number>;
    timeSeriesData: Array<{
        date: string;
        [key: string]: string | number;
    }>;
    recentAccesses: Array<{
        id: string;
        bot_name: string;
        user_agent: string;
        path: string;
        accessed_at: string;
        ip_address?: string;
    }>;
}

const BOT_COLORS: Record<string, string> = {
    'GPTBot': '#10a37f',
    'ChatGPT-User': '#19c37d',
    'Claude-Bot': '#cc785c',
    'Claude-Web': '#d98c6f',
    'PerplexityBot': '#5b7db1',
    'Google-Extended': '#4285f4',
    'Bytespider': '#ff6b6b',
    'Applebot-Extended': '#555555',
};

export default function AIAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<number>(30);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/ai-analytics?days=${dateRange}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600">Failed to load analytics data</p>
            </div>
        );
    }

    const botCountsArray = Object.entries(data.botCounts).map(([name, count]) => ({
        name,
        visits: count,
    }));

    // Get unique bot names for line chart
    const uniqueBots = Array.from(
        new Set(data.recentAccesses.map(a => a.bot_name))
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    AI Bot Analytics Dashboard
                </h1>
                <p className="text-gray-600">
                    Track AI model engagement with your brand context
                </p>
            </div>

            {/* Date Range Selector */}
            <div className="mb-6 flex gap-2">
                {[7, 30, 90].map((days) => (
                    <button
                        key={days}
                        onClick={() => setDateRange(days)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${dateRange === days
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Last {days} days
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                        Total Visits
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {data.summary.totalVisits}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                        Unique Bots
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {data.summary.uniqueBots}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                        Most Active Bot
                    </div>
                    <div className="text-xl font-bold text-gray-900 truncate">
                        {data.summary.mostActiveBot}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                        Last Visit
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {data.summary.lastVisit ? (
                            <>
                                {format(new Date(data.summary.lastVisit), 'MMM d, yyyy')}
                                <br />
                                <span className="text-xs text-gray-500">
                                    {format(new Date(data.summary.lastVisit), 'h:mm a')}
                                </span>
                            </>
                        ) : (
                            'No visits yet'
                        )}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Time Series Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Visits Over Time
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'MMM d')}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) =>
                                    format(new Date(date), 'MMM d, yyyy')
                                }
                            />
                            <Legend />
                            {uniqueBots.map((botName) => (
                                <Line
                                    key={botName}
                                    type="monotone"
                                    dataKey={botName}
                                    stroke={BOT_COLORS[botName] || '#999999'}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bot Counts Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Visits by Bot
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={botCountsArray}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="visits"
                                fill="#3b82f6"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Accesses Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Bot Accesses
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bot Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Path
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IP Address
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.recentAccesses.slice(0, 50).map((access) => (
                                <tr key={access.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div
                                                className="w-2 h-2 rounded-full mr-2"
                                                style={{
                                                    backgroundColor:
                                                        BOT_COLORS[access.bot_name] || '#999999',
                                                }}
                                            ></div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {access.bot_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {access.path}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {format(new Date(access.accessed_at), 'MMM d, h:mm a')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {access.ip_address || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="mt-6 text-center">
                <button
                    onClick={fetchAnalytics}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh Data
                </button>
            </div>
        </div>
    );
}

