// src/pages/AnalysisResultPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, RefreshCw, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import AnnotatedVideoCanvas from '../components/analysis/AnnotatedVideoCanvas';
import FrameTimeline from '../components/analysis/FrameTimeline';
import EvidencePanel from '../components/analysis/EvidencePanel';
import VerificationPanel from '../components/analysis/VerificationPanel';
import CanvaReportCard from '../components/analysis/CanvaReportCard';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [overlayMode, setOverlayMode] = useState('both'); // 'vision' | 'sensor' | 'both'

  useEffect(() => {
    fetchAnalysisResult();
  }, [id]);

  const fetchAnalysisResult = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/analyze/result/${id}`);
      if (!response.ok) throw new Error('Analysis not found');
      
      const data = await response.json();
      setAnalysisData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      setLoading(false);
    }
  };

  const downloadRawJSON = () => {
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airguard-analysis-${id}.json`;
    a.click();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (confidence) => {
    const colors = {
      high: 'text-green-700 bg-green-100',
      medium: 'text-yellow-700 bg-yellow-100',
      low: 'text-red-700 bg-red-100'
    };
    return colors[confidence] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
          <button onClick={() => navigate('/analysis')} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  const { ai_result, frames, verification, prompt_used, deterministicMetrics } = analysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Air Quality Analysis Report
              </h1>
              <p className="text-gray-600">Analysis ID: {id}</p>
            </div>
            
            {/* Score Pill */}
            <div className={`px-6 py-3 rounded-2xl font-bold text-2xl ${getScoreColor(ai_result.air_health_score)}`}>
              {ai_result.air_health_score}/100
            </div>
          </div>

          {/* Risk Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-gray-900 text-lg">{ai_result.risk_description}</p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full font-semibold ${getConfidenceColor(ai_result.confidence)}`}>
              Confidence: {ai_result.confidence.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
              Model: {ai_result.trace?.model || 'N/A'}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
              Frames Analyzed: {frames.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={downloadRawJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
            <button
              onClick={() => navigate('/analysis')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              New Analysis
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showPrompt ? 'Hide' : 'Show'} Prompt
            </button>
          </div>

          {/* Prompt Display */}
          {showPrompt && (
            <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-96">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">AI Prompt Used (for reproducibility):</span>
                <button
                  onClick={() => navigator.clipboard.writeText(prompt_used)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  Copy
                </button>
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap">{prompt_used}</pre>
            </div>
          )}
        </div>

        {/* Main Visual Report Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Video + Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Canvas */}
            <AnnotatedVideoCanvas
              frames={frames}
              evidence={ai_result.evidence}
              selectedFrame={selectedFrame}
              onFrameSelect={setSelectedFrame}
              overlayMode={overlayMode}
              onOverlayModeChange={setOverlayMode}
            />

            {/* Frame Timeline */}
            <FrameTimeline
              frames={frames}
              selectedFrame={selectedFrame}
              onFrameSelect={setSelectedFrame}
              evidence={ai_result.evidence}
            />

            {/* Canva-style Report Cards */}
            <CanvaReportCard
              score={ai_result.air_health_score}
              evidence={ai_result.evidence}
              actions={ai_result.recommended_actions}
            />
          </div>

          {/* Right Column: Evidence + Verification */}
          <div className="space-y-6">
            {/* Evidence Panel */}
            <EvidencePanel
              evidence={ai_result.evidence}
              frames={frames}
              deterministicMetrics={deterministicMetrics}
              onEvidenceClick={(idx) => {
                const ev = ai_result.evidence[idx];
                if (ev.frame_index !== undefined) {
                  setSelectedFrame(ev.frame_index);
                }
              }}
            />

            {/* Verification Panel */}
            <VerificationPanel
              verification={verification}
              evidence={ai_result.evidence}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
