// src/components/assistant/ChatPanel.jsx
import React, { useRef, useEffect } from 'react';
import { MessageCircle, Sparkles, User, Bot, Lightbulb, AlertCircle, Trash2 } from 'lucide-react';

export default function ChatPanel({ 
  messages, 
  isTyping, 
  hasMessages,
  suggestedQuestions,
  onQuestionClick,
  onClearChat,
  context 
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-8 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] mb-6 animate-[pulse_3s_ease-in-out_infinite]">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3">
          AI Assistant
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Ask me anything about your air quality
        </p>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-32"
        style={{ minHeight: '400px' }}
      >
        <div className="max-w-[900px] mx-auto space-y-6">
          {/* Empty State */}
          {!hasMessages && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full mb-6">
                <Sparkles className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start a Conversation</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
                Ask me about your air quality, health risks, or get personalized recommendations
              </p>

              {/* Suggested Questions Pills */}
              {suggestedQuestions && suggestedQuestions.length > 0 && (
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <p className="text-sm font-semibold text-gray-700">Suggested Questions</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => onQuestionClick(question)}
                        className="px-5 py-3 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 border-2 border-green-200 hover:border-green-300 rounded-full text-sm font-medium text-gray-800 transition-all shadow-sm hover:shadow-md active:scale-95"
                        aria-label={`Ask: ${question}`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Analysis Warning */}
              {!context?.analysis && (
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
            <div className="flex items-start gap-4 animate-fadeIn">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-3xl rounded-tl-sm px-6 py-4 max-w-2xl border border-green-200">
                <div className="flex gap-1.5" role="status" aria-live="polite" aria-label="AI is typing">
                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Clear Chat Button (Sticky at top of input area) */}
      {hasMessages && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-green-100/50 bg-gradient-to-b from-transparent to-white/80">
          <div className="max-w-[900px] mx-auto flex justify-end">
            <button
              onClick={onClearChat}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
              aria-label="Clear all messages"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div 
      className={`flex items-start gap-4 animate-slideUp ${isUser ? 'flex-row-reverse' : ''}`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'AI'} message`}
    >
      {/* Avatar */}
      <div 
        className={`
          w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
            : isError 
              ? 'bg-gradient-to-br from-red-500 to-rose-600'
              : 'bg-gradient-to-br from-green-500 to-teal-600'
          }
        `}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="w-7 h-7 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div 
        className={`
          rounded-3xl px-6 py-4 max-w-[740px] shadow-sm
          ${isUser 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
            : isError
              ? 'bg-red-50 text-red-900 rounded-tl-sm border-2 border-red-200'
              : 'bg-gradient-to-r from-green-50 to-teal-50 text-gray-900 rounded-tl-sm border border-green-200'
          }
        `}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <p 
          className={`text-xs mt-3 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}
          aria-label={`Sent at ${new Date(message.timestamp).toLocaleTimeString()}`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
