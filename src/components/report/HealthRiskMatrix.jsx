// File: src/components/report/HealthRiskMatrix.jsx
// Displays personalized health risk levels for different demographics

import React from 'react';
import { Heart, Users, Baby, User, Activity } from 'lucide-react';

/**
 * HealthRiskMatrix Component
 * @param {Object} props
 * @param {Object} props.health_risk_groups - Health risk data for demographics
 * @param {Object} props.health_risk_groups.children - Children risk data
 * @param {Object} props.health_risk_groups.elderly - Elderly risk data
 * @param {Object} props.health_risk_groups.asthma - Asthma patients risk data
 * @param {Object} props.health_risk_groups.adults - Healthy adults risk data
 */
export default function HealthRiskMatrix({ health_risk_groups }) {
  if (!health_risk_groups) {
    return (
      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No health risk data available</p>
      </div>
    );
  }

  const demographics = [
    {
      key: 'children',
      label: 'Children',
      icon: Baby,
      description: 'Ages 0-12, developing lungs',
      iconBg: 'from-pink-500 to-rose-600'
    },
    {
      key: 'elderly',
      label: 'Elderly',
      icon: Users,
      description: 'Ages 65+, reduced capacity',
      iconBg: 'from-purple-500 to-indigo-600'
    },
    {
      key: 'asthma',
      label: 'Asthma Patients',
      icon: Activity,
      description: 'Respiratory conditions',
      iconBg: 'from-red-500 to-orange-600'
    },
    {
      key: 'adults',
      label: 'Healthy Adults',
      icon: User,
      description: 'Ages 18-64, baseline tolerance',
      iconBg: 'from-blue-500 to-cyan-600'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Heart className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">Health Risk Matrix</h3>
          <p className="text-sm text-neutral-600">Personalized risk assessment by demographic</p>
        </div>
      </div>

      {/* Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demographics.map((demo) => {
          const riskData = health_risk_groups[demo.key];
          if (!riskData) return null;

          const { level, score, advice, reasoning } = riskData;
          const riskColors = getRiskColors(level);
          const Icon = demo.icon;

          return (
            <div
              key={demo.key}
              className="bg-white rounded-xl p-6 border-2 border-neutral-200 hover:border-pink-300 hover:shadow-xl transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${demo.iconBg} rounded-lg flex items-center justify-center shadow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{demo.label}</h4>
                    <p className="text-xs text-neutral-500">{demo.description}</p>
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={`px-3 py-1.5 rounded-full border-2 ${riskColors.border} ${riskColors.bg}`}>
                  <span className={`font-bold text-xs uppercase ${riskColors.text}`}>
                    {level || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Risk Score Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-600">Risk Score</span>
                  <span className={`text-sm font-bold ${riskColors.text}`}>{score || 0}/100</span>
                </div>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${riskColors.barBg} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(score || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Advice */}
              <div className={`p-3 ${riskColors.lightBg} rounded-lg border ${riskColors.lightBorder} mb-3`}>
                <p className="text-xs font-semibold text-neutral-700 mb-1">Recommended Action:</p>
                <p className="text-sm text-neutral-800 leading-snug">{advice || 'No specific advice available'}</p>
              </div>

              {/* Reasoning (collapsible) */}
              {reasoning && (
                <details className="group">
                  <summary className="text-xs text-neutral-600 cursor-pointer hover:text-neutral-900 font-semibold list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    Why this risk level?
                  </summary>
                  <p className="mt-2 text-xs text-neutral-600 leading-relaxed pl-4 border-l-2 border-neutral-300">
                    {reasoning}
                  </p>
                </details>
              )}
            </div>
          );
        })}
      </div>

      {/* Risk Level Legend */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-neutral-200">
        <p className="text-xs font-semibold text-neutral-700 mb-3">Risk Level Guide:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-neutral-600">High Risk: Immediate action required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-neutral-600">Moderate Risk: Monitor closely</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-neutral-600">Low Risk: Safe conditions</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-900">
          <span className="font-semibold">Medical Disclaimer:</span> This assessment is for informational purposes only and does not constitute medical advice. 
          Consult a healthcare professional for personalized medical guidance.
        </p>
      </div>
    </div>
  );
}

/**
 * Get color scheme based on risk level
 * @private
 */
function getRiskColors(level) {
  const lowerLevel = (level || '').toLowerCase();

  if (lowerLevel === 'high' || lowerLevel === 'critical' || lowerLevel === 'severe') {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      barBg: 'bg-gradient-to-r from-red-500 to-rose-600',
      lightBg: 'bg-red-50',
      lightBorder: 'border-red-200'
    };
  }

  if (lowerLevel === 'moderate' || lowerLevel === 'medium' || lowerLevel === 'elevated') {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      barBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50',
      lightBorder: 'border-amber-200'
    };
  }

  if (lowerLevel === 'low' || lowerLevel === 'minimal' || lowerLevel === 'safe') {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      barBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      lightBg: 'bg-green-50',
      lightBorder: 'border-green-200'
    };
  }

  // Unknown/default
  return {
    bg: 'bg-neutral-100',
    text: 'text-neutral-800',
    border: 'border-neutral-300',
    barBg: 'bg-gradient-to-r from-neutral-500 to-gray-600',
    lightBg: 'bg-neutral-50',
    lightBorder: 'border-neutral-200'
  };
}
