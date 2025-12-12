// src/components/assistant/Composer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, FileText, Loader2 } from 'lucide-react';

export default function Composer({ onSendMessage, onAttachFile, lastAnalysis, isSending = false }) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 144) + 'px'; // max 6 rows
    }
  }, [message]);

  // Focus composer on "/" shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement !== textareaRef.current) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const fileAttachments = files.map(file => ({
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'file',
      url: URL.createObjectURL(file),
      file
    }));
    setAttachments(prev => [...prev, ...fileAttachments]);
  };

  const insertSummary = () => {
    if (lastAnalysis && lastAnalysis.summary) {
      const summaryText = `Here's my last analysis summary:\n\n${lastAnalysis.summary}`;
      setMessage(prev => prev + (prev ? '\n\n' : '') + summaryText);
      textareaRef.current?.focus();
    }
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="border-t-2 border-gray-200 bg-white p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((att, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs"
            >
              <FileText className="w-3 h-3 text-emerald-600" />
              <span className="text-gray-700 font-medium">{att.name}</span>
              <button 
                onClick={() => removeAttachment(idx)}
                className="ml-1 text-gray-500 hover:text-red-600"
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Attach Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Attach file or video"
          disabled={isSending}
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*,.csv,.json"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Insert Summary Button */}
        {lastAnalysis && (
          <button
            onClick={insertSummary}
            className="flex-shrink-0 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          >
            Insert Summary
          </button>
        )}

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your air quality..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none transition-all text-sm"
            rows={1}
            disabled={isSending}
            aria-label="Message input"
          />
          <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
            Press <kbd className="px-1 bg-gray-100 rounded">Enter</kbd> to send
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || isSending}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Send className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press <kbd className="px-1 bg-gray-100 rounded">Shift + Enter</kbd> for new line · 
        Press <kbd className="px-1 bg-gray-100 rounded">/</kbd> to focus input
      </div>
    </div>
  );
}
