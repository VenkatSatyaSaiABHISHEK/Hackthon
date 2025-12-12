// File: src/hooks/useHealthRiskAI.js
// Custom hook for AI-powered personalized health risk assessment

import { useState, useCallback } from 'react';
import { callGeminiAdvancedAnalysis } from '../api/geminiClient';

/**
 * Custom hook for calculating personalized health risks
 * @returns {Object} Health risk data and control functions
 */
export default function useHealthRiskAI() {
  const [healthRisks, setHealthRisks] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  /**
   * Run health risk assessment
   * @param {Object} params - Assessment parameters
   * @param {Object} params.sensorSummary - Aggregated sensor statistics
   * @param {Array} params.timeSeries - Time series data
   * @param {number} params.exposureDuration - Duration of exposure in hours (optional)
   * @returns {Promise<Object>} Health risk results
   */
  const runHealthRisk = useCallback(async ({ sensorSummary, timeSeries, exposureDuration = 24 }) => {
    setStatus('loading');
    setError(null);

    try {
      // Build payload for health risk analysis
      const payload = buildHealthRiskPayload({ sensorSummary, timeSeries, exposureDuration });

      // Call Gemini advanced analysis
      const result = await callGeminiAdvancedAnalysis(payload);

      // Extract health risk groups data
      if (!result.health_risk_groups) {
        throw new Error('Invalid health risk data received from AI');
      }

      const riskData = {
        children: result.health_risk_groups.children || createDefaultRisk('children'),
        elderly: result.health_risk_groups.elderly || createDefaultRisk('elderly'),
        asthma: result.health_risk_groups.asthma || createDefaultRisk('asthma'),
        adults: result.health_risk_groups.adults || createDefaultRisk('adults'),
        assessedAt: new Date().toISOString(),
        exposureDuration
      };

      setHealthRisks(riskData);
      setStatus('success');
      return riskData;

    } catch (err) {
      console.error('Health risk AI error:', err);
      setError(err.message || 'Failed to assess health risks');
      setStatus('error');
      throw err;
    }
  }, []);

  /**
   * Clear health risk data
   */
  const clearHealthRisks = useCallback(() => {
    setHealthRisks(null);
    setStatus('idle');
    setError(null);
  }, []);

  /**
   * Get risk level for specific demographic
   * @param {string} demographic - 'children' | 'elderly' | 'asthma' | 'adults'
   * @returns {Object|null} Risk data for demographic
   */
  const getRiskForDemographic = useCallback((demographic) => {
    if (!healthRisks || !healthRisks[demographic]) return null;
    return healthRisks[demographic];
  }, [healthRisks]);

  return {
    healthRisks,
    status,
    error,
    runHealthRisk,
    clearHealthRisks,
    getRiskForDemographic,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

/**
 * Build payload for health risk request
 * @private
 * @param {Object} params - Input parameters
 * @returns {Object} Formatted payload
 */
function buildHealthRiskPayload({ sensorSummary, timeSeries, exposureDuration }) {
  // Calculate peak exposure values
  const peakPM25 = Math.max(...timeSeries.map(t => t.pm25 || 0));
  const peakPM10 = Math.max(...timeSeries.map(t => t.pm10 || 0));

  return {
    mode: 'health_risk',
    sensorSummary,
    timeSeries: timeSeries.slice(-30), // Last 30 readings for context
    exposureDuration,
    peakExposure: {
      pm25: peakPM25,
      pm10: peakPM10
    },
    source: 'health_risk_request',
    requestedAt: new Date().toISOString()
  };
}

/**
 * Create default risk object when data is missing
 * @private
 * @param {string} demographic - Demographic group name
 * @returns {Object} Default risk object
 */
function createDefaultRisk(demographic) {
  return {
    level: 'unknown',
    score: 0,
    advice: `No specific advice available for ${demographic}`,
    reasoning: 'Insufficient data to assess risk'
  };
}
