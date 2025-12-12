// src/lib/api.js

/**
 * API Helper Functions
 * 
 * 🔴 SECURITY WARNING: In production, ALL API calls must go through a server-side proxy
 * Never expose API keys in client-side code or commit them to version control
 * 
 * TODO: Move all API calls to backend routes:
 * - POST /api/thingspeak/fetch
 * - GET /api/openaq/city/:city
 * - POST /api/gemini/analyze
 */

/**
 * Fetch ThingSpeak channel data
 * 
 * @param {string|number} channelId - ThingSpeak channel ID
 * @param {string} apiKey - Read API key
 * @param {number} results - Number of results to fetch (default 100)
 * @returns {Promise<Object>} - { channel, feeds }
 * @throws {Error} - Friendly error messages
 */
export async function fetchThingSpeak(channelId, apiKey, results = 100) {
  if (!channelId || !apiKey) {
    throw new Error('Channel ID and API Key are required');
  }

  // 🔴 TODO: Replace with backend proxy call
  // const response = await fetch('/api/thingspeak/fetch', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ channelId, apiKey, results })
  // });

  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key or unauthorized access');
      } else if (response.status === 404) {
        throw new Error('Channel not found. Please verify your Channel ID');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes');
      } else {
        throw new Error(`ThingSpeak API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    if (!data.feeds || data.feeds.length === 0) {
      throw new Error('No data available from this channel. Please check if your sensors are sending data');
    }
    
    return {
      channel: data.channel,
      feeds: data.feeds,
    };
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection');
    }
    throw error;
  }
}

/**
 * Fetch air quality data from OpenAQ (satellite/external provider)
 * 
 * @param {string} location - City name or coordinates
 * @returns {Promise<Object>} - Normalized air quality data
 */
export async function fetchOpenAQ(location) {
  // 🔴 TODO: Implement OpenAQ API integration via backend proxy
  // const response = await fetch(`/api/openaq/location/${encodeURIComponent(location)}`);
  
  // Placeholder implementation
  console.log('fetchOpenAQ called for:', location);
  
  // Mock data structure for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        location,
        measurements: [
          { parameter: 'pm25', value: 15.3, unit: 'µg/m³', lastUpdated: new Date().toISOString() },
          { parameter: 'pm10', value: 28.7, unit: 'µg/m³', lastUpdated: new Date().toISOString() },
        ],
        coordinates: { latitude: 0, longitude: 0 },
      });
    }, 1000);
  });
}

/**
 * Fetch air quality data from WAQI (World Air Quality Index)
 * 
 * @param {string} city - City name
 * @returns {Promise<Object>} - Air quality index data
 */
export async function fetchWAQI(city) {
  // 🔴 TODO: Implement WAQI API integration via backend proxy
  // Requires WAQI API token (get from https://aqicn.org/api/)
  
  console.log('fetchWAQI called for:', city);
  
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        city,
        aqi: 68,
        dominentpol: 'pm25',
        time: new Date().toISOString(),
        iaqi: {
          pm25: { v: 25 },
          pm10: { v: 38 },
          t: { v: 24.8 },
          h: { v: 45 },
        },
      });
    }, 1000);
  });
}

/**
 * Test helper: Validate ThingSpeak credentials without fetching full data
 */
export async function testThingSpeakConnection(channelId, apiKey) {
  try {
    const data = await fetchThingSpeak(channelId, apiKey, 1);
    return {
      success: true,
      channelName: data.channel.name,
      lastUpdate: data.feeds[0]?.created_at,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  fetchThingSpeak,
  fetchOpenAQ,
  fetchWAQI,
  testThingSpeakConnection,
};
