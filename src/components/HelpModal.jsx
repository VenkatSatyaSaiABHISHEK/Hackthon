// src/components/HelpModal.jsx

/**
 * Help Modal Component
 * Provides step-by-step guidance and support options
 */

import React from 'react';
import { X, HelpCircle, Phone, Mail, MessageCircle, ExternalLink, Copy } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+1-800-AIRGUARD');
    alert('Phone number copied to clipboard!');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@airguard.ai');
    alert('Email copied to clipboard!');
  };

  const handleRequestHelp = () => {
    const subject = encodeURIComponent('AirGuard AI - Setup Assistance Request');
    const body = encodeURIComponent(`Hello AirGuard Support Team,

I need assistance with:
- [ ] Creating a ThingSpeak account
- [ ] Setting up my channel
- [ ] Connecting sensors
- [ ] Other (please specify below)

Details:


Thank you!`);
    
    window.open(`mailto:support@airguard.ai?subject=${subject}&body=${body}`);
  };

  const handleRemoteSetup = () => {
    // Mock action - would typically open a scheduling tool or support ticket
    alert('Remote setup request submitted! Our team will contact you within 24 hours.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-teal-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Help Center</h2>
              <p className="text-sm text-neutral-600">Step-by-step guides and support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close help modal"
          >
            <X className="w-6 h-6 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Links</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="https://thingspeak.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors group"
              >
                <ExternalLink className="w-5 h-5 text-primary-600" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">ThingSpeak Login</p>
                  <p className="text-xs text-neutral-600">Sign in to your account</p>
                </div>
              </a>

              <a
                href="https://thingspeak.com/channels/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors group"
              >
                <ExternalLink className="w-5 h-5 text-primary-600" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Create Channel</p>
                  <p className="text-xs text-neutral-600">Set up a new channel</p>
                </div>
              </a>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Getting Started Guide</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-neutral-600 mb-2">{step.description}</p>
                    {step.screenshot && (
                      <div className="p-4 bg-neutral-100 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-500 italic">Screenshot: {step.screenshot}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Contact */}
          <div className="pt-6 border-t border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Need More Help?</h3>
            
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {/* Phone Support */}
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <Phone className="w-6 h-6 text-primary-600 mb-2" />
                <p className="text-sm font-medium text-neutral-900 mb-1">Phone Support</p>
                <p className="text-sm text-neutral-700 mb-2 font-mono">+1-800-AIRGUARD</p>
                <button
                  onClick={handleCopyPhone}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>

              {/* Email Support */}
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <Mail className="w-6 h-6 text-teal-600 mb-2" />
                <p className="text-sm font-medium text-neutral-900 mb-1">Email Support</p>
                <p className="text-sm text-neutral-700 mb-2 break-all">support@airguard.ai</p>
                <button
                  onClick={handleCopyEmail}
                  className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>

              {/* Live Chat */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <MessageCircle className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-neutral-900 mb-1">Live Chat</p>
                <p className="text-sm text-neutral-700 mb-2">Mon-Fri, 9am-5pm EST</p>
                <button className="text-xs text-purple-600 hover:text-purple-700">
                  Start Chat →
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRequestHelp}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                <Mail className="w-5 h-5" />
                Request Help via Email
              </button>

              <button
                onClick={handleRemoteSetup}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all"
              >
                <HelpCircle className="w-5 h-5" />
                Request Remote Setup Assistance
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="pt-6 border-t border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="cursor-pointer p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg font-medium text-neutral-900 transition-colors">
                    {faq.question}
                  </summary>
                  <div className="p-4 text-sm text-neutral-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    title: 'Create a ThingSpeak Account',
    description: 'Visit thingspeak.com and sign up for a free account using your email address.',
    screenshot: 'ThingSpeak registration page with email field highlighted',
  },
  {
    title: 'Create a New Channel',
    description: 'Click "Channels" → "My Channels" → "New Channel". Give your channel a name like "Living Room Air Quality".',
    screenshot: 'New Channel creation form',
  },
  {
    title: 'Configure Channel Fields',
    description: 'Add fields for your sensors: Field 1 = PM2.5, Field 2 = PM10, Field 3 = Temperature, Field 4 = Humidity, Field 5 = Noise.',
    screenshot: 'Channel settings with field labels',
  },
  {
    title: 'Find Your Channel ID',
    description: 'After saving, you\'ll see your Channel ID at the top of the channel page (e.g., "Channel ID: 123456").',
    screenshot: 'Channel page header showing Channel ID',
  },
  {
    title: 'Get Your Read API Key',
    description: 'Click the "API Keys" tab on your channel page and copy the Read API Key (not the Write API Key).',
    screenshot: 'API Keys tab with Read API Key visible',
  },
  {
    title: 'Connect to AirGuard AI',
    description: 'Return to AirGuard AI, enter your Channel ID and Read API Key in the connection form, and click "Connect & Fetch".',
  },
];

const faqs = [
  {
    question: 'Do I need to pay for ThingSpeak?',
    answer: 'No! ThingSpeak offers a free tier that\'s perfect for AirGuard AI. The free plan allows up to 3 million messages per year, which is more than enough for most home monitoring setups.',
  },
  {
    question: 'Is my API key safe?',
    answer: 'For this demo, API keys are stored in your browser\'s local storage. For production use, we recommend implementing a backend proxy that securely stores credentials server-side. Never commit API keys to version control.',
  },
  {
    question: 'Can I use CSV files instead of ThingSpeak?',
    answer: 'Yes! If you have sensor data in CSV format, you can use the CSV Upload feature as an alternative to ThingSpeak. This is great for testing or if you prefer manual data uploads.',
  },
  {
    question: 'What if my sensors aren\'t sending data?',
    answer: 'First, verify your sensors are properly connected and powered. Check your ThingSpeak channel to ensure data is appearing there. If not, review your sensor firmware and WiFi connection settings.',
  },
];
