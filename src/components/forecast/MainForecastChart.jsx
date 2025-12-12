// src/components/forecast/MainForecastChart.jsx
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Activity, Droplets, Thermometer, Wind, Eye, EyeOff } from 'lucide-react';

export default function MainForecastChart({ data, selectedHour }) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    pm25: true,
    pm10: false,
    temp: false,
    humidity: false
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border-2 border-blue-300 rounded-xl shadow-xl p-4">
        <p className="font-bold text-gray-900 mb-2">
          {formatTime(label)}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const toggleMetric = (metric) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const metrics = [
    { 
      key: 'pm25', 
      label: 'PM2.5', 
      color: '#3b82f6', 
      icon: Wind,
      unit: ' µg/m³',
      description: 'Fine Particulate Matter'
    },
    { 
      key: 'pm10', 
      label: 'PM10', 
      color: '#8b5cf6', 
      icon: Activity,
      unit: ' µg/m³',
      description: 'Coarse Particulate Matter'
    },
    { 
      key: 'temp', 
      label: 'Temperature', 
      color: '#f59e0b', 
      icon: Thermometer,
      unit: '°C',
      description: 'Air Temperature'
    },
    { 
      key: 'humidity', 
      label: 'Humidity', 
      color: '#06b6d4', 
      icon: Droplets,
      unit: '%',
      description: 'Relative Humidity'
    }
  ];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No forecast data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header with Metric Toggles */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Forecast Timeline
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isVisible = visibleMetrics[metric.key];
            
            return (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isVisible
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon 
                    className={`w-5 h-5 ${isVisible ? 'text-blue-600' : 'text-gray-400'}`} 
                  />
                  {isVisible ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className={`text-sm font-semibold ${
                  isVisible ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {metric.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metric.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Gradient for PM2.5 confidence band */}
              <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis 
              dataKey="ts" 
              tickFormatter={formatTime}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            
            <YAxis 
              yAxisId="left"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ 
                value: 'PM2.5 / PM10 (µg/m³)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px', fill: '#6b7280' }
              }}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ 
                value: 'Temp (°C) / Humidity (%)', 
                angle: 90, 
                position: 'insideRight',
                style: { fontSize: '12px', fill: '#6b7280' }
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* Reference line for selected hour */}
            {selectedHour !== null && selectedHour !== undefined && data[selectedHour] && (
              <ReferenceLine 
                yAxisId="left"
                x={data[selectedHour].ts} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ 
                  value: 'Selected', 
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}

            {/* PM2.5 Confidence Band */}
            {visibleMetrics.pm25 && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="pm25_high"
                stroke="none"
                fill="url(#colorPM25)"
                fillOpacity={0.6}
                name="PM2.5 High"
              />
            )}
            
            {visibleMetrics.pm25 && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="pm25_low"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                name="PM2.5 Low"
              />
            )}

            {/* PM2.5 Main Line */}
            {visibleMetrics.pm25 && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pm25"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
                name="PM2.5 (µg/m³)"
              />
            )}

            {/* PM10 Line */}
            {visibleMetrics.pm10 && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pm10"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="5 5"
                name="PM10 (µg/m³)"
              />
            )}

            {/* Temperature Line */}
            {visibleMetrics.temp && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temp"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 3 }}
                activeDot={{ r: 5 }}
                name="Temperature (°C)"
              />
            )}

            {/* Humidity Line */}
            {visibleMetrics.humidity && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="3 3"
                name="Humidity (%)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-2 text-xs text-gray-700">
          <div className="w-4 h-4 bg-blue-200 rounded-sm mt-0.5 flex-shrink-0"></div>
          <p>
            <strong>Shaded area</strong> represents the confidence interval for PM2.5 predictions. 
            Actual values are likely to fall within this range.
          </p>
        </div>
      </div>
    </div>
  );
}
