// File: src/hooks/useRoomAdvisorAI.js
// Custom hook for AI-powered room layout and ventilation recommendations

import { useState, useCallback } from 'react';
import { callGeminiAdvancedAnalysis } from '../api/geminiClient';

/**
 * Custom hook for room optimization and ventilation advice
 * @returns {Object} Room advisor data and control functions
 */
export default function useRoomAdvisorAI() {
  const [layoutSuggestions, setLayoutSuggestions] = useState(null);
  const [ventilationTips, setVentilationTips] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  /**
   * Run room layout and ventilation analysis
   * @param {Object} params - Analysis parameters
   * @param {Array} params.frames - Video frame descriptions
   * @param {Object} params.sensorSummary - Aggregated sensor statistics
   * @param {Array} params.timeSeries - Time series data
   * @param {number} params.outdoorPM25 - Outdoor PM2.5 level (optional)
   * @returns {Promise<Object>} Room advisor results
   */
  const runRoomAdvisor = useCallback(async ({ frames = [], sensorSummary, timeSeries, outdoorPM25 = null }) => {
    setStatus('loading');
    setError(null);

    try {
      // Build payload for room advisor analysis
      const payload = buildRoomAdvisorPayload({ frames, sensorSummary, timeSeries, outdoorPM25 });

      // Call Gemini advanced analysis
      const result = await callGeminiAdvancedAnalysis(payload);

      // Extract layout suggestions
      const layoutData = result.layout_suggestions ? {
        issues: result.layout_suggestions.issues || [],
        summary: result.layout_suggestions.summary || 'No layout issues detected',
        analyzedAt: new Date().toISOString()
      } : null;

      // Extract ventilation tips
      const ventilationData = result.ventilation_tips ? {
        schedule: result.ventilation_tips.schedule || [],
        summary: result.ventilation_tips.summary || 'No ventilation recommendations available',
        warnings: result.ventilation_tips.warnings || [],
        indoorOutdoorDiff: result.ventilation_tips.indoorOutdoorDiff || 0,
        analyzedAt: new Date().toISOString()
      } : null;

      setLayoutSuggestions(layoutData);
      setVentilationTips(ventilationData);
      setStatus('success');

      return {
        layout: layoutData,
        ventilation: ventilationData
      };

    } catch (err) {
      console.error('Room advisor AI error:', err);
      setError(err.message || 'Failed to analyze room layout');
      setStatus('error');
      throw err;
    }
  }, []);

  /**
   * Clear room advisor data
   */
  const clearAdvisor = useCallback(() => {
    setLayoutSuggestions(null);
    setVentilationTips(null);
    setStatus('idle');
    setError(null);
  }, []);

  /**
   * Get high-priority layout issues
   * @returns {Array} High-priority issues
   */
  const getHighPriorityIssues = useCallback(() => {
    if (!layoutSuggestions || !layoutSuggestions.issues) return [];
    return layoutSuggestions.issues.filter(issue => issue.severity === 'high');
  }, [layoutSuggestions]);

  /**
   * Get current ventilation recommendation
   * @returns {Object|null} Current time slot recommendation
   */
  const getCurrentVentilationAdvice = useCallback(() => {
    if (!ventilationTips || !ventilationTips.schedule) return null;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const currentSlot = ventilationTips.schedule.find(slot => {
      return currentTime >= slot.startTime && currentTime < slot.endTime;
    });

    return currentSlot || null;
  }, [ventilationTips]);

  return {
    layoutSuggestions,
    ventilationTips,
    status,
    error,
    runRoomAdvisor,
    clearAdvisor,
    getHighPriorityIssues,
    getCurrentVentilationAdvice,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

/**
 * Build payload for room advisor request
 * @private
 * @param {Object} params - Input parameters
 * @returns {Object} Formatted payload
 */
function buildRoomAdvisorPayload({ frames, sensorSummary, timeSeries, outdoorPM25 }) {
  // Calculate indoor/outdoor differential
  const indoorPM25 = sensorSummary?.pm25?.avg || 0;
  const differential = outdoorPM25 !== null ? indoorPM25 - outdoorPM25 : null;

  return {
    mode: 'room_advisor',
    frames: frames.slice(0, 5), // Up to 5 frames for visual analysis
    sensorSummary,
    timeSeries: timeSeries.slice(-20), // Last 20 readings
    outdoorConditions: {
      pm25: outdoorPM25,
      differential
    },
    source: 'room_advisor_request',
    requestedAt: new Date().toISOString()
  };
}
