// File: src/components/report/SourceDetectionCard.jsx
// Displays AI-detected pollution source with evidence

import React, { useState } from 'react';
import { Search, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Flame, Wind, Droplets, Cigarette, Sparkles, Home } from 'lucide-react';

/**
 * SourceDetectionCard Component
 * @param {Object} props
 * @param {Object} props.pollution_source - Pollution source analysis
 * @param {string} props.pollution_source.primary - Primary source type
 * @param {number} props.pollution_source.confidence - Confidence score (0-1)
 * @param {Array} props.pollution_source.evidence - Evidence array
 * @param {Array} props.pollution_source.secondary_sources - Secondary sources
 * @param {string} props.pollution_source.explanation - Detailed explanation
 */
export default function SourceDetectionCard({ pollution_source }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pollution_source) {
    return (
      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No pollution source data available</p>
      </div>
    );
  }

  const {
    primary,
    confidence,
    evidence = [],
    secondary_sources = [],
    explanation = ''
  } = pollution_source;

  // Get source metadata (icon, label, color)
  const sourceInfo = getSourceInfo(primary);
  const confidencePercent = Math.round((confidence || 0) * 100);

  // Color coding based on confidence
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
    if (conf >= 0.6) return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' };
    return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
  };

  const confColor = getConfidenceColor(confidence);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-md">
          <Search className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Pollution Source Detection</h3>
          <p className="text-sm text-neutral-600">AI-identified likely causes</p>
        </div>
      </div>

      {/* Primary Source */}
      <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-md mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${sourceInfo.gradient} rounded-xl flex items-center justify-center shadow`}>
              <sourceInfo.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Primary Source</p>
              <h4 className="text-2xl font-bold text-neutral-900">{sourceInfo.label}</h4>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className={`px-4 py-2 rounded-full border-2 ${confColor.border} ${confColor.bg} flex items-center gap-2`}>
            <div className="w-3 h-3 rounded-full bg-current" />
            <span className={`font-bold text-sm ${confColor.text}`}>
              {confidencePercent}% Confident
            </span>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-700 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      {/* Evidence List */}
      {evidence.length > 0 && (
        <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-md mb-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h4 className="font-bold text-neutral-900">Evidence ({evidence.length})</h4>
          </div>

          <div className="space-y-3">
            {evidence.slice(0, isExpanded ? evidence.length : 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-800 font-medium">
                    {typeof item === 'string' ? item : item.observation}
                  </p>
                  {typeof item === 'object' && item.timestamp && (
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-600">
                      <span className="font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                      {item.metric && item.value && (
                        <span className="px-2 py-0.5 bg-white rounded border border-orange-200">
                          {item.metric.toUpperCase()}: {item.value}
                        </span>
                      )}
                      {item.frameRef !== null && item.frameRef !== undefined && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-200">
                          📷 Frame {item.frameRef + 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {evidence.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {evidence.length - 3} More
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Secondary Sources */}
      {secondary_sources.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-orange-200">
          <p className="text-xs text-neutral-600 mb-2 font-semibold">Contributing Factors:</p>
          <div className="flex flex-wrap gap-2">
            {secondary_sources.map((source, idx) => {
              const secInfo = getSourceInfo(source);
              return (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-800 rounded-full border border-orange-200 text-sm">
                  <secInfo.icon className="w-3 h-3" />
                  <span>{secInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get source information (icon, label, color gradient)
 * @private
 */
function getSourceInfo(sourceType) {
  const sources = {
    cooking_fumes: {
      icon: Flame,
      label: 'Cooking Fumes',
      gradient: 'from-orange-500 to-red-600'
    },
    outdoor_pollution: {
      icon: Wind,
      label: 'Outdoor Pollution',
      gradient: 'from-gray-500 to-slate-600'
    },
    dust: {
      icon: Wind,
      label: 'Dust',
      gradient: 'from-amber-500 to-yellow-600'
    },
    smoking: {
      icon: Cigarette,
      label: 'Smoking',
      gradient: 'from-red-500 to-rose-600'
    },
    cleaning_chemicals: {
      icon: Sparkles,
      label: 'Cleaning Chemicals',
      gradient: 'from-blue-500 to-cyan-600'
    },
    poor_ventilation: {
      icon: Home,
      label: 'Poor Ventilation',
      gradient: 'from-indigo-500 to-purple-600'
    },
    construction: {
      icon: AlertCircle,
      label: 'Construction',
      gradient: 'from-yellow-500 to-orange-600'
    },
    traffic: {
      icon: Wind,
      label: 'Traffic Pollution',
      gradient: 'from-slate-500 to-gray-600'
    }
  };

  return sources[sourceType] || {
    icon: AlertCircle,
    label: sourceType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
    gradient: 'from-neutral-500 to-gray-600'
  };
}
