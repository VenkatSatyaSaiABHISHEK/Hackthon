// src/utils/dataHelpers.js

/**
 * Data Processing Utilities for Air Quality Monitoring
 */

/**
 * Normalize value to 0-100 scale
 */
export function normalize(value, min, max) {
  if (value == null || min == null || max == null) return 0;
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Calculate mean of an array
 */
export function calculateMean(array) {
  if (!array || array.length === 0) return 0;
  const filtered = array.filter(v => v != null && !isNaN(v));
  if (filtered.length === 0) return 0;
  const sum = filtered.reduce((acc, val) => acc + val, 0);
  return sum / filtered.length;
}

/**
 * Calculate minimum value
 */
export function calculateMin(array) {
  if (!array || array.length === 0) return 0;
  const filtered = array.filter(v => v != null && !isNaN(v));
  return filtered.length > 0 ? Math.min(...filtered) : 0;
}

/**
 * Calculate maximum value
 */
export function calculateMax(array) {
  if (!array || array.length === 0) return 0;
  const filtered = array.filter(v => v != null && !isNaN(v));
  return filtered.length > 0 ? Math.max(...filtered) : 0;
}

/**
 * Detect trend in time series data
 * Returns: 'increasing' | 'decreasing' | 'stable'
 */
export function detectTrend(timeSeries) {
  if (!timeSeries || timeSeries.length < 3) return 'stable';
  
  const filtered = timeSeries.filter(v => v != null && !isNaN(v));
  if (filtered.length < 3) return 'stable';

  // Simple linear regression slope
  const n = filtered.length;
  const xMean = (n - 1) / 2;
  const yMean = calculateMean(filtered);

  let numerator = 0;
  let denominator = 0;

  filtered.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) ** 2;
  });

  const slope = numerator / denominator;
  const threshold = yMean * 0.05; // 5% of mean

  if (slope > threshold) return 'increasing';
  if (slope < -threshold) return 'decreasing';
  return 'stable';
}

/**
 * Compute Air Health Score (0-100)
 * Based on PM2.5, PM10, humidity, and noise
 * Lower pollution = Higher score
 */
export function computeAirHealthScore(pm25, pm10, humidity, noise) {
  let score = 100;

  // PM2.5 impact (WHO guideline: 5 µg/m³, unhealthy: >35)
  if (pm25 != null) {
    if (pm25 <= 5) score -= 0;
    else if (pm25 <= 12) score -= 5;
    else if (pm25 <= 35) score -= 15;
    else if (pm25 <= 55) score -= 30;
    else score -= 50;
  }

  // PM10 impact (WHO guideline: 15 µg/m³, unhealthy: >150)
  if (pm10 != null) {
    if (pm10 <= 15) score -= 0;
    else if (pm10 <= 50) score -= 5;
    else if (pm10 <= 150) score -= 15;
    else if (pm10 <= 250) score -= 25;
    else score -= 40;
  }

  // Humidity impact (ideal: 30-60%)
  if (humidity != null) {
    if (humidity < 20 || humidity > 80) score -= 10;
    else if (humidity < 30 || humidity > 70) score -= 5;
  }

  // Noise impact (ideal: <40 dB, harmful: >70 dB)
  if (noise != null) {
    if (noise <= 40) score -= 0;
    else if (noise <= 55) score -= 3;
    else if (noise <= 70) score -= 7;
    else score -= 15;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get Air Quality Category from PM2.5
 */
export function getAQICategory(pm25) {
  if (pm25 == null) return { label: 'Unknown', color: 'neutral' };
  if (pm25 <= 12) return { label: 'Good', color: 'green' };
  if (pm25 <= 35) return { label: 'Moderate', color: 'yellow' };
  if (pm25 <= 55) return { label: 'Unhealthy for Sensitive', color: 'orange' };
  if (pm25 <= 150) return { label: 'Unhealthy', color: 'red' };
  return { label: 'Hazardous', color: 'purple' };
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Extract latest value from feeds
 */
export function getLatestValue(feeds, field) {
  if (!feeds || feeds.length === 0) return null;
  const latestFeed = feeds[feeds.length - 1];
  return latestFeed[field];
}

/**
 * Extract time series from feeds
 */
export function extractTimeSeries(feeds, field, limit = 50) {
  if (!feeds || feeds.length === 0) return [];
  return feeds
    .slice(-limit)
    .map(feed => ({
      time: feed.created_at,
      value: feed[field],
    }))
    .filter(item => item.value != null);
}
