"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { BarChart3, PieChartIcon, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const COLORS = ['#c4dfc4', '#c8e0f5', '#ddc8f5', '#f5edc8', '#f5c8c8', '#c8f5e0'];

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number; // Allow additional properties for Recharts compatibility
}

export interface ComplianceChartProps {
  id: string;
  title: string;
  data: ChartData[];
  chartType?: 'bar' | 'pie' | 'line';
  description?: string;
  onEdit?: () => void;
  onRemove?: () => void;
  onChangeType?: (type: 'bar' | 'pie' | 'line') => void;
}

export function ComplianceChart({ 
  id, 
  title, 
  data, 
  chartType = 'bar', 
  description,
  onEdit,
  onRemove,
  onChangeType 
}: ComplianceChartProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#c4dfc4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#c8e0f5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card 
      className="bg-[#0a0a0a] border-border/50 p-6 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Action Buttons - Show on hover */}
        {isHovered && (
          <div className="flex gap-1">
            {/* Chart Type Switcher */}
            <div className="flex gap-1 mr-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onChangeType?.('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onChangeType?.('pie')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onChangeType?.('line')}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-500/20"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mt-4">
        {renderChart()}
      </div>
    </Card>
  );
}

