// src/components/ThingSpeakModal.jsx

/**
 * ThingSpeak Connection Modal
 * Collect Channel ID, API Key, and refresh interval
 */

import React, { useState, useEffect } from 'react';
import { X, Wifi, CheckCircle2, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { getThingSpeakCredentials } from '../firebase/config';

export default function ThingSpeakModal({ isOpen, onClose, onConnect }) {
  const [channelId, setChannelId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('off');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Pre-fill with saved credentials
  useEffect(() => {
    if (isOpen) {
      const saved = getThingSpeakCredentials();
      if (saved) {
        setChannelId(saved.channelId);
        setApiKey(saved.apiKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setError('');
    
    if (!channelId.trim() || !apiKey.trim()) {
      setError('Please enter both Channel ID and API Key');
      return;
    }

    setIsConnecting(true);

    try {
      // Fetch from ThingSpeak
      const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=200`;
      const response = await axios.get(url);

      if (!response.data.feeds || response.data.feeds.length === 0) {
        throw new Error('No data found in this channel');
      }

      // Parse and map fields
      const parsedData = parseThingSpeakData(response.data, channelId, apiKey, refreshInterval);

      // Save credentials using Firebase helper
      const { saveThingSpeakCredentials } = await import('../firebase/config');
      saveThingSpeakCredentials(channelId.trim(), apiKey.trim());
      localStorage.setItem('airguard_refresh_interval', refreshInterval);

      onConnect(parsedData);
      onClose();

    } catch (err) {
      console.error('ThingSpeak connection error:', err);
      setError(
        err.response?.status === 401
          ? 'Invalid API key'
          : err.response?.status === 404
          ? 'Channel not found'
          : err.message || 'Failed to connect to ThingSpeak'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const parseThingSpeakData = (data, channelId, apiKey, interval) => {
    const { channel, feeds } = data;

    // Auto-detect field mappings
    const fieldMapping = {};
    for (let i = 1; i <= 8; i++) {
      const fieldName = channel[`field${i}`];
      if (fieldName) {
        const lower = fieldName.toLowerCase();
        if (lower.includes('pm2.5') || lower.includes('pm25')) fieldMapping.pm25 = `field${i}`;
        else if (lower.includes('pm10')) fieldMapping.pm10 = `field${i}`;
        else if (lower.includes('temp')) fieldMapping.temperature = `field${i}`;
        else if (lower.includes('humid')) fieldMapping.humidity = `field${i}`;
        else if (lower.includes('noise') || lower.includes('sound')) fieldMapping.noise = `field${i}`;
      }
    }

    // Fallback mappings
    if (!fieldMapping.pm25) fieldMapping.pm25 = 'field1';
    if (!fieldMapping.pm10) fieldMapping.pm10 = 'field2';
    if (!fieldMapping.temperature) fieldMapping.temperature = 'field3';
    if (!fieldMapping.humidity) fieldMapping.humidity = 'field4';
    if (!fieldMapping.noise) fieldMapping.noise = 'field5';

    return {
      source: 'thingspeak',
      channelId,
      apiKey,
      refreshInterval: interval,
      channelName: channel.name,
      feeds,
      fieldMapping,
      rawData: data,
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wifi className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Connect ThingSpeak</h2>
              <p className="text-sm text-blue-100">Real-time IoT sensor data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Channel ID */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Channel ID *
            </label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="e.g., 123456"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isConnecting}
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Read API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Read API Key"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isConnecting}
            />
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Auto-Refresh Interval
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              disabled={isConnecting}
            >
              <option value="off">Off (Manual)</option>
              <option value="30">Every 30 seconds</option>
              <option value="60">Every 1 minute</option>
              <option value="300">Every 5 minutes</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Help Section */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            How do I get my Channel ID & API Key?
          </button>

          {showHelp && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-neutral-700 space-y-2">
              <p className="font-semibold">Quick Guide:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://thingspeak.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">thingspeak.com</a></li>
                <li>Sign in and navigate to your channel</li>
                <li>Channel ID is shown at the top of the page</li>
                <li>Click "API Keys" tab to find Read API Key</li>
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isConnecting}
              className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={isConnecting || !channelId.trim() || !apiKey.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Connect & Fetch
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800">
              <strong>Security Note:</strong> API keys are stored locally for demo purposes. For production, use server-side proxy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
