// src/components/analysis/CanvaReportCard.jsx
import React from 'react';
import { Download, Share2, FileText, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function CanvaReportCard({ score, evidence, actions }) {
  const getScoreColor = () => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-600';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const topIssues = evidence
    .filter(e => e.type === 'vision' || e.type === 'sensor')
    .slice(0, 3);

  const topAction = actions?.[0] || { action: 'No actions recommended', impact: 'none' };

  const handleDownloadPDF = () => {
    // Placeholder for PDF export functionality
    alert('PDF export will be implemented with html2pdf library');
    // TODO: Implement html2pdf export with annotated frames
  };

  const handleShare = () => {
    // Copy shareable link to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-xl text-gray-900">Visual Summary</h3>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Tile 1: Score Circle */}
      <div className="mb-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-blue-100">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Circle background */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`bg-gradient-to-br ${getScoreColor()}`} stopColor={score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'} />
                  <stop offset="100%" className={`bg-gradient-to-br ${getScoreColor()}`} stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#f97316' : '#ec4899'} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold bg-gradient-to-br ${getScoreColor()} bg-clip-text text-transparent`}>
                {score}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {getScoreLabel()}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          Air Health Score
        </div>
      </div>

      {/* Tile 2: Top Issues */}
      <div className="mb-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-100">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-bold text-gray-900">Top Issues</h4>
        </div>
        <div className="space-y-2">
          {topIssues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{idx + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{issue.message}</p>
                {issue.type && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {issue.type}
                  </span>
                )}
              </div>
            </div>
          ))}
          {topIssues.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-1 text-green-500" />
              No issues detected
            </div>
          )}
        </div>
      </div>

      {/* Tile 3: Top Recommended Action */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h4 className="font-bold text-gray-900">Recommended Action</h4>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-800 font-medium mb-2">{topAction.action}</p>
          {topAction.impact && topAction.impact !== 'none' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Expected Impact:</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                {topAction.impact}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Export Notice */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            PDF export includes all annotated frames, evidence details, and verification results for comprehensive reporting.
          </p>
        </div>
      </div>
    </div>
  );
}
