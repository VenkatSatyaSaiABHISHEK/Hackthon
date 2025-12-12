// File: src/components/report/ReportHeader.jsx

import React from 'react';
import { FileText, Calendar, Cpu, Hash, Database } from 'lucide-react';

export default function ReportHeader({ analysis }) {
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSourceLabel = (source) => {
    if (!source) return 'Unknown';
    const sourceMap = {
      'thingspeak': 'ThingSpeak IoT',
      'csv': 'CSV Upload',
      'public': 'Public API',
      'india_aqi': 'India AQI'
    };
    return sourceMap[source.toLowerCase()] || source;
  };

  const getSourceIcon = (source) => {
    if (!source) return <Database className="w-5 h-5" />;
    const lowerSource = source.toLowerCase();
    if (lowerSource === 'thingspeak') return <Database className="w-5 h-5" />;
    if (lowerSource === 'csv') return <FileText className="w-5 h-5" />;
    return <Database className="w-5 h-5" />;
  };

  return (
    <div className="border-b border-neutral-200 pb-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Air Health Analysis Report
          </h1>
          <p className="text-neutral-600 mt-1">
            Comprehensive environmental health assessment
          </p>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Hash className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">Report ID</p>
            <p className="text-sm font-semibold text-neutral-800 truncate">
              {analysis.reportId || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">Generated</p>
            <p className="text-sm font-semibold text-neutral-800">
              {formatDate(analysis.generatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            {getSourceIcon(analysis.source)}
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">Data Source</p>
            <p className="text-sm font-semibold text-neutral-800">
              {getSourceLabel(analysis.source)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">AI Model</p>
            <p className="text-sm font-semibold text-neutral-800">
              {analysis.modelUsed || 'Gemini 3 Pro'}
            </p>
          </div>
        </div>
      </div>

      {/* Source details (if available) */}
      {analysis.sourceDetails && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {analysis.sourceDetails.channelId && (
              <div>
                <span className="text-blue-600 font-medium">Channel ID:</span>{' '}
                <span className="text-neutral-700">{analysis.sourceDetails.channelId}</span>
              </div>
            )}
            {analysis.sourceDetails.city && (
              <div>
                <span className="text-blue-600 font-medium">City:</span>{' '}
                <span className="text-neutral-700">{analysis.sourceDetails.city}</span>
              </div>
            )}
            {analysis.sourceDetails.filename && (
              <div>
                <span className="text-blue-600 font-medium">File:</span>{' '}
                <span className="text-neutral-700">{analysis.sourceDetails.filename}</span>
              </div>
            )}
            {analysis.sourceDetails.sampleCount && (
              <div>
                <span className="text-blue-600 font-medium">Samples:</span>{' '}
                <span className="text-neutral-700">{analysis.sourceDetails.sampleCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
