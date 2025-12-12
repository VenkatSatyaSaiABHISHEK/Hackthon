// File: src/pages/ChatAssistant.jsx
// AI-powered chat assistant for air quality questions

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Trash2, Sparkles, User, Bot } from 'lucide-react';
import useChatAssistantAI, { getSuggestedQuestions } from '../hooks/useChatAssistantAI';

export default function ChatAssistant() {
  const [inputMessage, setInputMessage] = useState('');
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);

  // Load context from localStorage
  useEffect(() => {
    try {
      const lastAnalysisStr = localStorage.getItem('airguard_last_analysis');
      if (lastAnalysisStr) {
        const analysis = JSON.parse(lastAnalysisStr);
        setContext({
          analysis,
          sensorData: analysis.chartData || [],
          forecast: null,
          healthRisks: null
        });
      }
    } catch (err) {
      console.error('Failed to load context:', err);
    }
  }, []);

  const { messages, sendMessage, clearChat, isTyping, hasMessages } = useChatAssistantAI(context);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get suggested questions
  const suggestedQuestions = getSuggestedQuestions(context);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">AI Assistant</h1>
                <p className="text-neutral-600 mt-1">Ask me anything about your air quality</p>
              </div>
            </div>

            {hasMessages && (
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!hasMessages && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Start a Conversation</h3>
                <p className="text-neutral-600 mb-6">Ask me about your air quality, health risks, or get recommendations</p>

                {/* Suggested Questions */}
                {suggestedQuestions.length > 0 && (
                  <div className="max-w-md mx-auto">
                    <p className="text-sm font-semibold text-neutral-700 mb-3">Suggested Questions:</p>
                    <div className="space-y-2">
                      {suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputMessage(question);
                            setTimeout(handleSend, 100);
                          }}
                          className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg text-sm text-neutral-800 transition-colors"
                        >
                          💡 {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!context.analysis && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Note:</span> No analysis data found. 
                      Run an analysis first for context-aware responses.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Message List */}
            {messages.map((message, idx) => (
              <MessageBubble key={idx} message={message} />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-green-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-neutral-200 p-4 bg-neutral-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your air quality..."
                disabled={isTyping}
                className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-green-500 focus:outline-none disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            <p className="text-xs text-neutral-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Context Info */}
        {context.analysis && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-600">
              <span className="font-semibold">Context Loaded:</span> Air Health Score {context.analysis.air_health_score}/100 • 
              {context.analysis.sensorSummary?.pm25 && ` PM2.5 ${context.analysis.sensorSummary.pm25.avg.toFixed(1)} µg/m³`} • 
              {context.sensorData.length} data points
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
          : isError 
            ? 'bg-gradient-to-br from-red-600 to-rose-600'
            : 'bg-gradient-to-br from-green-600 to-teal-600'
        }
      `}>
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`
        rounded-2xl px-4 py-3 max-w-md
        ${isUser 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : isError
            ? 'bg-red-100 text-red-900 rounded-tl-none border-2 border-red-300'
            : 'bg-green-100 text-neutral-900 rounded-tl-none'
        }
      `}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-neutral-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
