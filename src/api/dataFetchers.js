// File: src/api/dataFetchers.js
// Data fetching and normalization utilities for multiple sources

import Papa from 'papaparse';
import axios from 'axios';

/**
 * Fetch data from ThingSpeak IoT platform
 * @param {string} channelId - ThingSpeak channel ID
 * @param {string} readApiKey - Read API key for the channel
 * @param {number} results - Number of results to fetch (default 200)
 * @returns {Promise<Object>} Normalized data object
 */
export async function fetchThingSpeak(channelId, readApiKey, results = 200) {
  try {
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=${results}`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.data || !response.data.feeds) {
      throw new Error('Invalid ThingSpeak response structure');
    }

    const { channel, feeds } = response.data;
    
    // Map ThingSpeak fields to standardized metrics
    const fieldMapping = detectThingSpeakFields(channel);
    
    // Normalize time series data
    const timeSeries = feeds
      .map((feed, index) => {
        const entry = {
          timestamp: feed.created_at,
          index
        };

        // Map each field dynamically
        if (fieldMapping.pm25) entry.pm25 = parseFloat(feed[fieldMapping.pm25]) || null;
        if (fieldMapping.pm10) entry.pm10 = parseFloat(feed[fieldMapping.pm10]) || null;
        if (fieldMapping.temperature) entry.temperature = parseFloat(feed[fieldMapping.temperature]) || null;
        if (fieldMapping.humidity) entry.humidity = parseFloat(feed[fieldMapping.humidity]) || null;
        if (fieldMapping.noise) entry.noise = parseFloat(feed[fieldMapping.noise]) || null;
        if (fieldMapping.co2) entry.co2 = parseFloat(feed[fieldMapping.co2]) || null;

        return entry;
      })
      .filter(entry => {
        // Remove entries with all null values (except timestamp)
        const hasData = Object.keys(entry).some(key => 
          key !== 'timestamp' && key !== 'index' && entry[key] !== null
        );
        return hasData;
      });

    // Calculate summary statistics
    const sensorSummary = calculateSummary(timeSeries);

    return {
      source: 'thingspeak',
      sourceDetails: {
        channelId,
        channelName: channel.name || 'Unknown Channel',
        description: channel.description || '',
        lastFetched: new Date().toISOString(),
        sampleCount: timeSeries.length,
        fieldMapping
      },
      timeSeries,
      sensorSummary,
      meta: {
        originalCount: feeds.length,
        cleanedCount: timeSeries.length,
        droppedCount: feeds.length - timeSeries.length
      }
    };

  } catch (error) {
    console.error('ThingSpeak fetch error:', error.message);
    throw new Error(`Failed to fetch ThingSpeak data: ${error.message}`);
  }
}

/**
 * Detect which ThingSpeak fields contain which metrics
 * @private
 * @param {Object} channel - ThingSpeak channel metadata
 * @returns {Object} Field mapping
 */
function detectThingSpeakFields(channel) {
  const mapping = {};
  
  for (let i = 1; i <= 8; i++) {
    const fieldName = (channel[`field${i}`] || '').toLowerCase();
    
    if (fieldName.includes('pm2.5') || fieldName.includes('pm25')) {
      mapping.pm25 = `field${i}`;
    } else if (fieldName.includes('pm10') || fieldName.includes('pm 10')) {
      mapping.pm10 = `field${i}`;
    } else if (fieldName.includes('temp') || fieldName.includes('temperature')) {
      mapping.temperature = `field${i}`;
    } else if (fieldName.includes('humid') || fieldName.includes('moisture')) {
      mapping.humidity = `field${i}`;
    } else if (fieldName.includes('noise') || fieldName.includes('sound') || fieldName.includes('db')) {
      mapping.noise = `field${i}`;
    } else if (fieldName.includes('co2') || fieldName.includes('carbon dioxide')) {
      mapping.co2 = `field${i}`;
    }
  }

  return mapping;
}

/**
 * Fetch air quality data from OpenAQ public API
 * @param {string} city - City name
 * @param {Array<string>} parameters - Parameters to fetch (default ['pm25', 'pm10'])
 * @param {number} limit - Max results per parameter (default 200)
 * @returns {Promise<Object>} Normalized data object
 */
export async function fetchOpenAQ(city, parameters = ['pm25', 'pm10'], limit = 200) {
  try {
    const baseUrl = 'https://api.openaq.org/v2/measurements';
    
    // Fetch data for each parameter
    const promises = parameters.map(param => {
      const paramName = param === 'pm25' ? 'pm25' : param === 'pm10' ? 'pm10' : param;
      const url = `${baseUrl}?city=${encodeURIComponent(city)}&parameter=${paramName}&limit=${limit}&order_by=datetime&sort=desc`;
      
      return axios.get(url, {
        timeout: 15000,
        headers: { 'Accept': 'application/json' }
      });
    });

    const responses = await Promise.all(promises);
    
    // Combine and normalize data
    const allMeasurements = [];
    const stations = new Set();

    responses.forEach((response, idx) => {
      if (response.data && response.data.results) {
        response.data.results.forEach(result => {
          stations.add(result.location);
          allMeasurements.push({
            timestamp: result.date.utc,
            parameter: parameters[idx],
            value: result.value,
            unit: result.unit,
            location: result.location
          });
        });
      }
    });

    // Group by timestamp
    const timeSeriesMap = {};
    allMeasurements.forEach(m => {
      if (!timeSeriesMap[m.timestamp]) {
        timeSeriesMap[m.timestamp] = { timestamp: m.timestamp };
      }
      timeSeriesMap[m.timestamp][m.parameter] = m.value;
    });

    const timeSeries = Object.values(timeSeriesMap)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((entry, index) => ({ ...entry, index }));

    const sensorSummary = calculateSummary(timeSeries);

    return {
      source: 'openaq',
      sourceDetails: {
        city,
        stations: Array.from(stations),
        parameters,
        lastFetched: new Date().toISOString(),
        sampleCount: timeSeries.length
      },
      timeSeries,
      sensorSummary,
      meta: {
        originalCount: allMeasurements.length,
        cleanedCount: timeSeries.length
      }
    };

  } catch (error) {
    console.error('OpenAQ fetch error:', error.message);
    throw new Error(`Failed to fetch OpenAQ data: ${error.message}`);
  }
}

/**
 * Parse uploaded CSV file and normalize data
 * @param {File} file - CSV file object
 * @returns {Promise<Object>} Normalized data object
 */
export async function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error('CSV file is empty or invalid');
          }

          // Detect column mapping
          const headers = Object.keys(results.data[0]);
          const columnMapping = detectCsvColumns(headers);

          // Normalize data
          const timeSeries = results.data
            .map((row, index) => {
              const entry = { index };

              // Map timestamp
              if (columnMapping.timestamp) {
                entry.timestamp = row[columnMapping.timestamp];
              } else {
                entry.timestamp = new Date(Date.now() - (results.data.length - index) * 60000).toISOString();
              }

              // Map metrics
              if (columnMapping.pm25) {
                const val = parseFloat(row[columnMapping.pm25]);
                entry.pm25 = !isNaN(val) ? val : null;
              }
              if (columnMapping.pm10) {
                const val = parseFloat(row[columnMapping.pm10]);
                entry.pm10 = !isNaN(val) ? val : null;
              }
              if (columnMapping.temperature) {
                const val = parseFloat(row[columnMapping.temperature]);
                entry.temperature = !isNaN(val) ? val : null;
              }
              if (columnMapping.humidity) {
                const val = parseFloat(row[columnMapping.humidity]);
                entry.humidity = !isNaN(val) ? val : null;
              }
              if (columnMapping.noise) {
                const val = parseFloat(row[columnMapping.noise]);
                entry.noise = !isNaN(val) ? val : null;
              }
              if (columnMapping.co2) {
                const val = parseFloat(row[columnMapping.co2]);
                entry.co2 = !isNaN(val) ? val : null;
              }

              return entry;
            })
            .filter(entry => {
              // Remove rows with all null metric values
              const hasData = Object.keys(entry).some(key => 
                key !== 'timestamp' && key !== 'index' && entry[key] !== null
              );
              return hasData;
            });

          // Calculate date range
          const timestamps = timeSeries.map(t => new Date(t.timestamp)).filter(d => !isNaN(d));
          const dateRange = timestamps.length > 0 ? {
            start: new Date(Math.min(...timestamps)).toISOString(),
            end: new Date(Math.max(...timestamps)).toISOString()
          } : null;

          const sensorSummary = calculateSummary(timeSeries);

          resolve({
            source: 'csv',
            sourceDetails: {
              filename: file.name,
              fileSize: file.size,
              totalRows: results.data.length,
              dateRange,
              columnMapping,
              lastFetched: new Date().toISOString(),
              sampleCount: timeSeries.length
            },
            timeSeries,
            sensorSummary,
            meta: {
              originalCount: results.data.length,
              cleanedCount: timeSeries.length,
              droppedCount: results.data.length - timeSeries.length,
              errors: results.errors || []
            }
          });

        } catch (error) {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

/**
 * Detect CSV column names for each metric
 * @private
 * @param {Array<string>} headers - CSV column headers
 * @returns {Object} Column mapping
 */
function detectCsvColumns(headers) {
  const mapping = {};

  headers.forEach(header => {
    const lower = header.toLowerCase().trim();

    // Timestamp detection
    if (!mapping.timestamp && (
      lower.includes('time') || 
      lower.includes('date') || 
      lower === 'timestamp' ||
      lower === 'created_at' ||
      lower === 'datetime'
    )) {
      mapping.timestamp = header;
    }

    // PM2.5 detection
    if (!mapping.pm25 && (
      lower.includes('pm2.5') || 
      lower.includes('pm25') ||
      lower === 'pm 2.5' ||
      lower.includes('field1') && !mapping.pm10
    )) {
      mapping.pm25 = header;
    }

    // PM10 detection
    if (!mapping.pm10 && (
      lower.includes('pm10') || 
      lower.includes('pm 10') ||
      lower.includes('field2') && mapping.pm25
    )) {
      mapping.pm10 = header;
    }

    // Temperature detection
    if (!mapping.temperature && (
      lower.includes('temp') || 
      lower.includes('temperature') ||
      lower.includes('field3')
    )) {
      mapping.temperature = header;
    }

    // Humidity detection
    if (!mapping.humidity && (
      lower.includes('humid') || 
      lower.includes('moisture') ||
      lower.includes('field4')
    )) {
      mapping.humidity = header;
    }

    // Noise detection
    if (!mapping.noise && (
      lower.includes('noise') || 
      lower.includes('sound') ||
      lower.includes('db') ||
      lower.includes('decibel') ||
      lower.includes('field5')
    )) {
      mapping.noise = header;
    }

    // CO2 detection
    if (!mapping.co2 && (
      lower.includes('co2') || 
      lower.includes('carbon') ||
      lower.includes('field6')
    )) {
      mapping.co2 = header;
    }
  });

  return mapping;
}

/**
 * Calculate summary statistics for time series data
 * @private
 * @param {Array<Object>} timeSeries - Time series data
 * @returns {Object} Summary statistics
 */
function calculateSummary(timeSeries) {
  const metrics = ['pm25', 'pm10', 'temperature', 'humidity', 'noise', 'co2'];
  const summary = {};

  metrics.forEach(metric => {
    const values = timeSeries
      .map(entry => entry[metric])
      .filter(val => val !== null && val !== undefined && !isNaN(val));

    if (values.length > 0) {
      summary[metric] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length,
        unit: getUnit(metric)
      };
    }
  });

  return summary;
}

/**
 * Get standard unit for a metric
 * @private
 * @param {string} metric - Metric name
 * @returns {string} Unit
 */
function getUnit(metric) {
  const units = {
    pm25: 'µg/m³',
    pm10: 'µg/m³',
    temperature: '°C',
    humidity: '%',
    noise: 'dB',
    co2: 'ppm'
  };
  return units[metric] || '';
}

/**
 * Clean and interpolate missing values in time series
 * @param {Array<Object>} timeSeries - Time series data
 * @param {string} method - Interpolation method ('linear' | 'forward_fill' | 'drop')
 * @returns {Array<Object>} Cleaned time series
 */
export function cleanTimeSeries(timeSeries, method = 'linear') {
  if (!timeSeries || timeSeries.length === 0) return [];

  const metrics = ['pm25', 'pm10', 'temperature', 'humidity', 'noise', 'co2'];
  
  if (method === 'drop') {
    // Remove rows with any null values
    return timeSeries.filter(entry => {
      return metrics.every(metric => entry[metric] === null || entry[metric] !== null);
    });
  }

  const cleaned = [...timeSeries];

  metrics.forEach(metric => {
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i][metric] === null || cleaned[i][metric] === undefined) {
        
        if (method === 'forward_fill') {
          // Use previous valid value
          let prevValue = null;
          for (let j = i - 1; j >= 0; j--) {
            if (cleaned[j][metric] !== null) {
              prevValue = cleaned[j][metric];
              break;
            }
          }
          cleaned[i][metric] = prevValue;
          
        } else if (method === 'linear') {
          // Linear interpolation
          let prevIdx = -1, nextIdx = -1;
          
          // Find previous valid value
          for (let j = i - 1; j >= 0; j--) {
            if (cleaned[j][metric] !== null) {
              prevIdx = j;
              break;
            }
          }
          
          // Find next valid value
          for (let j = i + 1; j < cleaned.length; j++) {
            if (cleaned[j][metric] !== null) {
              nextIdx = j;
              break;
            }
          }

          if (prevIdx >= 0 && nextIdx >= 0) {
            const prevVal = cleaned[prevIdx][metric];
            const nextVal = cleaned[nextIdx][metric];
            const ratio = (i - prevIdx) / (nextIdx - prevIdx);
            cleaned[i][metric] = prevVal + (nextVal - prevVal) * ratio;
          } else if (prevIdx >= 0) {
            cleaned[i][metric] = cleaned[prevIdx][metric];
          } else if (nextIdx >= 0) {
            cleaned[i][metric] = cleaned[nextIdx][metric];
          }
        }
      }
    }
  });

  return cleaned;
}

export default {
  fetchThingSpeak,
  fetchOpenAQ,
  parseCsvFile,
  cleanTimeSeries
};
