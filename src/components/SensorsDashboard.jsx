// src/components/SensorsDashboard.jsx

/**
 * Main Sensors Dashboard Component
 * Displays metrics, charts, and Air Health Score gauge
 */

import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ReactApexChart from 'react-apexcharts';
import { Wind, Droplets, Thermometer, Volume2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  calculateMean,
  calculateMin,
  calculateMax,
  detectTrend,
  computeAirHealthScore,
  getAQICategory,
  formatTimestamp,
  extractTimeSeries,
} from '../utils/dataHelpers';

export default function SensorsDashboard({ data }) {
  const { feeds, fieldMapping, source } = data;

  console.log('SensorsDashboard received data:', { feeds: feeds?.length, fieldMapping, source });

  // Extract field names
  const getField = (feed, field) => {
    // First check if the field exists directly (for CSV/AQI data)
    if (feed && field in feed && feed[field] != null) {
      return parseFloat(feed[field]);
    }
    
    // Then check field mapping (for ThingSpeak data)
    if (fieldMapping && fieldMapping[field]) {
      const mappedField = fieldMapping[field];
      if (feed && mappedField in feed && feed[mappedField] != null) {
        return parseFloat(feed[mappedField]);
      }
    }
    
    return null;
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const pm25Values = feeds.map(f => getField(f, 'pm25')).filter(v => v != null);
    const pm10Values = feeds.map(f => getField(f, 'pm10')).filter(v => v != null);
    const tempValues = feeds.map(f => getField(f, 'temperature')).filter(v => v != null);
    const humidityValues = feeds.map(f => getField(f, 'humidity')).filter(v => v != null);
    const noiseValues = feeds.map(f => getField(f, 'noise')).filter(v => v != null);

    return {
      pm25: {
        current: pm25Values.length > 0 ? pm25Values[pm25Values.length - 1] : null,
        mean: calculateMean(pm25Values),
        min: calculateMin(pm25Values),
        max: calculateMax(pm25Values),
        trend: detectTrend(pm25Values),
      },
      pm10: {
        current: pm10Values.length > 0 ? pm10Values[pm10Values.length - 1] : null,
        mean: calculateMean(pm10Values),
        min: calculateMin(pm10Values),
        max: calculateMax(pm10Values),
        trend: detectTrend(pm10Values),
      },
      temperature: {
        current: tempValues.length > 0 ? tempValues[tempValues.length - 1] : null,
        mean: calculateMean(tempValues),
        min: calculateMin(tempValues),
        max: calculateMax(tempValues),
        trend: detectTrend(tempValues),
      },
      humidity: {
        current: humidityValues.length > 0 ? humidityValues[humidityValues.length - 1] : null,
        mean: calculateMean(humidityValues),
        min: calculateMin(humidityValues),
        max: calculateMax(humidityValues),
        trend: detectTrend(humidityValues),
      },
      noise: {
        current: noiseValues.length > 0 ? noiseValues[noiseValues.length - 1] : null,
        mean: calculateMean(noiseValues),
        min: calculateMin(noiseValues),
        max: calculateMax(noiseValues),
        trend: detectTrend(noiseValues),
      },
    };
  }, [feeds, fieldMapping]);

  // Air Health Score
  const airHealthScore = useMemo(() => {
    return computeAirHealthScore(
      metrics.pm25.current,
      metrics.pm10.current,
      metrics.humidity.current,
      metrics.noise.current
    );
  }, [metrics]);

  // AQI Category
  const aqiCategory = useMemo(() => {
    return getAQICategory(metrics.pm25.current);
  }, [metrics.pm25.current]);

  // Chart data (last 50 points)
  const chartData = useMemo(() => {
    return feeds.slice(-50).map((feed, idx) => ({
      index: idx,
      time: formatTimestamp(feed.created_at),
      pm25: getField(feed, 'pm25'),
      pm10: getField(feed, 'pm10'),
      temperature: getField(feed, 'temperature'),
      humidity: getField(feed, 'humidity'),
      noise: getField(feed, 'noise'),
    }));
  }, [feeds]);

  // ApexCharts Gauge Configuration
  const gaugeOptions = {
    chart: {
      type: 'radialBar',
      height: 280,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '65%',
        },
        track: {
          background: '#e0e0e0',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: {
            fontSize: '16px',
            color: '#374151',
            offsetY: -10,
          },
          value: {
            fontSize: '32px',
            color: '#111827',
            fontWeight: 'bold',
            formatter: (val) => Math.round(val),
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: airHealthScore >= 70 ? ['#10b981'] : airHealthScore >= 40 ? ['#f59e0b'] : ['#ef4444'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Air Health'],
  };

  const gaugeSeries = [airHealthScore];

  const TrendIcon = ({ trend }) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-neutral-400" />;
  };

  const MetricCard = ({ icon: Icon, title, value, unit, color, metric }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 border border-white/20 shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <TrendIcon trend={metric.trend} />
      </div>
      <h3 className="text-sm font-semibold text-white/80 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2">
        {value != null ? value.toFixed(1) : '--'}
        <span className="text-lg ml-1">{unit}</span>
      </p>
      <div className="flex items-center gap-3 text-xs text-white/70">
        <span>Avg: {metric.mean.toFixed(1)}</span>
        <span>•</span>
        <span>Min: {metric.min.toFixed(1)}</span>
        <span>•</span>
        <span>Max: {metric.max.toFixed(1)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Air Quality Dashboard</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Data Source: <span className="font-semibold capitalize">{source}</span> • {feeds.length} readings
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-semibold ${
          aqiCategory.color === 'green' ? 'bg-green-100 text-green-800' :
          aqiCategory.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          aqiCategory.color === 'orange' ? 'bg-orange-100 text-orange-800' :
          aqiCategory.color === 'red' ? 'bg-red-100 text-red-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {aqiCategory.label}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Wind}
          title="PM2.5"
          value={metrics.pm25.current}
          unit="µg/m³"
          color="from-blue-500 to-cyan-600"
          metric={metrics.pm25}
        />
        <MetricCard
          icon={Wind}
          title="PM10"
          value={metrics.pm10.current}
          unit="µg/m³"
          color="from-indigo-500 to-purple-600"
          metric={metrics.pm10}
        />
        <MetricCard
          icon={Thermometer}
          title="Temperature"
          value={metrics.temperature.current}
          unit="°C"
          color="from-orange-500 to-red-600"
          metric={metrics.temperature}
        />
        <MetricCard
          icon={Droplets}
          title="Humidity"
          value={metrics.humidity.current}
          unit="%"
          color="from-teal-500 to-emerald-600"
          metric={metrics.humidity}
        />
      </div>

      {/* Air Health Score Gauge */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">Air Health Score</h3>
        <div className="flex items-center justify-center">
          <ReactApexChart
            options={gaugeOptions}
            series={gaugeSeries}
            type="radialBar"
            height={280}
          />
        </div>
        <p className="text-center text-sm text-neutral-600 mt-2">
          {airHealthScore >= 80 ? 'Excellent air quality' :
           airHealthScore >= 60 ? 'Good air quality' :
           airHealthScore >= 40 ? 'Moderate air quality' :
           airHealthScore >= 20 ? 'Poor air quality' :
           'Hazardous air quality'}
        </p>
      </div>

      {/* PM2.5 Time Series Chart */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">PM2.5 Levels</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="pm25" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPM25)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* PM10 Time Series Chart */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">PM10 Levels</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="pm10" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPM10)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature & Humidity Combined Chart */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Temperature & Humidity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} name="Temp (°C)" />
            <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2} name="Humidity (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Noise Levels Chart */}
      {metrics.noise.current != null && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Noise Levels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="noise" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
