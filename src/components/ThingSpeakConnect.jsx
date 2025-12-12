import React, { useState, useEffect, useCallback, useRef } from 'react';
import Lottie from 'lottie-react';
import { Cloud, Link as LinkIcon, Wifi, AlertCircle, CheckCircle2, X, HelpCircle, Loader2 } from 'lucide-react';

// TODO: Move API keys to server-side proxy for production
// WARNING: Never commit API keys to version control

/**
 * Fetch ThingSpeak channel data
 * @param {string|number} channelId - ThingSpeak channel ID
 * @param {string} apiKey - Read API key
 * @param {number} results - Number of results to fetch (default 100)
 * @returns {Promise<Object>} - Parsed JSON response with channel and feeds
 */
export async function fetchChannelData(channelId, apiKey, results = 100) {
  if (!channelId || !apiKey) {
    throw new Error('Channel ID and API Key are required');
  }

  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key or unauthorized access');
      } else if (response.status === 404) {
        throw new Error('Channel not found. Please check your Channel ID');
      } else {
        throw new Error(`ThingSpeak API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    if (!data.feeds || data.feeds.length === 0) {
      throw new Error('No data available from this channel');
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection');
    }
    throw error;
  }
}

/**
 * Parse and map ThingSpeak fields to sensor data
 * @param {Object} channelData - Raw ThingSpeak response
 * @returns {Object} - Mapped sensor data with summary
 */
function parseThingSpeakData(channelData) {
  const { channel, feeds } = channelData;
  
  // Automatic field mapping based on channel field labels
  const fieldMapping = {};
  
  // Try to detect fields from channel metadata
  for (let i = 1; i <= 8; i++) {
    const fieldName = channel[`field${i}`];
    if (fieldName) {
      const lowerName = fieldName.toLowerCase();
      if (lowerName.includes('pm2.5') || lowerName.includes('pm25')) {
        fieldMapping.pm25 = `field${i}`;
      } else if (lowerName.includes('pm10')) {
        fieldMapping.pm10 = `field${i}`;
      } else if (lowerName.includes('temp')) {
        fieldMapping.temperature = `field${i}`;
      } else if (lowerName.includes('humid')) {
        fieldMapping.humidity = `field${i}`;
      } else if (lowerName.includes('noise') || lowerName.includes('sound')) {
        fieldMapping.noise = `field${i}`;
      }
    }
  }
  
  // Fallback to default mapping if auto-detection failed
  if (Object.keys(fieldMapping).length === 0) {
    fieldMapping.pm25 = 'field1';
    fieldMapping.pm10 = 'field2';
    fieldMapping.temperature = 'field3';
    fieldMapping.humidity = 'field4';
    fieldMapping.noise = 'field5';
  }
  
  // Calculate summary statistics
  const validFeeds = feeds.filter(f => f.created_at);
  const summary = {
    records: validFeeds.length,
    last_reading: validFeeds[validFeeds.length - 1]?.created_at || null,
    pm25_mean: calculateMean(validFeeds, fieldMapping.pm25),
    pm10_mean: calculateMean(validFeeds, fieldMapping.pm10),
    temp_mean: calculateMean(validFeeds, fieldMapping.temperature),
    humidity_mean: calculateMean(validFeeds, fieldMapping.humidity),
    noise_mean: calculateMean(validFeeds, fieldMapping.noise),
  };
  
  return { channel, feeds: validFeeds, summary, fieldMapping };
}

/**
 * Calculate mean of a field across all feeds
 */
function calculateMean(feeds, fieldKey) {
  const values = feeds
    .map(f => parseFloat(f[fieldKey]))
    .filter(v => !isNaN(v) && v !== null);
  
  if (values.length === 0) return null;
  return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2);
}

/**
 * ThingSpeakConnect Component
 * 
 * Integration Guide:
 * 1. Import in Dashboard or parent component:
 *    import ThingSpeakConnect from './components/ThingSpeakConnect'
 * 
 * 2. Use with onData callback:
 *    <ThingSpeakConnect onData={(data) => {
 *      console.log('Received data:', data);
 *      setDashboardData(data.feeds);
 *      setSummary(data.summary);
 *    }} />
 * 
 * 3. Access real-time data in your Dashboard charts using the callback data
 */
export default function ThingSpeakConnect({ onData }) {
  // Form state
  const [channelId, setChannelId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [pollingInterval, setPollingInterval] = useState('off');
  
  // Connection state
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected | error
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // UI state
  const [showHelp, setShowHelp] = useState(false);
  
  // Polling ref
  const pollingIntervalRef = useRef(null);
  
  // Lottie placeholder animation
  const placeholderAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Cloud Animation",
    ddd: 0,
    assets: [],
    layers: []
  };
  
  // Load saved credentials from localStorage on mount
  useEffect(() => {
    const savedChannelId = localStorage.getItem('TS_CHANNEL_ID');
    const savedApiKey = localStorage.getItem('TS_READ_KEY');
    
    if (savedChannelId) setChannelId(savedChannelId);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);
  
  // Fetch data function
  const handleFetchData = useCallback(async () => {
    // Validate inputs
    if (!channelId.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a Channel ID');
      return;
    }
    
    if (!apiKey.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a Read API Key');
      return;
    }
    
    setIsFetching(true);
    setStatus('connecting');
    setErrorMessage('');
    
    try {
      // Save to localStorage (demo only - use server proxy in production)
      localStorage.setItem('TS_CHANNEL_ID', channelId.trim());
      localStorage.setItem('TS_READ_KEY', apiKey.trim());
      
      // Fetch data from ThingSpeak
      const data = await fetchChannelData(channelId.trim(), apiKey.trim(), 100);
      
      // Parse and map data
      const parsedData = parseThingSpeakData(data);
      
      // Update state
      setStatus('connected');
      setSummary(parsedData.summary);
      
      // Call parent callback with data
      if (onData) {
        onData(parsedData);
      }
      
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to fetch data from ThingSpeak');
      setSummary(null);
    } finally {
      setIsFetching(false);
    }
  }, [channelId, apiKey, onData]);
  
  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setStatus('disconnected');
    setSummary(null);
    setErrorMessage('');
    
    // Clear polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);
  
  // Set up polling when interval changes
  useEffect(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Don't poll if disconnected or interval is off
    if (status !== 'connected' || pollingInterval === 'off') {
      return;
    }
    
    // Convert interval to milliseconds
    const intervalMap = {
      '5s': 5000,
      '15s': 15000,
      '60s': 60000,
    };
    
    const intervalMs = intervalMap[pollingInterval];
    
    if (intervalMs) {
      pollingIntervalRef.current = setInterval(() => {
        handleFetchData();
      }, intervalMs);
    }
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [status, pollingInterval, handleFetchData]);
  
  return (
    <div className="w-full">
      {/* Main Card */}
      <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass overflow-hidden">
        <div className="grid md:grid-cols-[200px,1fr] gap-6 p-6">
          {/* Left: Lottie Animation */}
          <div className="flex items-center justify-center">
            <div className="w-40 h-40 flex items-center justify-center">
              <Lottie 
                animationData={placeholderAnimation}
                loop={true}
                className="w-full h-full opacity-60"
              />
              {/* Icon overlay - Cloud icon represents ThingSpeak cloud */}
              <div className="absolute">
                <Cloud className="w-16 h-16 text-primary-500 opacity-30" />
              </div>
            </div>
          </div>
          
          {/* Right: Form */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-neutral-900">ThingSpeak Connection</h3>
              </div>
              
              {/* Status Pill */}
              {status !== 'disconnected' && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  status === 'connecting' ? 'bg-blue-100 text-blue-700' :
                  status === 'connected' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {status === 'connecting' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {status === 'connected' && <CheckCircle2 className="w-3 h-3" />}
                  {status === 'error' && <AlertCircle className="w-3 h-3" />}
                  {status === 'connecting' && 'Connecting...'}
                  {status === 'connected' && 'Connected'}
                  {status === 'error' && 'Error'}
                </div>
              )}
            </div>
            
            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Channel ID */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Channel ID
                </label>
                <input
                  type="number"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="e.g., 123456"
                  disabled={status === 'connected'}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
              
              {/* Read API Key */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Read API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  disabled={status === 'connected'}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
            {/* Polling Interval */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Auto-Refresh Interval
              </label>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                disabled={status !== 'connected'}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
              >
                <option value="off">Off</option>
                <option value="5s">Every 5 seconds</option>
                <option value="15s">Every 15 seconds</option>
                <option value="60s">Every 60 seconds</option>
              </select>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFetchData}
                disabled={status === 'connected' || isFetching}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-teal-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Connect & Fetch
                  </>
                )}
              </button>
              
              <button
                onClick={handleDisconnect}
                disabled={status === 'disconnected'}
                className="px-4 py-2.5 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            </div>
            
            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}
            
            {/* Summary */}
            {status === 'connected' && summary && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-800 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully connected to ThingSpeak</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div>
                    <span className="font-medium">Records:</span> {summary.records}
                  </div>
                  <div>
                    <span className="font-medium">Last Reading:</span> {new Date(summary.last_reading).toLocaleTimeString()}
                  </div>
                  {summary.pm25_mean && (
                    <div>
                      <span className="font-medium">PM2.5 Avg:</span> {summary.pm25_mean} µg/m³
                    </div>
                  )}
                  {summary.temp_mean && (
                    <div>
                      <span className="font-medium">Temp Avg:</span> {summary.temp_mean}°C
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Help Text */}
            <div className="text-sm text-neutral-600">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                How to get ThingSpeak Channel ID & API Key
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-neutral-900">Getting Your ThingSpeak Credentials</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">Create a ThingSpeak Account</h4>
                    <p className="text-sm text-neutral-600">
                      Go to <a href="https://thingspeak.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">thingspeak.com</a> and sign up for a free account.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">Create a New Channel</h4>
                    <p className="text-sm text-neutral-600">
                      Click "Channels" → "My Channels" → "New Channel". Name your channel and configure fields (e.g., PM2.5, PM10, Temperature, Humidity, Noise).
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">Find Your Channel ID</h4>
                    <p className="text-sm text-neutral-600">
                      After creating the channel, you'll see the <strong>Channel ID</strong> at the top of your channel page (e.g., "Channel ID: 123456").
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">Get Your Read API Key</h4>
                    <p className="text-sm text-neutral-600">
                      Go to the "API Keys" tab on your channel page. Copy the <strong>Read API Key</strong> (not the Write API Key).
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">Paste Here</h4>
                    <p className="text-sm text-neutral-600">
                      Enter your Channel ID and Read API Key in the form above and click "Connect & Fetch".
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <strong>Security Note:</strong> Your API keys are stored locally in your browser. For production use, implement a server-side proxy to protect your credentials.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
