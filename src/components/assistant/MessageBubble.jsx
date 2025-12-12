// src/components/assistant/MessageBubble.jsx
import React, { useState } from 'react';
import { User, Bot, Copy, Check, Download, Play } from 'lucide-react';

export default function MessageBubble({ id, role, text, ts, attachments = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  // System messages (centered)
  if (role === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 px-4 py-2 rounded-full text-xs text-gray-600 font-medium">
          {text}
        </div>
      </div>
    );
  }

  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div 
      className={`flex gap-3 mb-4 animate-fadeInUp ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="article"
      aria-label={`${role} message`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
        isUser ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role Label */}
        <div className={`text-xs font-semibold mb-1 ${isUser ? 'text-blue-700' : 'text-emerald-700'}`}>
          {isUser ? 'You' : 'AirGuard'}
        </div>

        {/* Bubble */}
        <div 
          className={`rounded-2xl px-4 py-3 shadow-md ${
            isUser 
              ? 'bg-white border-2 border-blue-200 text-gray-900'
              : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 text-gray-900'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((attachment, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                  {attachment.type === 'video' ? (
                    <>
                      <Play className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">{attachment.name}</span>
                      <button 
                        className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">{attachment.name}</span>
                      <a 
                        href={attachment.url} 
                        download 
                        className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Download
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp & Copy */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-500">{formatTime(ts)}</span>
          
          {isAssistant && (
            <button
              onClick={handleCopy}
              className="text-xs text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded px-1"
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
