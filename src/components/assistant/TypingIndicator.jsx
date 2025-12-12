// src/components/assistant/TypingIndicator.jsx
import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-xs text-gray-500 ml-2">AirGuard is typing...</span>
    </div>
  );
}
