// src/components/assistant/ContextPanel.jsx
import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, ExternalLink, Play, X } from 'lucide-react';

export default function ContextPanel({ lastAnalysis, onEvidenceSelect, onReplayAnalysis, onRunQuickAnalysis }) {
  const [selectedFrame, setSelectedFrame] = useState(null);

  if (!lastAnalysis) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Analysis Available</h3>
          <p className="text-sm text-gray-600 mb-6">
            Run an analysis to see contextual insights here
          </p>
          <button
            onClick={onRunQuickAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md"
          >
            Run Quick Analysis
          </button>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-y-auto space-y-6">
      {/* Analysis Score Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Last Analysis</h3>
          {lastAnalysis.comfort && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(lastAnalysis.comfort)}`}>
              {lastAnalysis.comfort}
            </span>
          )}
        </div>

        <div className="flex items-end gap-2 mb-3">
          <div className={`text-5xl font-bold ${getScoreColor(lastAnalysis.score || 0)}`}>
            {lastAnalysis.score || 0}
          </div>
          <div className="text-lg text-gray-600 mb-1">/100</div>
        </div>

        {lastAnalysis.risk_description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {lastAnalysis.risk_description}
          </p>
        )}

        {lastAnalysis.summary && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
            <p className="text-xs text-gray-600 leading-relaxed">
              {lastAnalysis.summary.slice(0, 150)}...
            </p>
          </div>
        )}
      </div>

      {/* Evidence List */}
      {lastAnalysis.evidence && lastAnalysis.evidence.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Evidence ({lastAnalysis.evidence.length})
          </h4>
          <div className="space-y-2">
            {lastAnalysis.evidence.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => onEvidenceSelect && onEvidenceSelect(item)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-900 mb-1">
                      {item.title || item.type || 'Evidence Item'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.description?.slice(0, 60) || 'Click to view details'}...
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Frame Thumbnails */}
      {lastAnalysis.frames && lastAnalysis.frames.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" />
            Frames ({lastAnalysis.frames.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {lastAnalysis.frames.slice(0, 3).map((frame, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFrame(frame)}
                className="aspect-video bg-gray-200 rounded-lg overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all group relative"
              >
                {frame.thumbnail ? (
                  <img 
                    src={frame.thumbnail} 
                    alt={`Frame ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                    <Play className="w-6 h-6 text-white opacity-70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <button
          onClick={onReplayAnalysis}
          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-sm font-semibold text-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Replay Last Analysis
        </button>

        {onRunQuickAnalysis && (
          <button
            onClick={onRunQuickAnalysis}
            className="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Quick Analysis
          </button>
        )}
      </div>

      {/* Frame Modal */}
      {selectedFrame && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFrame(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedFrame(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            {selectedFrame.thumbnail ? (
              <img 
                src={selectedFrame.thumbnail} 
                alt="Frame preview"
                className="max-w-full max-h-[85vh] object-contain"
              />
            ) : (
              <div className="w-96 h-64 flex items-center justify-center bg-gray-200">
                <Play className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
