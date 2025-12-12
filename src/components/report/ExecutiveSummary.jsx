// File: src/components/report/ExecutiveSummary.jsx

import React from 'react';
import { Target, Heart, AlertTriangle, TrendingUp, Activity, Shield } from 'lucide-react';

export default function ExecutiveSummary({ analysis }) {
  const { air_health_score, comfort_level, risk_category, risk_description, evidence } = analysis;

  const getScoreColor = (score) => {
    if (score >= 75) return {
      text: 'text-green-600',
      border: 'border-green-600',
      bg: 'bg-green-50',
      gradient: 'from-green-500 to-emerald-600',
      ring: 'ring-green-200'
    };
    if (score >= 50) return {
      text: 'text-amber-600',
      border: 'border-amber-600',
      bg: 'bg-amber-50',
      gradient: 'from-amber-500 to-orange-600',
      ring: 'ring-amber-200'
    };
    return {
      text: 'text-red-600',
      border: 'border-red-600',
      bg: 'bg-red-50',
      gradient: 'from-red-500 to-rose-600',
      ring: 'ring-red-200'
    };
  };

  const getComfortColor = (level) => {
    const lowerLevel = (level || '').toLowerCase();
    if (lowerLevel === 'high' || lowerLevel === 'good') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (lowerLevel === 'medium' || lowerLevel === 'moderate') {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getRiskColor = (risk) => {
    const lowerRisk = (risk || '').toLowerCase();
    if (lowerRisk === 'low' || lowerRisk === 'minimal') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (lowerRisk === 'moderate' || lowerRisk === 'medium') {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const scoreColors = getScoreColor(air_health_score);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 sm:p-8 border border-indigo-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Target className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Executive Summary</h3>
          <p className="text-sm text-neutral-600">AI-powered health assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Air Health Score - Large circular badge */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-2 border-neutral-100">
          <div className={`w-36 h-36 rounded-full border-8 ${scoreColors.border} ${scoreColors.bg} flex items-center justify-center mb-4 shadow-lg ring-4 ${scoreColors.ring}`}>
            <div className="text-center">
              <div className={`text-5xl font-bold bg-gradient-to-r ${scoreColors.gradient} bg-clip-text text-transparent`}>
                {air_health_score}
              </div>
              <div className="text-xs font-semibold text-neutral-600 mt-1">/ 100</div>
            </div>
          </div>
          <p className="text-sm font-semibold text-neutral-700">Air Health Score</p>
          <p className="text-xs text-neutral-500 mt-1">
            {air_health_score >= 75 ? 'Excellent' : air_health_score >= 50 ? 'Moderate' : 'Poor'}
          </p>
        </div>

        {/* Comfort Level */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-2 border-neutral-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-neutral-500 mb-2">Comfort Level</p>
          <span className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${getComfortColor(comfort_level)}`}>
            {comfort_level ? comfort_level.charAt(0).toUpperCase() + comfort_level.slice(1) : 'N/A'}
          </span>
        </div>

        {/* Risk Category */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-2 border-neutral-100">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xs text-neutral-500 mb-2">Risk Category</p>
          <span className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${getRiskColor(risk_category)}`}>
            {risk_category ? risk_category.charAt(0).toUpperCase() + risk_category.slice(1) : 'N/A'} Risk
          </span>
        </div>
      </div>

      {/* AI Justification */}
      <div className="p-6 bg-white rounded-xl border-2 border-indigo-200 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-neutral-800">AI Assessment</h4>
        </div>
        <p className="text-neutral-700 leading-relaxed mb-4">
          {risk_description || 'No assessment description available.'}
        </p>

        {/* Evidence highlights (if available) */}
        {evidence && evidence.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs font-semibold text-neutral-600 mb-3">Key Evidence:</p>
            <div className="space-y-2">
              {evidence.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                  <p className="text-sm text-neutral-700">{item}</p>
                </div>
              ))}
              {evidence.length > 3 && (
                <p className="text-xs text-neutral-500 italic ml-3.5">
                  +{evidence.length - 3} more evidence points
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Score interpretation guide */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-100">
        <p className="text-xs font-semibold text-neutral-600 mb-2">Score Guide:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-neutral-600">75-100: Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-neutral-600">50-74: Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-neutral-600">0-49: Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
