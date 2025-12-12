// src/components/analysis/VerificationPanel.jsx
import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Shield } from 'lucide-react';

export default function VerificationPanel({ verification, evidence }) {
  const [expandedVerifications, setExpandedVerifications] = useState(new Set([0]));

  const toggleExpand = (idx) => {
    const newExpanded = new Set(expandedVerifications);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedVerifications(newExpanded);
  };

  const getStatusIcon = (verified) => {
    if (verified === true) return CheckCircle2;
    if (verified === false) return XCircle;
    return AlertTriangle;
  };

  const getStatusColor = (verified) => {
    if (verified === true) return 'text-green-600 bg-green-50 border-green-200';
    if (verified === false) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getStatusBadge = (verified) => {
    if (verified === true) return { text: 'VERIFIED', color: 'bg-green-500' };
    if (verified === false) return { text: 'UNVERIFIED', color: 'bg-red-500' };
    return { text: 'WARNING', color: 'bg-yellow-500' };
  };

  // Count verification stats
  const stats = verification.reduce(
    (acc, v) => {
      if (v.verified === true) acc.verified++;
      else if (v.verified === false) acc.unverified++;
      else acc.warnings++;
      return acc;
    },
    { verified: 0, unverified: 0, warnings: 0 }
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Verification
        </h3>
        
        {/* Stats Pills */}
        <div className="flex gap-2">
          {stats.verified > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              {stats.verified} ✓
            </span>
          )}
          {stats.unverified > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {stats.unverified} ✗
            </span>
          )}
          {stats.warnings > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              {stats.warnings} ⚠
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {verification.map((v, idx) => {
          const StatusIcon = getStatusIcon(v.verified);
          const statusBadge = getStatusBadge(v.verified);
          const isExpanded = expandedVerifications.has(idx);
          const linkedEvidence = evidence.find(e => e.message === v.claim);

          return (
            <div
              key={idx}
              className={`border-2 rounded-xl p-4 transition-all ${getStatusColor(v.verified)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <StatusIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 ${statusBadge.color} text-white text-xs font-bold rounded`}>
                        {statusBadge.text}
                      </span>
                      {linkedEvidence && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                          {linkedEvidence.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{v.claim}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(idx)}
                  className="p-1 hover:bg-white/50 rounded transition-colors flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Details (always show brief summary) */}
              <div className="ml-9 text-xs text-gray-600">
                {v.details}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 ml-9 pt-3 border-t space-y-2">
                  {v.verified === true && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-green-700 mb-1">
                        ✓ Verification Passed
                      </div>
                      <div className="text-xs text-gray-600">
                        AI claim matches source data within acceptable tolerance (±10%)
                      </div>
                    </div>
                  )}

                  {v.verified === false && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-red-700 mb-1">
                        ✗ Verification Failed
                      </div>
                      <div className="text-xs text-gray-600">
                        AI claim could not be verified against source data. Values may be outside acceptable range or source rows missing.
                      </div>
                    </div>
                  )}

                  {v.verified !== true && v.verified !== false && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-yellow-700 mb-1">
                        ⚠ Low Confidence
                      </div>
                      <div className="text-xs text-gray-600">
                        Verification inconclusive. Manual review recommended.
                      </div>
                    </div>
                  )}

                  {/* Source Data References */}
                  {linkedEvidence?.source_rows && linkedEvidence.source_rows.length > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        Source Data Rows:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {linkedEvidence.source_rows.map((row, ridx) => (
                          <span
                            key={ridx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            Row {row}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Timestamp */}
                  <div className="text-xs text-gray-500 italic">
                    Verified: {new Date().toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {verification.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No verification data available</p>
          </div>
        )}
      </div>

      {/* Overall Trust Score */}
      {verification.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Overall Trust Score</span>
            <span className="text-2xl font-bold text-blue-600">
              {Math.round((stats.verified / verification.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
              style={{ width: `${(stats.verified / verification.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Based on {stats.verified} verified claims out of {verification.length} total
          </p>
        </div>
      )}
    </div>
  );
}
