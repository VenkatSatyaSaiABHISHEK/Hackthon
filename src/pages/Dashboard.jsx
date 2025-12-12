// src/pages/Dashboard.jsx

/**
 * Main Dashboard Page - Completely Redesigned
 * Shows data source selection FIRST, then dashboard after selection
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import DataSourceSelector from '../components/DataSourceSelector';
import ThingSpeakModal from '../components/ThingSpeakModal';
import AQISourceSelector from '../components/AQISourceSelector';
import CSVUploader from '../components/CSVUploader';
import SensorsDashboard from '../components/SensorsDashboard';
import AISummaryCard from '../components/AISummaryCard';
import { getCurrentUser, getThingSpeakCredentials } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const thingSpeakCreds = getThingSpeakCredentials();

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Main state
  const [selectedSource, setSelectedSource] = useState(null); // 'thingspeak' | 'india-aqi' | 'csv'
  const [sensorData, setSensorData] = useState(null);
  const [showSourceSelector, setShowSourceSelector] = useState(true);
  const [isAutoLoading, setIsAutoLoading] = useState(false);

  // Auto-load ThingSpeak data if credentials exist
  useEffect(() => {
    const autoLoadThingSpeak = async () => {
      if (thingSpeakCreds && !sensorData && !selectedSource) {
        setIsAutoLoading(true);
        setSelectedSource('thingspeak');
        
        try {
          const response = await fetch(
            `https://api.thingspeak.com/channels/${thingSpeakCreds.channelId}/feeds.json?api_key=${thingSpeakCreds.apiKey}&results=200`
          );
          const data = await response.json();
          
          if (data.feeds && data.feeds.length > 0) {
            const parsedData = parseThingSpeakData(data, thingSpeakCreds.channelId, thingSpeakCreds.apiKey, 'off');
            setSensorData(parsedData);
            setShowSourceSelector(false);
          }
        } catch (err) {
          console.error('Auto-load ThingSpeak failed:', err);
          // Show selector on error
        } finally {
          setIsAutoLoading(false);
        }
      }
    };

    autoLoadThingSpeak();
  }, [thingSpeakCreds]);

  // Parse ThingSpeak data helper
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

  // Modal states
  const [showThingSpeakModal, setShowThingSpeakModal] = useState(false);
  const [showAQISelector, setShowAQISelector] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);

  // Auto-refresh for ThingSpeak
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle data source selection
  const handleSourceSelection = (sourceId) => {
    setSelectedSource(sourceId);
    
    if (sourceId === 'thingspeak') {
      setShowThingSpeakModal(true);
    } else if (sourceId === 'india-aqi') {
      setShowAQISelector(true);
    } else if (sourceId === 'csv') {
      setShowCSVUploader(true);
    }
  };

  // Handle ThingSpeak connection
  const handleThingSpeakConnect = (data) => {
    console.log('ThingSpeak data received:', data);
    setSensorData(data);
    setShowSourceSelector(false);
    setShowThingSpeakModal(false);
    
    // Set up auto-refresh if interval is specified
    if (data.refreshInterval && data.refreshInterval !== 'off') {
      const intervalMs = data.refreshInterval === '30s' ? 30000 :
                        data.refreshInterval === '1min' ? 60000 :
                        data.refreshInterval === '5min' ? 300000 : null;
      
      if (intervalMs) {
        setRefreshInterval(intervalMs);
      }
    }
  };

  // Handle India AQI connection
  const handleAQIConnect = (data) => {
    setSensorData(data);
    setShowSourceSelector(false);
    setShowAQISelector(false);
  };

  // Handle CSV upload
  const handleCSVUpload = (data) => {
    setSensorData(data);
    setShowSourceSelector(false);
    setShowCSVUploader(false);
  };

  // Change data source (go back to selector)
  const handleChangeSource = () => {
    setSensorData(null);
    setSelectedSource(null);
    setShowSourceSelector(true);
    
    // Clear auto-refresh
    if (refreshInterval) {
      setRefreshInterval(null);
    }
  };

  // Manual refresh for ThingSpeak
  const handleManualRefresh = async () => {
    if (!sensorData || sensorData.source !== 'thingspeak') return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${sensorData.channelId}/feeds.json?api_key=${sensorData.apiKey}&results=100`
      );
      const data = await response.json();
      
      // Re-parse data (reuse ThingSpeak modal parsing logic)
      const { channel, feeds } = data;
      const fieldMapping = {};
      for (let i = 1; i <= 8; i++) {
        const fieldName = channel[`field${i}`];
        if (fieldName) {
          const lower = fieldName.toLowerCase();
          if (lower.includes('pm2.5')) fieldMapping.pm25 = `field${i}`;
          else if (lower.includes('pm10')) fieldMapping.pm10 = `field${i}`;
          else if (lower.includes('temp')) fieldMapping.temperature = `field${i}`;
          else if (lower.includes('humid')) fieldMapping.humidity = `field${i}`;
          else if (lower.includes('noise') || lower.includes('sound')) fieldMapping.noise = `field${i}`;
        }
      }
      
      setSensorData({
        ...sensorData,
        feeds,
        fieldMapping,
        rawData: data,
      });
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh effect for ThingSpeak
  useEffect(() => {
    if (!refreshInterval || !sensorData || sensorData.source !== 'thingspeak') return;
    
    const timer = setInterval(() => {
      handleManualRefresh();
    }, refreshInterval);
    
    return () => clearInterval(timer);
  }, [refreshInterval, sensorData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-teal-50 pt-20">
      {/* Modals */}
      <ThingSpeakModal
        isOpen={showThingSpeakModal}
        onClose={() => {
          setShowThingSpeakModal(false);
          setSelectedSource(null);
        }}
        onConnect={handleThingSpeakConnect}
      />
      
      <AQISourceSelector
        isOpen={showAQISelector}
        onClose={() => {
          setShowAQISelector(false);
          setSelectedSource(null);
        }}
        onConnect={handleAQIConnect}
      />
      
      <CSVUploader
        isOpen={showCSVUploader}
        onClose={() => {
          setShowCSVUploader(false);
          setSelectedSource(null);
        }}
        onUpload={handleCSVUpload}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Data Source Selector FIRST */}
        {showSourceSelector && !sensorData && (
          <div>
            <DataSourceSelector onSelectSource={handleSourceSelection} />
          </div>
        )}

        {/* Show Dashboard AFTER data source selected */}
        {!showSourceSelector && sensorData && (
          <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg animate-slide-up">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleChangeSource}
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-semibold"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Change Source
                </button>
                
                {sensorData.source === 'thingspeak' && (
                  <button
                    onClick={() => setShowThingSpeakModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all font-semibold"
                  >
                    Change Credentials
                  </button>
                )}
              </div>
              
              {sensorData.source === 'thingspeak' && (
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-teal-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-teal-700 transition-all shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Charts and Metrics (2/3 width) */}
              <div className="lg:col-span-2">
                <SensorsDashboard data={sensorData} />
              </div>

              {/* Right Column - AI Summary (1/3 width) */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <AISummaryCard sensorData={sensorData} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
