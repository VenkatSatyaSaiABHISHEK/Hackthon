// File: src/components/report/InputSummaryCard.jsx

import React from 'react';
import { Database, Wifi, FileText, MapPin, Key, Clock, RefreshCw, Video, TrendingUp, Hash } from 'lucide-react';

export default function InputSummaryCard({ analysis }) {
  const { source, sourceDetails, sensorSummary } = analysis;

  const maskApiKey = (key) => {
    if (!key || key.length < 8) return '***';
    return key.substring(0, 3) + '***' + key.substring(key.length - 3);
  };

  const handleRefreshThingSpeak = () => {
    // 🔴 IMPLEMENT THINGSPEAK REFRESH HERE
    // Example:
    // await fetchThingSpeak(sourceDetails.channelId, sourceDetails.apiKey);
    console.log('Refreshing ThingSpeak data...');
    alert('ThingSpeak refresh functionality - integrate with your data fetching logic');
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">Input Summary</h3>
      </div>

      {/* ThingSpeak source details */}
      {source === 'thingspeak' && sourceDetails && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-neutral-800">ThingSpeak IoT Source</h4>
            </div>
            <button
              onClick={handleRefreshThingSpeak}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5 text-sm font-medium"
              aria-label="Refresh ThingSpeak data"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-neutral-500 text-xs">Channel ID</p>
                <p className="font-semibold text-neutral-800">{sourceDetails.channelId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-neutral-500 text-xs">Read API Key</p>
                <p className="font-mono text-xs text-neutral-600">{maskApiKey(sourceDetails.apiKey)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-neutral-500 text-xs">Last Fetched</p>
                <p className="text-neutral-700">{formatTimestamp(sourceDetails.lastFetched)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-neutral-500 text-xs">Total Samples</p>
                <p className="font-semibold text-neutral-800">{sourceDetails.sampleCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV source details */}
      {source === 'csv' && sourceDetails && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-neutral-800">CSV File Upload</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs mb-1">Filename</p>
              <p className="font-semibold text-neutral-800 truncate">{sourceDetails.filename || 'data.csv'}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Total Rows</p>
              <p className="font-semibold text-neutral-800">{sourceDetails.sampleCount || 'N/A'}</p>
            </div>
            {sourceDetails.dateRange && (
              <div className="col-span-2">
                <p className="text-neutral-500 text-xs mb-1">Date Range</p>
                <p className="text-neutral-700 text-xs font-mono">{sourceDetails.dateRange}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public API source details */}
      {(source === 'public' || source === 'india_aqi') && sourceDetails && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-neutral-800">Public API Data</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs mb-1">City / Location</p>
              <p className="font-semibold text-neutral-800">{sourceDetails.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Provider</p>
              <p className="font-semibold text-neutral-800">
                {sourceDetails.provider || 'OpenAQ / India AQI'}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Station ID</p>
              <p className="font-semibold text-neutral-800">{sourceDetails.station || 'Auto-detected'}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Samples</p>
              <p className="font-semibold text-neutral-800">{sourceDetails.sampleCount || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video thumbnail and description (if available) */}
      {analysis.videoThumbnail && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-neutral-800">Video Analysis</h4>
          </div>
          <div className="flex gap-4">
            <img 
              src={analysis.videoThumbnail} 
              alt="Video thumbnail" 
              className="w-32 h-24 object-cover rounded-lg border border-neutral-200"
            />
            <div className="flex-1">
              <p className="text-sm text-neutral-700">
                {analysis.videoDescription || 'Video uploaded for multimodal analysis'}
              </p>
              {analysis.frames && analysis.frames.length > 0 && (
                <p className="text-xs text-neutral-500 mt-2">
                  {analysis.frames.length} key frames extracted
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sensor summary statistics */}
      {sensorSummary && (
        <div>
          <h4 className="font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Sensor Metrics Summary
          </h4>
          
          <div className="space-y-2">
            {Object.entries(sensorSummary).map(([key, value]) => (
              <div 
                key={key} 
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                  {key === 'pm25' && ' (PM2.5)'}
                  {key === 'pm10' && ' (PM10)'}
                </span>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-800">
                      {value.avg?.toFixed(1)}
                    </span>{' '}
                    {value.unit}
                    <span className="text-neutral-400 ml-2 text-xs">
                      (avg)
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Range: {value.min?.toFixed(1)} - {value.max?.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder if no sensor data */}
      {!sensorSummary && (
        <div className="p-4 bg-white rounded-lg border border-blue-100 text-center">
          <p className="text-sm text-neutral-500">No sensor summary data available</p>
        </div>
      )}
    </div>
  );
}
