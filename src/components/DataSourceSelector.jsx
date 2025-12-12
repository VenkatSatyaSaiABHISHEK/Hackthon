// src/components/DataSourceSelector.jsx

/**
 * Data Source Selection Screen
 * First screen user sees - choose between ThingSpeak, India AQI, or CSV upload
 */

import React from 'react';
import { Wifi, MapPin, Upload, Sparkles, ArrowRight } from 'lucide-react';

export default function DataSourceSelector({ onSelectSource }) {
  const dataSources = [
    {
      id: 'thingspeak',
      icon: Wifi,
      title: 'IoT Sensor (ThingSpeak)',
      description: 'Connect your real-time sensor data from ThingSpeak cloud platform',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      features: ['Real-time updates', 'Auto-refresh', 'Multiple sensors'],
    },
    {
      id: 'india-aqi',
      icon: MapPin,
      title: 'Public India AQI',
      description: 'Access official air quality data from Indian cities via OpenAQ',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      features: ['Government data', '6 major cities', 'Updated hourly'],
    },
    {
      id: 'csv',
      icon: Upload,
      title: 'Upload CSV File',
      description: 'Upload your own sensor data in CSV format for analysis',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      features: ['Local data', 'Offline analysis', 'Custom fields'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Powered by AI</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Choose Your Data Source
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Select how you want to monitor your indoor air quality. You can switch sources anytime.
          </p>
        </div>

        {/* Data Source Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {dataSources.map((source, index) => {
            const Icon = source.icon;
            return (
              <div
                key={source.id}
                className="group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onSelectSource(source.id)}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden h-full">
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${source.color}`} />
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${source.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${source.iconColor}`} />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {source.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                      {source.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {source.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${source.color}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${source.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all group-hover:gap-3`}
                      aria-label={`Select ${source.title}`}
                    >
                      Select Source
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="text-center">
          <p className="text-sm text-neutral-500">
            All data sources support AI-powered analysis and recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
