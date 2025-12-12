// src/components/assistant/AnalysisPanel.jsx
import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Wind, 
  Droplet, 
  CheckCircle, 
  Lightbulb, 
  Download, 
  RefreshCw,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';

export default function AnalysisPanel({ analysis, onToggle, isVisible }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!analysis) {
    return (
      <aside 
        className={`
          w-full lg:w-[380px] xl:w-[420px] flex-none
          bg-white/70 backdrop-blur-md rounded-2xl p-6 
          shadow-lg border border-gray-200
          ${isVisible ? 'block' : 'hidden lg:block'}
        `}
        aria-labelledby="analysis-panel-title"
      >
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 id="analysis-panel-title" className="text-lg font-bold text-gray-900 mb-2">
            No Analysis Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Run an air quality analysis to see insights here
          </p>
          <a
            href="/analysis"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Go to Analysis
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </aside>
    );
  }

  const handleExportPDF = async () => {
    setIsExporting(true);
    // TODO: Implement actual PDF export
    setTimeout(() => {
      alert('PDF export coming soon!');
      setIsExporting(false);
    }, 1000);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airguard-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside 
      className={`
        w-full lg:w-[380px] xl:w-[420px] flex-none
        overflow-y-auto overscroll-contain
        bg-white/70 backdrop-blur-md rounded-2xl 
        shadow-lg border border-green-100/50
        ${isVisible ? 'block' : 'hidden lg:block'}
      `}
      aria-labelledby="analysis-panel-title"
    >
      {/* Mobile Close Button */}
      <div className="lg:hidden sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          aria-label="Close analysis panel"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Chat
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Panel Title */}
        <div>
          <h2 id="analysis-panel-title" className="text-xl font-bold text-gray-900 mb-1">
            Analysis Summary
          </h2>
          <p className="text-sm text-gray-600">
            Real-time insights from your latest scan
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-md p-5 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Air Quality Score</h3>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div 
              className={`
                w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold
                ${analysis.air_health_score >= 75 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.4)]' 
                  : analysis.air_health_score >= 50
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_20px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.4)]'
                }
              `}
              role="img"
              aria-label={`Air quality score: ${analysis.air_health_score} out of 100`}
            >
              {analysis.air_health_score}
            </div>
          </div>

          <div className="text-center">
            <span 
              className={`
                inline-block px-4 py-1.5 rounded-full text-sm font-semibold
                ${analysis.air_health_score >= 75 
                  ? 'bg-green-100 text-green-800' 
                  : analysis.air_health_score >= 50
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
                }
              `}
            >
              {analysis.air_health_score >= 75 ? 'Excellent' : analysis.air_health_score >= 50 ? 'Moderate' : 'Poor'}
            </span>
          </div>
        </div>

        {/* Summary Metrics */}
        {analysis.sensorSummary && (
          <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-md p-5 border border-teal-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-gray-900">Key Metrics</h3>
            </div>
            
            <div className="space-y-3">
              {analysis.sensorSummary?.pm25?.avg != null && (
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">PM2.5</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {analysis.sensorSummary.pm25.avg.toFixed(1)} µg/m³
                  </span>
                </div>
              )}

              {analysis.sensorSummary?.co2?.avg != null && (
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">CO₂</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {analysis.sensorSummary.co2.avg.toFixed(0)} ppm
                  </span>
                </div>
              )}

              {analysis.sensorSummary?.temperature?.avg != null && (
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Temperature</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {analysis.sensorSummary.temperature.avg.toFixed(1)}°C
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evidence List */}
        {analysis.evidence && analysis.evidence.length > 0 && (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">Evidence</h3>
              <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {analysis.evidence.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {analysis.evidence.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3 bg-white/80 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                  <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                    {item.type}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-5 border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl transition-all disabled:opacity-50"
              aria-label="Download PDF report"
            >
              {isExporting ? (
                <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-green-600" />
              )}
              <span className="text-xs font-semibold text-gray-700">PDF</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all"
              aria-label="Download JSON data"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">JSON</span>
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-md p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">Quick Tips</h3>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Open windows for 15-20 min daily</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Use air purifier with HEPA filter</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Add indoor plants for natural purification</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Monitor during cooking hours</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
