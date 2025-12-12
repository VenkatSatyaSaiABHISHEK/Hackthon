// File: src/hooks/useChatAssistantAI.js
// Custom hook for AI-powered chat assistant with context awareness

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY_1 || import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

/**
 * Custom hook for AI chat assistant
 * @param {Object} context - Application context (analysis, sensor data, etc.)
 * @returns {Object} Chat data and control functions
 */
export default function useChatAssistantAI(context = {}) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'typing' | 'error'
  const [error, setError] = useState(null);
  const conversationHistory = useRef([]);

  /**
   * Send a message to the AI assistant
   * @param {string} userMessage - User's message
   * @returns {Promise<string>} AI response
   */
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    conversationHistory.current.push(userMsg);
    setStatus('typing');
    setError(null);

    try {
      // Build prompt with context
      const prompt = buildChatPrompt(userMessage, context, conversationHistory.current);

      // Call Gemini API
      const response = await axios.post(
        `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024
          }
        },
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Extract AI response
      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        throw new Error('Invalid AI response');
      }

      // Add AI message to chat
      const aiMsg = {
        role: 'assistant',
        content: aiText.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
      conversationHistory.current.push(aiMsg);
      setStatus('idle');

      return aiText.trim();

    } catch (err) {
      console.error('Chat assistant error:', err);
      
      // Add error message to chat
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMsg]);
      setError(err.message || 'Failed to get AI response');
      setStatus('error');

      throw err;
    }
  }, [context]);

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    conversationHistory.current = [];
    setStatus('idle');
    setError(null);
  }, []);

  /**
   * Send a suggested question
   * @param {string} question - Predefined question
   */
  const askSuggested = useCallback(async (question) => {
    return sendMessage(question);
  }, [sendMessage]);

  /**
   * Get conversation summary
   * @returns {Object} Summary statistics
   */
  const getConversationSummary = useCallback(() => {
    return {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      aiMessages: messages.filter(m => m.role === 'assistant').length,
      startedAt: messages[0]?.timestamp || null,
      lastMessageAt: messages[messages.length - 1]?.timestamp || null
    };
  }, [messages]);

  return {
    messages,
    status,
    error,
    sendMessage,
    clearChat,
    askSuggested,
    getConversationSummary,
    isTyping: status === 'typing',
    isError: status === 'error',
    hasMessages: messages.length > 0
  };
}

/**
 * Build chat prompt with context
 * @private
 * @param {string} userMessage - Current user message
 * @param {Object} context - Application context
 * @param {Array} history - Conversation history
 * @returns {string} Formatted prompt
 */
function buildChatPrompt(userMessage, context, history) {
  const { analysis, sensorData, forecast, healthRisks } = context;

  // Build context summary
  let contextSummary = 'You are AirGuard AI Assistant, an expert in indoor air quality.\n\n';

  // Add analysis context if available
  if (analysis) {
    contextSummary += `CURRENT AIR QUALITY:\n`;
    contextSummary += `- Air Health Score: ${analysis.air_health_score}/100\n`;
    contextSummary += `- Comfort Level: ${analysis.comfort_level}\n`;
    contextSummary += `- Risk Category: ${analysis.risk_category}\n`;
    
    if (analysis.sensorSummary) {
      if (analysis.sensorSummary.pm25) {
        contextSummary += `- PM2.5 Average: ${analysis.sensorSummary.pm25.avg.toFixed(1)} µg/m³\n`;
      }
      if (analysis.sensorSummary.humidity) {
        contextSummary += `- Humidity: ${analysis.sensorSummary.humidity.avg.toFixed(1)}%\n`;
      }
      if (analysis.sensorSummary.temperature) {
        contextSummary += `- Temperature: ${analysis.sensorSummary.temperature.avg.toFixed(1)}°C\n`;
      }
    }
    contextSummary += '\n';
  }

  // Add forecast context if available
  if (forecast && forecast.predictions) {
    const nextHour = forecast.predictions[0];
    contextSummary += `FORECAST (Next Hour):\n`;
    contextSummary += `- Expected PM2.5: ${nextHour.pm25?.toFixed(1) || 'N/A'} µg/m³\n`;
    contextSummary += `- Confidence: ${(nextHour.confidence * 100).toFixed(0)}%\n\n`;
  }

  // Add health risks context if available
  if (healthRisks) {
    contextSummary += `HEALTH RISKS:\n`;
    if (healthRisks.children) contextSummary += `- Children: ${healthRisks.children.level}\n`;
    if (healthRisks.elderly) contextSummary += `- Elderly: ${healthRisks.elderly.level}\n`;
    if (healthRisks.asthma) contextSummary += `- Asthma patients: ${healthRisks.asthma.level}\n`;
    contextSummary += '\n';
  }

  // Add recent sensor data context
  if (sensorData && sensorData.length > 0) {
    const recent = sensorData.slice(-5);
    contextSummary += `RECENT READINGS (Last 5):\n`;
    contextSummary += JSON.stringify(recent, null, 2) + '\n\n';
  }

  // Add conversation history (last 5 exchanges)
  if (history.length > 0) {
    contextSummary += `CONVERSATION HISTORY:\n`;
    history.slice(-10).forEach(msg => {
      contextSummary += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    contextSummary += '\n';
  }

  // Build final prompt
  const prompt = `${contextSummary}USER QUESTION: "${userMessage}"

INSTRUCTIONS:
- Answer the user's question based on the context provided above
- Be conversational, helpful, and concise (max 150 words)
- Reference specific data points when relevant (e.g., "Your PM2.5 is 82 µg/m³")
- If asked about health risks, provide actionable advice
- If asked about ventilation, suggest specific times based on data patterns
- If the question is unclear, ask for clarification
- Do not make medical diagnoses - only provide air quality insights

ASSISTANT RESPONSE:`;

  return prompt;
}

/**
 * Get suggested questions based on context
 * @param {Object} context - Application context
 * @returns {Array<string>} Suggested questions
 */
export function getSuggestedQuestions(context = {}) {
  const suggestions = [];

  if (context.analysis) {
    suggestions.push("Why is my air quality score what it is?");
    suggestions.push("What should I do right now to improve air quality?");
  }

  if (context.forecast) {
    suggestions.push("When will air quality improve today?");
    suggestions.push("Should I open windows later?");
  }

  if (context.healthRisks) {
    suggestions.push("Is it safe for children to be here?");
    suggestions.push("What are the health risks right now?");
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push("What factors affect indoor air quality?");
    suggestions.push("How often should I check air quality?");
    suggestions.push("What is a healthy PM2.5 level?");
  }

  return suggestions.slice(0, 4); // Return max 4 suggestions
}
