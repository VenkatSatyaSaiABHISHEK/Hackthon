// File: src/components/report/ReproducibilityBlock.jsx

import React, { useState } from 'react';
import { Code, Copy, RotateCw, ChevronDown, ChevronUp, CheckCircle2, Cpu } from 'lucide-react';

export default function ReproducibilityBlock({ promptText, modelName, onReplay }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!promptText) {
    return (
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No prompt data available for reproducibility</p>
      </div>
    );
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleReplay = () => {
    if (onReplay) {
      onReplay();
    }
  };

  // Anonymize sensitive data in prompt display (basic example)
  const displayPrompt = promptText.replace(/API[_\s]?KEY[:\s]+[\w-]+/gi, 'API_KEY: [REDACTED]');

  return (
    <div className="bg-gradient-to-br from-slate-50 to-neutral-50 rounded-xl p-6 border border-slate-300 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-neutral-800 rounded-xl flex items-center justify-center shadow-md">
          <Code className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-neutral-900">Reproducibility</h3>
          <p className="text-sm text-neutral-600">Replay this analysis or inspect the prompt</p>
        </div>
      </div>

      {/* Model info */}
      <div className="mb-4 p-4 bg-white rounded-lg border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-0.5">AI Model Used</p>
            <p className="text-lg font-bold text-neutral-900">{modelName || 'Unknown Model'}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          {copySuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy Prompt</span>
            </>
          )}
        </button>

        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <RotateCw className="w-5 h-5" />
          <span>Replay Analysis</span>
        </button>
      </div>

      {/* Collapsible prompt panel */}
      <div className="bg-white rounded-lg border-2 border-slate-300 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-4 focus:ring-inset focus:ring-slate-300"
        >
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-neutral-900">
              {isExpanded ? 'Hide Prompt' : 'View Prompt'}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-600" />
          )}
        </button>

        {isExpanded && (
          <div className="p-4 border-t-2 border-slate-200 bg-slate-50">
            <div className="relative">
              <pre className="text-xs font-mono text-neutral-800 bg-white p-4 rounded-lg border border-slate-300 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
                {displayPrompt}
              </pre>
              
              {/* Character count */}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  {promptText.length.toLocaleString()} characters
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline focus:outline-none"
                >
                  Copy to clipboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reproducibility info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">Reproducibility Note:</span> This prompt represents the exact input sent to the AI model. 
          Replaying with the same prompt and model may produce slightly different results due to AI non-determinism.
        </p>
      </div>

      {/* Usage tips */}
      <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-300">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold">Use Cases:</span> Copy the prompt to run it in other AI tools, verify analysis methodology, 
          or replay the analysis to compare results over time.
        </p>
      </div>
    </div>
  );
}
