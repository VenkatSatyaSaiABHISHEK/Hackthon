import { forwardRef } from 'react';
import { 
  CheckCircle2, AlertCircle, TrendingUp, Wind, Eye, 
  Droplets, Thermometer, Activity, Brain, Lightbulb, 
  AlertTriangle, ChevronRight, Copy, Image as ImageIcon
} from 'lucide-react';
import Card from './Card';

const AnalysisResults = forwardRef(({ analysis }, ref) => {
  if (!analysis) return null;

  const getScoreColor = (score) => {
    if (score >= 75) return 'from-green-500 to-emerald-600';
    if (score >= 50) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return { text: 'Excellent', color: 'text-green-700', bg: 'bg-green-50' };
    if (score >= 50) return { text: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-50' };
    return { text: 'Poor', color: 'text-red-700', bg: 'bg-red-50' };
  };

  const scoreInfo = getScoreLabel(analysis.score);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div ref={ref} className="space-y-6 print:space-y-4">
      {/* Executive Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-white to-neutral-50">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary-600" />
          Executive Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center p-6">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(analysis.score)} flex items-center justify-center shadow-2xl mb-4`}>
              <div className="text-5xl font-bold text-white">
                {Math.round(analysis.score)}
              </div>
            </div>
            <span className={`text-xl font-semibold ${scoreInfo.color}`}>
              {scoreInfo.text}
            </span>
            <span className="text-sm text-neutral-600 mt-1">Air Quality Score</span>
          </div>

          {/* Key Metrics */}
          <div className="md:col-span-2 space-y-4">
            {analysis.stats && (
              <>
                <div className={`${scoreInfo.bg} rounded-xl p-4 border-l-4 ${scoreInfo.color.replace('text-', 'border-')}`}>
                  <h3 className="font-bold text-neutral-800 mb-2">Overall Assessment</h3>
                  <p className="text-sm text-neutral-700">
                    {analysis.score >= 75 
                      ? 'Air quality is within acceptable ranges. Continue monitoring and maintain current ventilation practices.'
                      : analysis.score >= 50
                      ? 'Air quality shows moderate concerns. Some improvements recommended to optimize indoor environment.'
                      : 'Air quality requires immediate attention. Significant improvements needed to ensure health and comfort.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <Wind className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                      {analysis.stats.avgCO2 ? Math.round(analysis.stats.avgCO2) : 'N/A'}
                    </div>
                    <div className="text-xs text-blue-700">Avg CO₂ (ppm)</div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <Droplets className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-900">
                      {analysis.stats.avgPM25 ? analysis.stats.avgPM25.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-xs text-purple-700">Avg PM2.5 (µg/m³)</div>
                  </div>

                  {analysis.stats.avgTemp && (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                      <Thermometer className="w-6 h-6 text-orange-600 mb-2" />
                      <div className="text-2xl font-bold text-orange-900">
                        {analysis.stats.avgTemp.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-orange-700">Avg Temperature</div>
                    </div>
                  )}

                  {analysis.stats.avgHumidity && (
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                      <Activity className="w-6 h-6 text-teal-600 mb-2" />
                      <div className="text-2xl font-bold text-teal-900">
                        {analysis.stats.avgHumidity.toFixed(1)}%
                      </div>
                      <div className="text-xs text-teal-700">Avg Humidity</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Video Analysis Evidence */}
      {analysis.videoAnalysis && analysis.videoAnalysis.visual_findings && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Eye className="w-7 h-7 text-purple-600" />
            Video Analysis Evidence
          </h2>

          {analysis.videoAnalysis.overall_assessment && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-300">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-neutral-800 mb-2">AI Assessment</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {analysis.videoAnalysis.overall_assessment}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.videoAnalysis.visual_findings.map((finding, idx) => {
              const severityColors = {
                good: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', icon: 'bg-green-500' },
                moderate: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: 'bg-yellow-500' },
                bad: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: 'bg-red-500' }
              };
              const colors = severityColors[finding.severity] || severityColors.moderate;

              return (
                <div 
                  key={idx}
                  className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 no-break`}
                  role="article"
                  aria-label={`Finding: ${finding.title}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                      {finding.category === 'ventilation' && <Wind className="w-5 h-5 text-white" />}
                      {finding.category === 'pollutant_source' && <AlertCircle className="w-5 h-5 text-white" />}
                      {finding.category === 'visible_issue' && <Eye className="w-5 h-5 text-white" />}
                      {finding.category === 'room_condition' && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neutral-800 mb-1">{finding.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {finding.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 mb-2">{finding.description}</p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Location: <span className="font-semibold">{finding.location}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Key Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-600" />
            Key Insights & Findings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.insights.map((insight, idx) => {
              const statusColors = {
                good: 'from-green-500 to-emerald-600',
                moderate: 'from-yellow-500 to-amber-600',
                warning: 'from-orange-500 to-red-500',
                danger: 'from-red-500 to-rose-600',
                bad: 'from-red-500 to-rose-600'
              };

              return (
                <div 
                  key={idx} 
                  className="bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 rounded-xl p-5 hover:shadow-lg transition-shadow no-break"
                  role="article"
                  aria-label={insight.title}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusColors[insight.status] || 'from-neutral-500 to-neutral-600'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <insight.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 flex-1">{insight.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.findings.map((finding, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recommendations / Action Plan */}
      {analysis.videoAnalysis?.recommendations && analysis.videoAnalysis.recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
            Action Plan & Recommendations
          </h2>

          <div className="space-y-3">
            {analysis.videoAnalysis.recommendations.map((rec, idx) => {
              const priorityStyles = {
                high: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-500', text: 'text-red-900' },
                medium: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-500', text: 'text-yellow-900' },
                low: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-500', text: 'text-blue-900' }
              };
              const style = priorityStyles[rec.priority] || priorityStyles.medium;

              return (
                <div 
                  key={idx}
                  className={`${style.bg} border-2 ${style.border} rounded-xl p-4 no-break`}
                  role="article"
                  aria-label={`${rec.priority} priority recommendation`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`${style.badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${style.text} mb-1`}>{rec.action}</p>
                      <p className="text-sm text-neutral-700">{rec.reason}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Confidence & Reproducibility */}
      {analysis.aiPowered && (
        <Card className="p-6 bg-gradient-to-br from-neutral-50 to-slate-100 border border-neutral-300 print:page-break-before">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-neutral-600" />
            Analysis Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-neutral-200">
              <h3 className="font-semibold text-neutral-700 mb-2 text-sm">AI Model</h3>
              <p className="text-xs text-neutral-600">
                {analysis.aiPowered ? 'Gemini 2.0 Flash Experimental (Vision)' : 'Groq LLaMA 3.3 70B Versatile'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-neutral-200">
              <h3 className="font-semibold text-neutral-700 mb-2 text-sm">Generated</h3>
              <p className="text-xs text-neutral-600">{new Date().toLocaleString()}</p>
            </div>

            {analysis.videoAnalysis && (
              <div className="md:col-span-2 bg-white rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-700 text-sm">Analysis Prompt</h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(analysis, null, 2))}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    aria-label="Copy analysis data"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Data
                  </button>
                </div>
                <p className="text-xs text-neutral-600 font-mono bg-neutral-50 p-2 rounded border border-neutral-200 overflow-x-auto">
                  Video frame analysis with environmental sensor data correlation
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
});

AnalysisResults.displayName = 'AnalysisResults';

export default AnalysisResults;
