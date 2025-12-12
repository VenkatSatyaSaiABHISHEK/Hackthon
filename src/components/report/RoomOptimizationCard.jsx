// File: src/components/report/RoomOptimizationCard.jsx
// Displays AI-powered room layout optimization suggestions

import React, { useState } from 'react';
import { Home, Maximize2, Fan, Wind as AirIcon, AlertCircle, CheckCircle2, ChevronRight, Lightbulb } from 'lucide-react';

/**
 * RoomOptimizationCard Component
 * @param {Object} props
 * @param {Object} props.layout_suggestions - Room layout recommendations
 * @param {Array} props.layout_suggestions.issues - Array of layout issues
 * @param {string} props.layout_suggestions.summary - Summary text
 */
export default function RoomOptimizationCard({ layout_suggestions }) {
  const [expandedIssue, setExpandedIssue] = useState(null);

  if (!layout_suggestions || !layout_suggestions.issues || layout_suggestions.issues.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Room Optimization</h3>
            <p className="text-sm text-neutral-600">AI-powered layout suggestions</p>
          </div>
        </div>
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-green-900">No Issues Detected!</p>
          <p className="text-sm text-green-700 mt-2">Your room layout appears optimized for air quality.</p>
        </div>
      </div>
    );
  }

  const { issues, summary } = layout_suggestions;

  // Sort issues by severity
  const sortedIssues = [...issues].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Home className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Room Optimization</h3>
          <p className="text-sm text-neutral-600">{issues.length} improvement{issues.length !== 1 ? 's' : ''} identified</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-5 border-2 border-indigo-200 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-indigo-700" />
            <h4 className="font-bold text-indigo-900">AI Analysis</h4>
          </div>
          <p className="text-indigo-900 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        {sortedIssues.map((issue, idx) => {
          const isExpanded = expandedIssue === idx;
          const severityInfo = getSeverityInfo(issue.severity);
          const typeInfo = getIssueTypeInfo(issue.type);
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={idx}
              className="bg-white rounded-xl border-2 border-neutral-200 hover:border-indigo-300 transition-all duration-200 overflow-hidden"
            >
              {/* Issue Header */}
              <button
                onClick={() => setExpandedIssue(isExpanded ? null : idx)}
                className="w-full p-5 flex items-start gap-4 hover:bg-indigo-50 transition-colors"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow`}>
                  <TypeIcon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-neutral-900">{typeInfo.label}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${severityInfo.bg} ${severityInfo.text}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{issue.location}</p>
                  <p className="text-sm text-neutral-800 leading-snug">{issue.description}</p>
                </div>

                <ChevronRight className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-neutral-200 bg-indigo-50">
                  <div className="pt-4 space-y-4">
                    {/* Fix Instructions */}
                    <div className="p-4 bg-white rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-semibold text-neutral-700">How to Fix:</p>
                      </div>
                      <p className="text-sm text-neutral-800 leading-relaxed">{issue.fix}</p>
                    </div>

                    {/* Expected Improvement */}
                    {issue.expectedImprovement && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Maximize2 className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-semibold text-green-800">Expected Improvement:</p>
                        </div>
                        <p className="text-sm font-bold text-green-900">{issue.expectedImprovement}</p>
                      </div>
                    )}

                    {/* Frame Reference */}
                    {issue.frameRef !== null && issue.frameRef !== undefined && (
                      <div className="p-3 bg-purple-100 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-800">
                          📷 <span className="font-semibold">Visible in Frame {issue.frameRef + 1}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Summary */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-neutral-200 text-center">
          <p className="text-xs text-neutral-500 mb-1">Total Issues</p>
          <p className="text-2xl font-bold text-neutral-900">{issues.length}</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-neutral-200 text-center">
          <p className="text-xs text-neutral-500 mb-1">High Priority</p>
          <p className="text-2xl font-bold text-red-700">
            {issues.filter(i => i.severity === 'high').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-neutral-200 text-center">
          <p className="text-xs text-neutral-500 mb-1">Quick Wins</p>
          <p className="text-2xl font-bold text-green-700">
            {issues.filter(i => i.severity === 'low').length}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Get severity information (colors)
 * @private
 */
function getSeverityInfo(severity) {
  const severities = {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800'
    },
    medium: {
      bg: 'bg-amber-100',
      text: 'text-amber-800'
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800'
    }
  };

  return severities[severity] || {
    bg: 'bg-neutral-100',
    text: 'text-neutral-800'
  };
}

/**
 * Get issue type information (icon, label, gradient)
 * @private
 */
function getIssueTypeInfo(type) {
  const types = {
    purifier_placement: {
      icon: Fan,
      label: 'Air Purifier Placement',
      gradient: 'from-blue-500 to-cyan-600'
    },
    blocked_vent: {
      icon: AlertCircle,
      label: 'Blocked Air Vent',
      gradient: 'from-red-500 to-rose-600'
    },
    furniture_obstruction: {
      icon: Home,
      label: 'Furniture Obstruction',
      gradient: 'from-amber-500 to-orange-600'
    },
    fan_direction: {
      icon: Fan,
      label: 'Fan Direction Issue',
      gradient: 'from-purple-500 to-indigo-600'
    },
    window_access: {
      icon: AirIcon,
      label: 'Window Access Blocked',
      gradient: 'from-green-500 to-emerald-600'
    }
  };

  return types[type] || {
    icon: AlertCircle,
    label: type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Layout Issue',
    gradient: 'from-neutral-500 to-gray-600'
  };
}
