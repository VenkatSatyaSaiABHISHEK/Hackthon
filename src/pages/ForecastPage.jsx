// src/pages/ForecastPage.jsx
import React, { useState, useEffect } from 'react';
import { Play, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import ForecastHero from '../components/forecast/ForecastHero';
import HourlyRibbon from '../components/forecast/HourlyRibbon';
import MainForecastChart from '../components/forecast/MainForecastChart';
import { getThingSpeakCredentials } from '../firebase/config';

// ============================================================
// 📊 DEMO FORECAST DATA (Fallback)
// ============================================================
const generateDemoForecast = (hours = 24) => {
  const baseTime = new Date();
  const data = [];
  
  // Starting values
  let pm25 = 45 + Math.random() * 20;
  let pm10 = 85 + Math.random() * 30;
  let temp = 25 + Math.random() * 5;
  let humidity = 55 + Math.random() * 15;

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
    
    // Add realistic variations
    pm25 += (Math.random() - 0.5) * 8;
    pm10 += (Math.random() - 0.5) * 12;
    temp += (Math.random() - 0.5) * 2;
    humidity += (Math.random() - 0.5) * 4;

    // Keep within realistic bounds
    pm25 = Math.max(10, Math.min(150, pm25));
    pm10 = Math.max(20, Math.min(250, pm10));
    temp = Math.max(18, Math.min(38, temp));
    humidity = Math.max(30, Math.min(90, humidity));

    data.push({
      ts: timestamp.toISOString(),
      pm25: parseFloat(pm25.toFixed(1)),
      pm25_low: parseFloat((pm25 * 0.85).toFixed(1)),
      pm25_high: parseFloat((pm25 * 1.15).toFixed(1)),
      pm10: parseFloat(pm10.toFixed(1)),
      temp: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(0))
    });
  }

  return data;
};

// ============================================================
// 🎯 MAIN FORECAST PAGE COMPONENT
// ============================================================
export default function ForecastPage() {
  // State Management
  const [forecastData, setForecastData] = useState(null);
  const [horizon, setHorizon] = useState('24'); // 12, 24, 48
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [error, setError] = useState(null);

  // Check for ThingSpeak credentials
  const thingSpeakCreds = getThingSpeakCredentials();

  // ============================================================
  // 🚀 RUN FORECAST FUNCTION
  // ============================================================
  const runForecast = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Generate demo forecast based on selected horizon
      const hoursCount = parseInt(horizon);
      const demoData = generateDemoForecast(hoursCount);
      
      setForecastData(demoData);
      setSelectedHour(0); // Select first hour by default
      
      // TODO: Replace with real AI forecast
      // const result = await useForecastAI(horizon);
      // setForecastData(result);
      
    } catch (err) {
      console.error('Forecast generation failed:', err);
      setError('Failed to generate forecast. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // 📊 COMPUTE CURRENT STATE FOR HERO CARD
  // ============================================================
  const getCurrentState = () => {
    if (!forecastData || forecastData.length === 0) {
      return {
        value: 0,
        unit: 'µg/m³',
        trend: 'stable',
        category: 'good'
      };
    }

    const current = forecastData[0];
    const next = forecastData[1];
    
    let trend = 'stable';
    if (next) {
      const diff = next.pm25 - current.pm25;
      if (diff > 3) trend = 'up';
      else if (diff < -3) trend = 'down';
    }

    let category = 'good';
    if (current.pm25 > 55) category = 'unhealthy';
    else if (current.pm25 > 35) category = 'moderate';
    else if (current.pm25 > 12) category = 'moderate';

    return {
      value: Math.round(current.pm25),
      unit: 'µg/m³',
      trend,
      category
    };
  };

  const getSummary = () => {
    if (!forecastData || forecastData.length === 0) {
      return 'Run a forecast to see AI-powered air quality predictions for the next 12-48 hours.';
    }

    const current = forecastData[0];
    const last = forecastData[forecastData.length - 1];
    const trend = last.pm25 > current.pm25 ? 'increase' : 'decrease';
    const change = Math.abs(last.pm25 - current.pm25).toFixed(0);

    return `Expecting ${trend} of ${change} µg/m³ over the next ${horizon} hours. Air quality may ${trend === 'increase' ? 'worsen' : 'improve'} throughout the period.`;
  };

  const getConfidence = () => {
    if (!forecastData) return 'medium';
    
    // Simple confidence based on data availability
    if (thingSpeakCreds) return 'high';
    return 'medium';
  };

  // ============================================================
  // 🎨 RENDER UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto pt-20">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                AI Forecast
              </h1>
              <p className="text-gray-600 mt-1">
                Predict air quality for the next 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Forecast Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Forecast Horizon
              </label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
              </select>
            </div>

            <button
              onClick={runForecast}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Forecast...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Forecast
                </>
              )}
            </button>
          </div>

          {/* Info Banner */}
          {!thingSpeakCreds && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Connect your ThingSpeak sensor in the Dashboard for real-time forecasts based on your actual data.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        {!forecastData ? (
          // No Forecast Available State
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Forecast Available
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Click "Run Forecast" to generate AI predictions
            </p>
          </div>
        ) : (
          // Forecast Content
          <div className="space-y-6">
            {/* Hero Card */}
            <ForecastHero
              current={getCurrentState()}
              summary={getSummary()}
              confidence={getConfidence()}
            />

            {/* Hourly Ribbon */}
            <HourlyRibbon
              data={forecastData}
              selectedHour={selectedHour}
              onSelectHour={setSelectedHour}
            />

            {/* Main Chart */}
            <MainForecastChart
              data={forecastData}
              selectedHour={selectedHour}
            />

            {/* Insights Footer */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                📊 Forecast Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-sm text-gray-600 mb-1">Peak PM2.5</div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {Math.max(...forecastData.map(d => d.pm25)).toFixed(0)} µg/m³
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    at {formatTime(forecastData.reduce((max, d) => d.pm25 > max.pm25 ? d : max).ts)}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-sm text-gray-600 mb-1">Best Quality</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.min(...forecastData.map(d => d.pm25)).toFixed(0)} µg/m³
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    at {formatTime(forecastData.reduce((min, d) => d.pm25 < min.pm25 ? d : min).ts)}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                  <div className="text-sm text-gray-600 mb-1">Average</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(forecastData.reduce((sum, d) => sum + d.pm25, 0) / forecastData.length).toFixed(0)} µg/m³
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    over {horizon} hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
}
