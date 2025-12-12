// src/components/forecast/HourlyRibbon.jsx
import React from 'react';
import { ArrowUp, ArrowDown, Minus, Wind } from 'lucide-react';

export default function HourlyRibbon({ data, selectedHour, onSelectHour }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true 
    });
  };

  const getRiskColor = (pm25) => {
    if (pm25 <= 12) return 'bg-green-500';
    if (pm25 <= 35) return 'bg-yellow-500';
    if (pm25 <= 55) return 'bg-orange-500';
    if (pm25 <= 150) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const getRiskCategory = (pm25) => {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Unhealthy for Sensitive';
    if (pm25 <= 150) return 'Unhealthy';
    return 'Hazardous';
  };

  const getTrendIcon = (current, next) => {
    if (!next) return <Minus className="w-3 h-3 text-gray-400" />;
    const diff = next.pm25 - current.pm25;
    if (diff > 2) return <ArrowUp className="w-3 h-3 text-red-500" />;
    if (diff < -2) return <ArrowDown className="w-3 h-3 text-green-500" />;
    return <Minus className="w-3 h-3 text-blue-500" />;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <p className="text-gray-500">No hourly forecast data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-600" />
          Hourly Forecast
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          {data.length} hours ahead
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
          {data.map((point, index) => {
            const isSelected = selectedHour === index;
            const nextPoint = data[index + 1];
            
            return (
              <button
                key={index}
                onClick={() => onSelectHour && onSelectHour(index)}
                className={`flex-shrink-0 w-24 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-md scale-105'
                    : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {/* Time */}
                <div className={`text-xs font-semibold mb-2 ${
                  isSelected ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {formatTime(point.ts)}
                </div>

                {/* Trend Icon */}
                <div className="flex justify-center mb-2">
                  {getTrendIcon(point, nextPoint)}
                </div>

                {/* PM2.5 Value */}
                <div className={`text-xl font-bold mb-1 ${
                  isSelected ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {Math.round(point.pm25)}
                </div>
                <div className="text-xs text-gray-500 mb-2">µg/m³</div>

                {/* Risk Color Strip */}
                <div className="flex flex-col gap-1">
                  <div className={`h-1.5 rounded-full ${getRiskColor(point.pm25)}`}></div>
                  <div className="text-xs font-medium text-gray-600 truncate">
                    {getRiskCategory(point.pm25)}
                  </div>
                </div>

                {/* Additional Data (subtle) */}
                {point.temp && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {Math.round(point.temp)}°C
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-400 italic">
          ← Scroll to view more hours →
        </span>
      </div>
    </div>
  );
}
