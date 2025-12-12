// src/components/forecast/ForecastHero.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Wind, Sparkles } from 'lucide-react';

export default function ForecastHero({ current, summary, confidence }) {
  const { value, unit, trend, category } = current || {
    value: 0,
    unit: 'µg/m³',
    trend: 'stable',
    category: 'good'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-6 h-6 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="w-6 h-6 text-green-500" />;
    return <Wind className="w-6 h-6 text-blue-500" />;
  };

  const getConfidencePill = () => {
    const styles = {
      high: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-orange-100 text-orange-700 border-orange-300'
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${styles[confidence] || styles.medium}`}>
        <Sparkles className="w-3.5 h-3.5" />
        {confidence ? `${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence` : 'Medium Confidence'}
      </div>
    );
  };

  const getCategoryColor = () => {
    const colors = {
      good: 'text-green-600',
      moderate: 'text-yellow-600',
      poor: 'text-orange-600',
      unhealthy: 'text-red-600',
      hazardous: 'text-purple-600'
    };
    return colors[category] || 'text-blue-600';
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-blue-100">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Current Air Quality
            </h2>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getCategoryColor()}`}>
                {value}
              </span>
              <span className="text-2xl font-medium text-gray-500">
                {unit}
              </span>
              <div className="ml-2">
                {getTrendIcon()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {getConfidencePill()}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
        <p className="text-gray-700 text-base leading-relaxed">
          {summary || 'AI forecast will predict air quality trends for the next 24 hours based on historical patterns and current conditions.'}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Live Data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>AI-Powered Predictions</span>
        </div>
      </div>
    </div>
  );
}
