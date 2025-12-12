// src/components/analysis/EvidencePanel.jsx
import React, { useState } from 'react';
import { Eye, Activity, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function EvidencePanel({ evidence, frames, deterministicMetrics, onEvidenceClick }) {
  const [expandedEvidence, setExpandedEvidence] = useState(new Set([0]));

  const toggleExpand = (idx) => {
    const newExpanded = new Set(expandedEvidence);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedEvidence(newExpanded);
  };

  const getEvidenceIcon = (type) => {
    return type === 'vision' ? Eye : Activity;
  };

  const getEvidenceColor = (type) => {
    return type === 'vision' 
      ? 'from-red-50 to-pink-50 border-red-200'
      : 'from-blue-50 to-indigo-50 border-blue-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-blue-600" />
        Evidence ({evidence.length})
      </h3>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {evidence.map((ev, idx) => {
          const Icon = getEvidenceIcon(ev.type);
          const isExpanded = expandedEvidence.has(idx);

          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${getEvidenceColor(ev.type)} border-2 rounded-xl p-4 transition-all hover:shadow-md cursor-pointer`}
              onClick={() => onEvidenceClick(idx)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    ev.type === 'vision' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {ev.type} Evidence
                    </span>
                    {ev.timestamp && (
                      <div className="text-xs text-gray-500">
                        {new Date(ev.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(idx);
                  }}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Message */}
              <p className="text-gray-800 font-medium mb-2">{ev.message}</p>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                  {ev.type === 'sensor' && ev.source_rows && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Source Data Rows: {ev.source_rows.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Click to view corresponding chart data
                      </div>
                    </div>
                  )}

                  {ev.type === 'vision' && ev.frame_index !== undefined && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Detected in Frame {ev.frame_index + 1}
                      </div>
                      {frames[ev.frame_index] && (
                        <img
                          src={frames[ev.frame_index].thumbnail_base64}
                          alt={`Frame ${ev.frame_index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {ev.labels && ev.labels.length > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Detected Labels:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ev.labels.map((label, lidx) => (
                          <span
                            key={lidx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {label.label} ({(label.score * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {evidence.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No evidence items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
