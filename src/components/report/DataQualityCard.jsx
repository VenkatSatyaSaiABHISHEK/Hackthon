// File: src/components/report/DataQualityCard.jsx

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Filter, Clock, BarChart3 } from 'lucide-react';

export default function DataQualityCard({ analysis }) {
  const { dataQuality } = analysis;

  if (!dataQuality) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">Data Quality</h3>
        </div>
        <div className="p-4 bg-white rounded-lg border border-amber-200">
          <p className="text-neutral-600 text-center">No data quality metrics available</p>
        </div>
      </div>
    );
  }

  // Calculate quality score
  const qualityScore = Math.round(
    ((dataQuality.rowsProcessed - dataQuality.rowsDropped) / dataQuality.rowsProcessed) * 100
  );

  const getScoreColor = (score) => {
    if (score >= 90) return { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-600' };
    if (score >= 70) return { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600' };
    return { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' };
  };

  const scoreColors = getScoreColor(qualityScore);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">Data Quality</h3>
      </div>

      {/* Quality score badge */}
      <div className="mb-6 p-5 bg-white rounded-xl border-2 border-green-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-neutral-700">Overall Quality Score</span>
          <span className={`text-3xl font-bold ${scoreColors.text}`}>
            {qualityScore}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${scoreColors.bg}`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          {qualityScore >= 90 ? 'Excellent data quality' :
           qualityScore >= 70 ? 'Good data quality with minor issues' :
           'Data quality needs attention'}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-xs text-neutral-500 font-medium">Rows Processed</p>
          </div>
          <p className="text-2xl font-bold text-neutral-800">{dataQuality.rowsProcessed}</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-xs text-neutral-500 font-medium">Rows Dropped</p>
          </div>
          <p className="text-2xl font-bold text-neutral-800">{dataQuality.rowsDropped}</p>
          {dataQuality.rowsDropped > 0 && (
            <p className="text-xs text-red-600 mt-1">
              {((dataQuality.rowsDropped / dataQuality.rowsProcessed) * 100).toFixed(1)}% dropped
            </p>
          )}
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-xs text-neutral-500 font-medium">NaN Values</p>
          </div>
          <p className="text-2xl font-bold text-neutral-800">{dataQuality.nanCount}</p>
          {dataQuality.nanCount > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Required interpolation
            </p>
          )}
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <p className="text-xs text-neutral-500 font-medium">Smoothing</p>
          </div>
          <p className="text-lg font-semibold text-neutral-800">
            {dataQuality.smoothingApplied ? 'Applied' : 'None'}
          </p>
          {dataQuality.smoothingApplied && (
            <p className="text-xs text-blue-600 mt-1">
              Noise reduction active
            </p>
          )}
        </div>
      </div>

      {/* Interpolation method */}
      <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm mb-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <p className="text-xs text-neutral-500 font-medium">Interpolation Method</p>
        </div>
        <p className="text-sm font-semibold text-neutral-800 capitalize">
          {dataQuality.interpolationMethod || 'None'}
        </p>
        {dataQuality.interpolationMethod && (
          <p className="text-xs text-neutral-600 mt-1">
            Used to fill missing data points
          </p>
        )}
      </div>

      {/* Time range */}
      <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-green-600" />
          <p className="text-xs text-neutral-500 font-medium">Analysis Time Range</p>
        </div>
        <p className="text-xs font-mono text-neutral-700 bg-neutral-50 p-2 rounded">
          {dataQuality.timeRange || 'N/A'}
        </p>
      </div>

      {/* Data validation summary */}
      <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
        <div className="flex items-start gap-2">
          <BarChart3 className="w-4 h-4 text-green-700 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-900 mb-1">Validation Summary</p>
            <p className="text-xs text-green-800">
              {dataQuality.rowsProcessed - dataQuality.rowsDropped} valid rows • 
              {dataQuality.nanCount > 0 ? ` ${dataQuality.nanCount} interpolated values • ` : ' No missing values • '}
              {dataQuality.smoothingApplied ? 'Smoothing applied' : 'Raw data preserved'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
