// ThingSpeak Setup Page - First-time configuration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Key, CheckCircle2, Info, ArrowRight, Loader2 } from 'lucide-react';
import { getCurrentUser, saveThingSpeakCredentials, getThingSpeakCredentials } from '../firebase/config';

export default function ThingSpeakSetupPage() {
  const navigate = useNavigate();
  const [channelId, setChannelId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if already configured
    const existing = getThingSpeakCredentials();
    if (existing) {
      setChannelId(existing.channelId);
      setApiKey(existing.apiKey);
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!channelId.trim()) {
      setError('Please enter a Channel ID');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter a Read API Key');
      return;
    }

    // Validate Channel ID is numeric
    if (!/^\d+$/.test(channelId.trim())) {
      setError('Channel ID must be numeric');
      return;
    }

    setIsLoading(true);

    // Simulate saving (with slight delay for UX)
    setTimeout(() => {
      saveThingSpeakCredentials(channelId.trim(), apiKey.trim());
      setSuccess(true);
      setIsLoading(false);

      // Show success message then redirect
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }, 800);
  };

  const handleSkip = () => {
    // Allow skip but warn user
    if (confirm('You can configure ThingSpeak later from your Profile. Continue?')) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-2">
            Connect Your IoT Air Sensor
          </h1>
          <p className="text-neutral-600">
            Configure your ThingSpeak channel to start monitoring
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Why ThingSpeak?</p>
            <p className="text-blue-700">
              ThingSpeak is an IoT platform that collects real-time sensor data from your air quality monitor. 
              AirGuard AI analyzes this data to provide insights and predictions.
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50">
          <form onSubmit={handleSubmit}>
            {/* Channel ID Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Channel ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Database className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="e.g., 2723363"
                  className="w-full pl-11 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Find this in your ThingSpeak channel settings
              </p>
            </div>

            {/* API Key Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Read API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g., ABC123XYZ789DEF456"
                  className="w-full pl-11 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono text-sm"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Located in API Keys section of your channel
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">ThingSpeak Connected! Redirecting...</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading || success}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Connected!</span>
                  </>
                ) : (
                  <>
                    <span>Save & Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading || success}
                className="sm:w-32 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for now
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <p className="text-xs text-neutral-600 mb-2 font-semibold">
              📖 Don't have a ThingSpeak account?
            </p>
            <ol className="text-xs text-neutral-600 space-y-1 ml-4 list-decimal">
              <li>Visit <a href="https://thingspeak.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">thingspeak.com</a></li>
              <li>Create a free account and channel</li>
              <li>Configure your IoT sensor to send data</li>
              <li>Copy Channel ID and Read API Key here</li>
            </ol>
          </div>
        </div>

        {/* Example Card */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-neutral-200">
          <p className="text-xs font-semibold text-neutral-700 mb-2">💡 Example Configuration:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-500">Channel ID:</span>
              <code className="ml-2 bg-neutral-100 px-2 py-1 rounded">2723363</code>
            </div>
            <div>
              <span className="text-neutral-500">API Key:</span>
              <code className="ml-2 bg-neutral-100 px-2 py-1 rounded text-xs">ABC123...</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
