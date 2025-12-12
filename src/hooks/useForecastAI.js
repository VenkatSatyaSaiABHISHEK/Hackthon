// File: src/hooks/useForecastAI.js
// Custom hook for AI-powered air quality forecasting

import { useState, useCallback } from 'react';
import { callGeminiAdvancedAnalysis } from '../api/geminiClient';

/**
 * Custom hook for generating air quality forecasts
 * @returns {Object} Forecast data and control functions
 */
export default function useForecastAI() {
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  /**
   * Run forecast analysis
   * @param {Object} params - Forecast parameters
   * @param {Object} params.sensorSummary - Aggregated sensor statistics
   * @param {Array} params.timeSeries - Historical time series data
   * @param {Array} params.frames - Video frame descriptions (optional)
   * @param {number} params.hours - Forecast horizon in hours (default 24)
   * @returns {Promise<Object>} Forecast results
   */
  const runForecast = useCallback(async ({ sensorSummary, timeSeries, frames = [], hours = 24 }) => {
    setStatus('loading');
    setError(null);

    try {
      // Build payload for Gemini API
      const payload = buildForecastPayload({ sensorSummary, timeSeries, frames, hours });

      // Call Gemini advanced analysis
      const result = await callGeminiAdvancedAnalysis(payload);

      // Extract forecast data
      if (!result.forecast || !Array.isArray(result.forecast)) {
        throw new Error('Invalid forecast data received from AI');
      }

      const forecastData = {
        predictions: result.forecast,
        summary: result.summary || 'No summary available',
        confidence: result.confidence || 'medium',
        generatedAt: new Date().toISOString(),
        horizon: hours
      };

      setForecast(forecastData);
      setStatus('success');
      return forecastData;

    } catch (err) {
      console.error('Forecast AI error:', err);
      setError(err.message || 'Failed to generate forecast');
      setStatus('error');
      throw err;
    }
  }, []);

  /**
   * Clear forecast data
   */
  const clearForecast = useCallback(() => {
    setForecast(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    forecast,
    status,
    error,
    runForecast,
    clearForecast,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

/**
 * Build payload for forecast request
 * @private
 * @param {Object} params - Input parameters
 * @returns {Object} Formatted payload
 */
function buildForecastPayload({ sensorSummary, timeSeries, frames, hours }) {
  // Sample last 50 readings for context (reduce payload size)
  const timeSeriesSample = timeSeries.slice(-50);

  return {
    mode: 'forecast',
    sensorSummary,
    timeSeries: timeSeriesSample,
    frames: frames.slice(0, 3), // Only send first 3 frames
    forecastHorizon: hours,
    source: 'forecast_request',
    requestedAt: new Date().toISOString()
  };
}
