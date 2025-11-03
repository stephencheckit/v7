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

const BOT_ICONS: Record<string, string> = {
    'GPTBot': '🤖',
    'ChatGPT-User': '💬',
    'Claude-Bot': '🧠',
    'Claude-Web': '💭',
    'PerplexityBot': '🔍',
    'Google-Extended': '🔎',
    'Bytespider': '🕷️',
    'Applebot-Extended': '🍎',
    'cohere-ai': '⚡',
    'YouBot': '👤',
};

// Generate realistic demo data for demonstration purposes
function getDemoData(days: number): AnalyticsData {
    const now = new Date();
    const bots = ['GPTBot', 'Claude-Bot', 'PerplexityBot', 'ChatGPT-User', 'Google-Extended', 'Claude-Web'];
    const paths = ['/ai/', '/ai/context.json'];
    
    // Generate time series data
    const timeSeriesData = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const dayData: any = { date: dateStr };
        // Add varying bot activity (more recent = more activity)
        const activityMultiplier = 1 + (days - i) / days; // Recent days have more activity
        
        bots.forEach(bot => {
            const baseActivity = bot === 'GPTBot' ? 8 : bot === 'Claude-Bot' ? 6 : bot === 'PerplexityBot' ? 4 : 3;
            dayData[bot] = Math.floor(baseActivity * activityMultiplier * (0.5 + Math.random()));
        });
        
        timeSeriesData.push(dayData);
    }
    
    // Calculate bot counts
    const botCounts: Record<string, number> = {};
    bots.forEach(bot => {
        const baseCount = bot === 'GPTBot' ? 180 : bot === 'Claude-Bot' ? 135 : bot === 'PerplexityBot' ? 90 : 65;
        botCounts[bot] = Math.floor(baseCount * (days / 30));
    });
    
    // Generate recent accesses
    const recentAccesses = [];
    for (let i = 0; i < 50; i++) {
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const path = paths[Math.floor(Math.random() * paths.length)];
        const accessTime = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
        
        recentAccesses.push({
            id: `demo-${i}`,
            bot_name: bot,
            user_agent: `Mozilla/5.0 (compatible; ${bot}/1.0)`,
            path: path,
            accessed_at: accessTime.toISOString(),
            ip_address: `35.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        });
    }
    
    // Sort by most recent first
    recentAccesses.sort((a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime());
    
    const totalVisits = Object.values(botCounts).reduce((sum, count) => sum + count, 0);
    
    return {
        summary: {
            totalVisits,
            uniqueBots: bots.length,
            mostActiveBot: 'GPTBot',
            lastVisit: recentAccesses[0].accessed_at,
        },
        botCounts,
        timeSeriesData,
        recentAccesses,
    };
}

export default function AIAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<number>(30);
    const [activeTab, setActiveTab] = useState<'real' | 'demo'>('real');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (activeTab === 'demo') {
        // Load demo data
        const demoData = getDemoData(dateRange);
        setData(demoData);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/ai-analytics?days=${dateRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Ensure data has required structure
      const safeData = {
        summary: result.summary || { totalVisits: 0, uniqueBots: 0, mostActiveBot: 'None', lastVisit: null },
        botCounts: result.botCounts || {},
        timeSeriesData: result.timeSeriesData || [],
        recentAccesses: result.recentAccesses || [],
      };
      
      setData(safeData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set empty data on error
      setData({
        summary: { totalVisits: 0, uniqueBots: 0, mostActiveBot: 'None', lastVisit: null },
        botCounts: {},
        timeSeriesData: [],
        recentAccesses: [],
      });
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

            {/* Tab Selector */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('real')}
                        className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                            activeTab === 'real'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Real Data
                    </button>
                    <button
                        onClick={() => setActiveTab('demo')}
                        className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                            activeTab === 'demo'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Demo Data
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Sample
                        </span>
                    </button>
                </div>
            </div>

            {/* Demo Notice */}
            {activeTab === 'demo' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Demo Mode Active
                            </h3>
                            <p className="mt-1 text-sm text-blue-700">
                                This is simulated data for demonstration purposes. Switch to "Real Data" to see actual bot activity.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                        <span className="text-2xl">
                            {BOT_ICONS[data.summary.mostActiveBot] || '🤖'}
                        </span>
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {BOT_ICONS[access.bot_name] || '🤖'}
                                            </span>
                                            <div
                                                className="w-2 h-2 rounded-full"
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

