// Profile Page - Edit User Settings & ThingSpeak Credentials
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Database, Key, LogOut, Save, X, CheckCircle2 } from 'lucide-react';
import { getCurrentUser, getThingSpeakCredentials, saveThingSpeakCredentials, logOut } from '../firebase/config';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user and credentials
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const credentials = getThingSpeakCredentials();
    if (credentials) {
      setChannelId(credentials.channelId);
      setApiKey(credentials.apiKey);
    }
  }, [navigate]);

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!channelId.trim()) {
      setError('Please enter a Channel ID');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter a Read API Key');
      return;
    }

    if (!/^\d+$/.test(channelId.trim())) {
      setError('Channel ID must be numeric');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      saveThingSpeakCredentials(channelId.trim(), apiKey.trim());
      setSuccess(true);
      setIsSaving(false);
      setIsEditing(false);

      setTimeout(() => setSuccess(false), 3000);
    }, 500);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logOut();
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Profile Settings</h1>
          <p className="text-neutral-600">Manage your account and IoT connections</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-16 h-16 rounded-full" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800">{user.displayName || 'User'}</h2>
              <p className="text-sm text-neutral-600">{user.email}</p>
              <p className="text-xs text-neutral-400 mt-1">User ID: {user.uid}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* ThingSpeak Credentials Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-800">ThingSpeak Configuration</h3>
                <p className="text-sm text-neutral-600">IoT sensor data source</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-semibold transition-all text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Settings saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {isEditing ? (
            // Edit Mode
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                {/* Channel ID */}
                <div>
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
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {/* API Key */}
                <div>
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
                      placeholder="e.g., ABC123XYZ789"
                      className="w-full pl-11 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono text-sm"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      // Reset to saved values
                      const credentials = getThingSpeakCredentials();
                      if (credentials) {
                        setChannelId(credentials.channelId);
                        setApiKey(credentials.apiKey);
                      }
                    }}
                    disabled={isSaving}
                    className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-600 mb-1">Channel ID</p>
                <p className="text-lg font-mono text-neutral-800">{channelId || 'Not configured'}</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl">
                <p className="text-xs text-neutral-600 mb-1">Read API Key</p>
                <p className="text-sm font-mono text-neutral-800">
                  {apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Not configured'}
                </p>
              </div>

              {(!channelId || !apiKey) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-900">
                    ⚠️ ThingSpeak not configured. Click "Edit" to add your credentials.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-900 font-semibold mb-2">💡 Where to find these values:</p>
            <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
              <li>Login to <a href="https://thingspeak.com" target="_blank" rel="noopener noreferrer" className="underline">ThingSpeak.com</a></li>
              <li>Go to your channel → "Channel Settings"</li>
              <li>Copy "Channel ID" (numeric value)</li>
              <li>Go to "API Keys" tab → Copy "Read API Key"</li>
            </ol>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-neutral-600 hover:text-neutral-800 font-semibold transition-colors inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
