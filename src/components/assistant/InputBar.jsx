// src/components/assistant/InputBar.jsx
import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, FileText } from 'lucide-react';

export default function InputBar({ 
  value, 
  onChange, 
  onSend, 
  onInsertSummary,
  isTyping, 
  disabled 
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isTyping) {
        onSend();
      }
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white via-white to-transparent backdrop-blur-md border-t border-green-100/50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {/* Input Container */}
        <div className="relative bg-white border-2 border-green-200 rounded-3xl shadow-lg hover:shadow-xl transition-shadow focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100">
          <div className="flex items-end gap-2 px-4 py-3">
            {/* Attach Button */}
            <button
              type="button"
              disabled={disabled}
              aria-label="Attach file"
              className="flex-shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Insert Summary Button */}
            {onInsertSummary && (
              <button
                type="button"
                onClick={onInsertSummary}
                disabled={disabled}
                aria-label="Insert analysis summary"
                className="flex-shrink-0 px-3 py-2 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Insert Summary</span>
              </button>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your air quality..."
              disabled={disabled || isTyping}
              aria-label="Message input"
              aria-live="polite"
              rows={1}
              className="flex-1 resize-none bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-none disabled:cursor-not-allowed min-h-[40px] max-h-[120px] py-2"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim() || isTyping || disabled}
              aria-label={isTyping ? 'Sending message' : 'Send message'}
              className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center justify-center gap-4 mt-3 px-2">
          <p className="text-xs text-gray-500">
            <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono shadow-sm">Enter</kbd>
            {' '}to send
            <span className="mx-2">•</span>
            <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono shadow-sm">Shift + Enter</kbd>
            {' '}for new line
          </p>
        </div>
      </div>
    </div>
  );
}
