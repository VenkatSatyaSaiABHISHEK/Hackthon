// File: src/hooks/useSourceDetectionAI.js
// Custom hook for AI-powered pollution source detection

import { useState, useCallback } from 'react';
import { callGeminiAdvancedAnalysis } from '../api/geminiClient';

/**
 * Custom hook for detecting pollution sources using AI
 * @returns {Object} Source detection data and control functions
 */
export default function useSourceDetectionAI() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  /**
   * Run source detection analysis
   * @param {Object} params - Detection parameters
   * @param {Object} params.sensorSummary - Aggregated sensor statistics
   * @param {Array} params.timeSeries - Time series data with spikes
   * @param {Array} params.frames - Video frame descriptions
   * @param {Array} params.evidence - Existing evidence points (optional)
   * @returns {Promise<Object>} Detection results
   */
  const runSourceDetection = useCallback(async ({ sensorSummary, timeSeries, frames = [], evidence = [] }) => {
    setStatus('loading');
    setError(null);

    try {
      // Build payload for source detection
      const payload = buildSourceDetectionPayload({ sensorSummary, timeSeries, frames, evidence });

      // Call Gemini advanced analysis
      const aiResult = await callGeminiAdvancedAnalysis(payload);

      // Extract pollution source data
      if (!aiResult.pollution_source) {
        throw new Error('Invalid source detection data received from AI');
      }

      const sourceData = {
        primarySource: aiResult.pollution_source.primary,
        confidence: aiResult.pollution_source.confidence,
        evidence: aiResult.pollution_source.evidence || [],
        secondarySources: aiResult.pollution_source.secondary_sources || [],
        explanation: aiResult.pollution_source.explanation || '',
        detectedAt: new Date().toISOString()
      };

      setResult(sourceData);
      setStatus('success');
      return sourceData;

    } catch (err) {
      console.error('Source detection AI error:', err);
      setError(err.message || 'Failed to detect pollution source');
      setStatus('error');
      throw err;
    }
  }, []);

  /**
   * Clear detection results
   */
  const clearResult = useCallback(() => {
    setResult(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    result,
    status,
    error,
    runSourceDetection,
    clearResult,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

/**
 * Build payload for source detection request
 * @private
 * @param {Object} params - Input parameters
 * @returns {Object} Formatted payload
 */
function buildSourceDetectionPayload({ sensorSummary, timeSeries, frames, evidence }) {
  // Identify spike points (PM2.5 > 75 or PM10 > 100)
  const spikes = timeSeries.filter(entry => 
    (entry.pm25 && entry.pm25 > 75) || (entry.pm10 && entry.pm10 > 100)
  );

  // Sample spikes to reduce payload size (max 20 spikes)
  const spikeSample = spikes.slice(0, 20);

  return {
    mode: 'source_detection',
    sensorSummary,
    timeSeries: spikeSample,
    frames: frames.slice(0, 5), // Up to 5 frames for visual evidence
    evidence,
    source: 'source_detection_request',
    requestedAt: new Date().toISOString()
  };
}
