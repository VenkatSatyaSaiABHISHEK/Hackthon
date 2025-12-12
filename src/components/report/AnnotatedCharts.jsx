// File: src/components/report/AnnotatedCharts.jsx

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { TrendingUp, Droplets, Thermometer, Wind, Volume2 } from 'lucide-react';

export default function AnnotatedCharts({ timeSeriesData, highlightedTimestamp }) {
  const [activeTab, setActiveTab] = useState('pm25');

  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No time series data available for charting</p>
      </div>
    );
  }

  const metrics = [
    { 
      key: 'pm25', 
      label: 'PM2.5', 
      color: '#dc2626', 
      unit: 'µg/m³', 
      icon: TrendingUp,
      description: 'Fine particulate matter',
      gradient: 'from-red-500 to-rose-600'
    },
    { 
      key: 'pm10', 
      label: 'PM10', 
      color: '#ea580c', 
      unit: 'µg/m³', 
      icon: Wind,
      description: 'Coarse particulate matter',
      gradient: 'from-orange-500 to-red-600'
    },
    { 
      key: 'temp', 
      label: 'Temperature', 
      color: '#0891b2', 
      unit: '°C', 
      icon: Thermometer,
      description: 'Ambient temperature',
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      key: 'humidity', 
      label: 'Humidity', 
      color: '#2563eb', 
      unit: '%', 
      icon: Droplets,
      description: 'Relative humidity',
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      key: 'noise', 
      label: 'Noise', 
      color: '#7c3aed', 
      unit: 'dB', 
      icon: Volume2,
      description: 'Sound pressure level',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  const activeMetric = metrics.find(m => m.key === activeTab) || metrics[0];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isHighlighted = label === highlightedTimestamp;
      return (
        <div className={`p-4 rounded-lg shadow-xl border-2 ${isHighlighted ? 'bg-amber-50 border-amber-400' : 'bg-white border-neutral-300'}`}>
          <p className="text-xs font-semibold text-neutral-600 mb-2">{label}</p>
          <p className={`text-lg font-bold ${isHighlighted ? 'text-amber-700' : 'text-neutral-900'}`}>
            {payload[0].value.toFixed(2)} {activeMetric.unit}
          </p>
          {isHighlighted && (
            <p className="text-xs text-amber-600 mt-1 font-semibold">⭐ Highlighted Evidence</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot renderer for evidence markers
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isHighlighted = payload.timestamp === highlightedTimestamp;

    if (isHighlighted) {
      return (
        <g>
          {/* Outer ring pulse effect */}
          <circle cx={cx} cy={cy} r={12} fill="#fbbf24" opacity={0.3} />
          <circle cx={cx} cy={cy} r={8} fill="#f59e0b" opacity={0.5} />
          {/* Main dot */}
          <circle cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
        </g>
      );
    }
    return null;
  };

  // Find highlighted data point
  const highlightedDataPoint = timeSeriesData.find(d => d.timestamp === highlightedTimestamp);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Time Series Analysis</h3>
          <p className="text-sm text-neutral-600">{timeSeriesData.length} data points</p>
        </div>
      </div>

      {/* Metric tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isActive = activeTab === metric.key;
          return (
            <button
              key={metric.key}
              onClick={() => setActiveTab(metric.key)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-emerald-300
                ${isActive
                  ? `bg-gradient-to-r ${metric.gradient} text-white shadow-lg scale-105`
                  : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:border-emerald-400 hover:shadow-md'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{metric.label}</span>
              {isActive && (
                <span className="ml-1 px-2 py-0.5 bg-white/30 rounded text-xs">
                  {metric.unit}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart container */}
      <div className="bg-white rounded-xl p-6 shadow-md border-2 border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-neutral-900">{activeMetric.label}</h4>
            <p className="text-xs text-neutral-600">{activeMetric.description}</p>
          </div>
          {highlightedTimestamp && highlightedDataPoint && (
            <div className="px-3 py-2 bg-amber-100 border-2 border-amber-400 rounded-lg">
              <p className="text-xs text-amber-700 font-semibold">Evidence Marker Active</p>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={timeSeriesData}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ 
                value: activeMetric.unit, 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6b7280', fontWeight: 600 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={activeMetric.key}
              stroke={activeMetric.color}
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: activeMetric.color, stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Highlight vertical line at evidence point */}
            {highlightedTimestamp && highlightedDataPoint && (
              <ReferenceDot
                x={highlightedTimestamp}
                y={highlightedDataPoint[activeMetric.key]}
                r={0}
                label={{ 
                  value: '📍 Evidence', 
                  position: 'top',
                  fill: '#f59e0b',
                  fontWeight: 'bold',
                  fontSize: 12
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Legend and statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            const values = timeSeriesData.map(d => d[activeMetric.key]).filter(v => v != null);
            if (values.length === 0) return null;
            
            const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
            const min = Math.min(...values).toFixed(2);
            const max = Math.max(...values).toFixed(2);
            const latest = values[values.length - 1].toFixed(2);

            return (
              <>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-neutral-600 mb-1">Average</p>
                  <p className="text-xl font-bold text-blue-700">{avg} <span className="text-sm font-normal">{activeMetric.unit}</span></p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs text-neutral-600 mb-1">Minimum</p>
                  <p className="text-xl font-bold text-green-700">{min} <span className="text-sm font-normal">{activeMetric.unit}</span></p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                  <p className="text-xs text-neutral-600 mb-1">Maximum</p>
                  <p className="text-xl font-bold text-red-700">{max} <span className="text-sm font-normal">{activeMetric.unit}</span></p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-neutral-600 mb-1">Latest</p>
                  <p className="text-xl font-bold text-purple-700">{latest} <span className="text-sm font-normal">{activeMetric.unit}</span></p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Evidence marker info */}
      {highlightedTimestamp && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-sm font-semibold text-amber-900">Evidence Point Highlighted</p>
          </div>
          <p className="text-xs text-amber-700">
            Timestamp: <span className="font-mono font-semibold">{highlightedTimestamp}</span>
          </p>
          {highlightedDataPoint && (
            <p className="text-xs text-amber-700 mt-1">
              {activeMetric.label} value: <span className="font-bold">{highlightedDataPoint[activeMetric.key]?.toFixed(2)} {activeMetric.unit}</span>
            </p>
          )}
        </div>
      )}

      {/* Chart interaction guide */}
      <div className="mt-4 p-3 bg-emerald-100 rounded-lg border border-emerald-300">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold">Tip:</span> Hover over the chart for detailed values. Switch between metrics using the tabs above.
        </p>
      </div>
    </div>
  );
}
