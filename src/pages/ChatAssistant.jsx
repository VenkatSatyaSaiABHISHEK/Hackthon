// File: src/pages/ChatAssistant.jsx
// Premium AI Assistant UI - Google Bard/Gemini inspired design

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Trash2, Sparkles, User, Bot, Download, RefreshCw, AlertCircle, TrendingUp, Wind, Activity, Droplet, Lightbulb, CheckCircle } from 'lucide-react';
import useChatAssistantAI, { getSuggestedQuestions } from '../hooks/useChatAssistantAI';

export default function ChatAssistant() {
  const [inputMessage, setInputMessage] = useState('');
  const [context, setContext] = useState({});
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20 pb-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT PANEL - Chat Conversation */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                AI Assistant
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ask me anything about your air quality
              </p>
            </div>

            {/* Chat Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden border border-green-100">
              {/* Messages Area */}
              <div className="h-[600px] overflow-y-auto p-6 sm:p-8 space-y-6">
                {!hasMessages && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full mb-6">
                      <Sparkles className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Start a Conversation</h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
                      Ask me about your air quality, health risks, or get recommendations
                    </p>

                    {/* Suggested Questions Pills */}
                    {suggestedQuestions.length > 0 && (
                      <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Lightbulb className="w-5 h-5 text-amber-500" />
                          <p className="text-sm font-semibold text-gray-700">Suggested Questions</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                          {suggestedQuestions.map((question, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInputMessage(question);
                                setTimeout(handleSend, 100);
                              }}
                              className="px-5 py-3 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 border-2 border-green-200 hover:border-green-300 rounded-full text-sm font-medium text-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!context.analysis && (
                      <div className="mt-8 p-5 bg-amber-50/80 border-2 border-amber-200 rounded-2xl max-w-lg mx-auto">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-amber-900 mb-1">No Analysis Data</p>
                            <p className="text-sm text-amber-700">
                              Run an analysis first for context-aware responses.
                            </p>
                          </div>
                        </div>
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
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-3xl rounded-tl-sm px-6 py-4 max-w-2xl border border-green-200">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t-2 border-green-100 bg-gradient-to-r from-green-50/50 to-teal-50/50 p-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your air quality..."
                    disabled={isTyping}
                    className="flex-1 px-5 py-4 text-base border-2 border-green-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-7 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 px-1">
                  <p className="text-xs text-gray-500">
                    Press <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-mono">Enter</kbd> to send • <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-mono">Shift+Enter</kbd> for new line
                  </p>
                  {hasMessages && (
                    <button
                      onClick={clearChat}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Analysis Summary */}
          <div className="lg:col-span-4 space-y-6">{context.analysis ? (
              <>
                {/* Score Card */}
                <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Air Quality Score</h3>
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className={`
                      w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold
                      ${context.analysis.air_health_score >= 75 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.4)]' 
                        : context.analysis.air_health_score >= 50
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_20px_rgba(245,158,11,0.4)]'
                        : 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.4)]'
                      }
                    `}>
                      {context.analysis.air_health_score}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <span className={`
                      inline-block px-4 py-1.5 rounded-full text-sm font-semibold
                      ${context.analysis.air_health_score >= 75 
                        ? 'bg-green-100 text-green-800' 
                        : context.analysis.air_health_score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {context.analysis.air_health_score >= 75 ? 'Excellent' : context.analysis.air_health_score >= 50 ? 'Moderate' : 'Poor'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 text-center leading-relaxed">
                    {context.analysis.air_health_score >= 75 
                      ? 'Air quality is within acceptable ranges. Keep monitoring!'
                      : context.analysis.air_health_score >= 50
                      ? 'Air quality shows moderate concerns. Some improvements recommended.'
                      : 'Air quality requires attention. Immediate action recommended.'
                    }
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-teal-100">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-bold text-gray-900">Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {context.analysis.sensorSummary?.pm25 && (
                      <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-teal-100">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">PM2.5</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {context.analysis.sensorSummary.pm25.avg.toFixed(1)} µg/m³
                        </span>
                      </div>
                    )}

                    {context.analysis.sensorSummary?.co2 && (
                      <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-teal-100">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">CO₂</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {context.analysis.sensorSummary.co2.avg.toFixed(0)} ppm
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-teal-100">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-500" />
                        <span className="text-sm font-medium text-gray-700">Data Points</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {context.sensorData?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidence Card */}
                {context.analysis.evidence && context.analysis.evidence.length > 0 && (
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Evidence</h3>
                      <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {context.analysis.evidence.length}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {context.analysis.evidence.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="p-3 bg-white/80 rounded-xl border border-blue-100">
                          <p className="text-xs font-semibold text-blue-600 mb-1">{item.type}</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-amber-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-gray-900">Quick Tips</h3>
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
              </>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-8 border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Analysis Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Run an air quality analysis to see insights here
                </p>
                <button
                  onClick={() => window.location.href = '/home'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Go to Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component - Google Bard style
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
          : isError 
            ? 'bg-gradient-to-br from-red-500 to-rose-600'
            : 'bg-gradient-to-br from-green-500 to-teal-600'
        }
      `}>
        {isUser ? (
          <User className="w-7 h-7 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`
        rounded-3xl px-6 py-4 max-w-2xl shadow-sm
        ${isUser 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
          : isError
            ? 'bg-red-50 text-red-900 rounded-tl-sm border-2 border-red-200'
            : 'bg-gradient-to-r from-green-50 to-teal-50 text-gray-900 rounded-tl-sm border border-green-200'
        }
      `}>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-3 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
