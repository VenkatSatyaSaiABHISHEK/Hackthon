// src/components/assistant/SuggestedQuestions.jsx
import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function SuggestedQuestions({ questions = [], onSelectQuestion, autoSend = false }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mb-4" role="region" aria-label="Suggested questions">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-yellow-600" />
        <span className="text-xs font-semibold text-gray-700">Suggested Questions:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(question, autoSend)}
            className="px-4 py-2 bg-white border-2 border-emerald-200 rounded-full text-sm font-medium text-gray-800 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label={`Suggested question: ${question}`}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
