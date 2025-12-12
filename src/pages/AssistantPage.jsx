// src/pages/AssistantPage.jsx
// Production-grade AI Assistant with full-screen chat experience
// Footer is hidden when this route is active

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import ChatPanel from '../components/assistant/ChatPanel';
import AnalysisPanel from '../components/assistant/AnalysisPanel';
import InputBar from '../components/assistant/InputBar';
import useChatAssistantAI, { getSuggestedQuestions } from '../hooks/useChatAssistantAI';

export default function AssistantPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [context, setContext] = useState({});
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false); // Hidden on mobile by default

  // ============================================================
  // FOOTER HIDING LOGIC
  // Sets global flag to hide footer while this component is mounted
  // ============================================================
  useEffect(() => {
    // Option 1: Global window flag (if App.jsx reads this)
    window.__AIRGUARD_HIDE_FOOTER = true;

    // Option 2: Body class (if you prefer CSS-based hiding)
    document.body.classList.add('assistant-active');

    // Cleanup on unmount - restore footer
    return () => {
      window.__AIRGUARD_HIDE_FOOTER = false;
      document.body.classList.remove('assistant-active');
    };
  }, []);

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

  // Handle suggested question click
  const handleQuestionClick = (question) => {
    setInputMessage(question);
    // Auto-send after brief delay
    setTimeout(() => {
      if (question.trim()) {
        sendMessage(question);
      }
    }, 100);
  };

  // Handle insert summary
  const handleInsertSummary = () => {
    if (context.analysis) {
      const summaryText = `My air quality score is ${context.analysis.air_health_score}/100. Can you explain what this means?`;
      setInputMessage(summaryText);
    }
  };

  // Get suggested questions
  const suggestedQuestions = getSuggestedQuestions(context);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Spacer for fixed navbar (adjust if your navbar height differs) */}
      <div className="h-16" aria-hidden="true" />

      {/* Main Content Area - Full viewport minus navbar */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full max-w-[1800px] mx-auto flex gap-0 lg:gap-6 px-0 lg:px-6 py-0 lg:py-6">
          
          {/* LEFT PANEL - Chat (Main Area) */}
          <div className="flex-1 flex flex-col min-w-0 bg-white/80 backdrop-blur-sm rounded-none lg:rounded-2xl shadow-none lg:shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-0 lg:border border-green-100 overflow-hidden">
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              hasMessages={hasMessages}
              suggestedQuestions={suggestedQuestions}
              onQuestionClick={handleQuestionClick}
              onClearChat={clearChat}
              context={context}
            />

            {/* Input Bar - Sticky at bottom */}
            <InputBar
              value={inputMessage}
              onChange={setInputMessage}
              onSend={handleSend}
              onInsertSummary={context.analysis ? handleInsertSummary : null}
              isTyping={isTyping}
              disabled={false}
            />
          </div>

          {/* RIGHT PANEL - Analysis Summary (Desktop) */}
          <AnalysisPanel
            analysis={context.analysis}
            onToggle={() => setShowAnalysisPanel(!showAnalysisPanel)}
            isVisible={showAnalysisPanel}
          />

          {/* Mobile Analysis Toggle Button */}
          <button
            onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
            className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center z-30"
            aria-label="Toggle analysis panel"
            aria-expanded={showAnalysisPanel}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
