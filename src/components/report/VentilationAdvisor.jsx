// File: src/components/report/VentilationAdvisor.jsx
// Displays AI-powered ventilation recommendations and schedule

import React from 'react';
import { Wind, Clock, AlertTriangle, CheckCircle2, XCircle, AlertCircle as AlertIcon } from 'lucide-react';

/**
 * VentilationAdvisor Component
 * @param {Object} props
 * @param {Object} props.ventilation_tips - Ventilation recommendations
 * @param {Array} props.ventilation_tips.schedule - Time-based schedule
 * @param {string} props.ventilation_tips.summary - Summary text
 * @param {Array} props.ventilation_tips.warnings - Warning messages
 * @param {number} props.ventilation_tips.indoorOutdoorDiff - PM2.5 differential
 */
export default function VentilationAdvisor({ ventilation_tips }) {
  if (!ventilation_tips) {
    return (
      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No ventilation recommendations available</p>
      </div>
    );
  }

  const {
    schedule = [],
    summary = '',
    warnings = [],
    indoorOutdoorDiff = 0
  } = ventilation_tips;

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <Wind className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Ventilation Advisor</h3>
          <p className="text-sm text-neutral-600">Optimal ventilation schedule for your space</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-5 border-2 border-cyan-200 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-cyan-700" />
            <h4 className="font-bold text-cyan-900">AI Recommendation</h4>
          </div>
          <p className="text-cyan-900 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Indoor/Outdoor Differential */}
      <div className="bg-white rounded-xl p-4 border border-cyan-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              indoorOutdoorDiff > 0 
                ? 'bg-green-100' 
                : indoorOutdoorDiff < 0 
                  ? 'bg-red-100' 
                  : 'bg-neutral-100'
            }`}>
              {indoorOutdoorDiff > 0 ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : indoorOutdoorDiff < 0 ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <AlertIcon className="w-6 h-6 text-neutral-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-neutral-500">Indoor vs Outdoor PM2.5</p>
              <p className={`text-lg font-bold ${
                indoorOutdoorDiff > 0 
                  ? 'text-green-700' 
                  : indoorOutdoorDiff < 0 
                    ? 'text-red-700' 
                    : 'text-neutral-700'
              }`}>
                {indoorOutdoorDiff > 0 ? '+' : ''}{indoorOutdoorDiff.toFixed(1)} µg/m³
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-600">
              {indoorOutdoorDiff > 0 
                ? '✅ Indoor cleaner than outdoor' 
                : indoorOutdoorDiff < 0 
                  ? '⚠️ Outdoor cleaner than indoor' 
                  : '➖ Similar conditions'}
            </p>
          </div>
        </div>
      </div>

      {/* Ventilation Schedule */}
      {schedule.length > 0 && (
        <div className="bg-white rounded-xl p-6 border-2 border-cyan-200 shadow-md mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-600" />
            <h4 className="font-bold text-neutral-900">24-Hour Ventilation Schedule</h4>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-neutral-600">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-neutral-600">Action</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-neutral-600">Reasoning</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-neutral-600">Est. PM2.5</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((slot, idx) => {
                  const actionInfo = getActionInfo(slot.action);
                  const ActionIcon = actionInfo.icon;

                  return (
                    <tr key={idx} className="border-b border-neutral-100 hover:bg-cyan-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span className="font-mono text-sm text-neutral-800">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${actionInfo.bg}`}>
                          <ActionIcon className={`w-4 h-4 ${actionInfo.iconColor}`} />
                          <span className={`text-xs font-semibold ${actionInfo.textColor}`}>
                            {actionInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-neutral-700">
                        {slot.reasoning}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {slot.outdoorPM25Estimate && (
                          <span className="text-sm font-mono text-neutral-700">
                            {slot.outdoorPM25Estimate} µg/m³
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Visual Timeline */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-neutral-600 mb-3">Quick Reference:</p>
            <div className="flex h-8 rounded-lg overflow-hidden border-2 border-neutral-200">
              {schedule.map((slot, idx) => {
                const actionInfo = getActionInfo(slot.action);
                const start = parseTime(slot.startTime);
                const end = parseTime(slot.endTime);
                const duration = end > start ? end - start : (24 - start) + end;
                const widthPercent = (duration / 24) * 100;

                return (
                  <div
                    key={idx}
                    className={`${actionInfo.timelineBg} flex items-center justify-center border-r border-white last:border-r-0`}
                    style={{ width: `${widthPercent}%` }}
                    title={`${slot.startTime}-${slot.endTime}: ${actionInfo.label}`}
                  >
                    {widthPercent > 8 && (
                      <span className={`text-xs font-semibold ${actionInfo.timelineText}`}>
                        {slot.startTime}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h4 className="font-bold text-amber-900">Important Warnings</h4>
          </div>
          <ul className="space-y-2">
            {warnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="text-amber-700 font-bold flex-shrink-0">⚠️</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Get action information (colors, icons, labels)
 * @private
 */
function getActionInfo(action) {
  const actions = {
    open_windows: {
      icon: CheckCircle2,
      label: 'Open Windows',
      bg: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      timelineBg: 'bg-green-500',
      timelineText: 'text-white'
    },
    keep_closed: {
      icon: XCircle,
      label: 'Keep Closed',
      bg: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      timelineBg: 'bg-red-500',
      timelineText: 'text-white'
    },
    partial_ventilation: {
      icon: Wind,
      label: 'Partial Ventilation',
      bg: 'bg-amber-100',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600',
      timelineBg: 'bg-amber-500',
      timelineText: 'text-white'
    }
  };

  return actions[action] || {
    icon: AlertIcon,
    label: action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
    bg: 'bg-neutral-100',
    textColor: 'text-neutral-800',
    iconColor: 'text-neutral-600',
    timelineBg: 'bg-neutral-500',
    timelineText: 'text-white'
  };
}

/**
 * Parse time string to hours (0-23)
 * @private
 */
function parseTime(timeStr) {
  const [hours] = timeStr.split(':').map(Number);
  return hours;
}
