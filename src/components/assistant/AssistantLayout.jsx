// src/components/assistant/AssistantLayout.jsx
import React, { useState } from 'react';
import { Bot, Trash2, RefreshCw, PanelRightClose, PanelRightOpen, Download } from 'lucide-react';
import ChatWindow from './ChatWindow';
import ContextPanel from './ContextPanel';
import Composer from './Composer';

export default function AssistantLayout({
  messages,
  isTyping,
  suggestedQuestions,
  onSelectQuestion,
  onSendMessage,
  onClearConversation,
  onReplayAnalysis,
  onRunQuickAnalysis,
  onEvidenceSelect,
  lastAnalysis,
  onSaveConversation,
  isSending
}) {
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [messageCount] = useState(messages?.length || 0);

  const handleSaveConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      lastAnalysis: lastAnalysis,
      messageCount: messages.length
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airguard-conversation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Assistant
                </h1>
                <p className="text-sm text-gray-600">
                  Ask me anything about your air quality
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Analytics Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="text-xs text-gray-600">
                  Messages: <span className="font-bold text-emerald-700">{messageCount}</span>
                </div>
              </div>

              {/* Toggle Context Panel (Mobile) */}
              <button
                onClick={() => setShowContextPanel(!showContextPanel)}
                className="lg:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Toggle context panel"
              >
                {showContextPanel ? (
                  <PanelRightClose className="w-5 h-5 text-gray-700" />
                ) : (
                  <PanelRightOpen className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Save Conversation */}
              <button
                onClick={handleSaveConversation}
                className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                aria-label="Save conversation"
                title="Save conversation as JSON"
              >
                <Download className="w-5 h-5 text-blue-600" />
              </button>

              {/* Replay Analysis */}
              <button
                onClick={onReplayAnalysis}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
                aria-label="Replay last analysis"
                title="Replay last analysis"
              >
                <RefreshCw className="w-5 h-5 text-emerald-600" />
              </button>

              {/* Clear Conversation */}
              <button
                onClick={onClearConversation}
                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg flex-1 flex rounded-b-2xl overflow-hidden">
          {/* Chat Window (Left) */}
          <div className={`flex-1 flex flex-col ${showContextPanel ? 'lg:w-2/3' : 'w-full'}`}>
            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              suggestedQuestions={suggestedQuestions}
              onSelectQuestion={onSelectQuestion}
              showSuggestions={true}
              lastAnalysis={lastAnalysis}
            />

            {/* Composer */}
            <Composer
              onSendMessage={onSendMessage}
              lastAnalysis={lastAnalysis}
              isSending={isSending}
            />
          </div>

          {/* Context Panel (Right) */}
          {showContextPanel && (
            <div className="hidden lg:block lg:w-1/3 border-l-2 border-gray-200 bg-gray-50 overflow-y-auto">
              <ContextPanel
                lastAnalysis={lastAnalysis}
                onEvidenceSelect={onEvidenceSelect}
                onReplayAnalysis={onReplayAnalysis}
                onRunQuickAnalysis={onRunQuickAnalysis}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
