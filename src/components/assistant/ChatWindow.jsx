// src/components/assistant/ChatWindow.jsx
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';
import { Sparkles } from 'lucide-react';

export default function ChatWindow({ 
  messages = [], 
  isTyping = false, 
  suggestedQuestions = [],
  onSelectQuestion,
  showSuggestions = true,
  lastAnalysis
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const isEmpty = messages.length === 0;

  // Generate AI suggested replies from last analysis
  const aiSuggestedReplies = lastAnalysis ? [
    `What does a score of ${lastAnalysis.score} mean?`,
    'How can I improve air quality?',
    'What are the health risks?'
  ] : [];

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {isEmpty ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Start a Conversation
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Ask me about your air quality, health risks, or get recommendations
            </p>

            {/* Empty State Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="w-full max-w-xl">
                <SuggestedQuestions 
                  questions={suggestedQuestions}
                  onSelectQuestion={onSelectQuestion}
                  autoSend={true}
                />
              </div>
            )}
          </div>
        ) : (
          // Messages
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                role={msg.role}
                text={msg.text}
                ts={msg.ts}
                attachments={msg.attachments}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl shadow-md">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* AI Suggested Replies (after messages) */}
            {!isTyping && !isEmpty && aiSuggestedReplies.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-700">Quick Replies:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestedReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectQuestion(reply, true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
