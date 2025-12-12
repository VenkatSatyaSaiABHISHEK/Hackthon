// File: src/hooks/useChatAssistantAI.js
// Custom hook for AI-powered chat assistant with context awareness

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY_1;
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
      
      // Always use mock response as fallback
      try {
        const mockResponse = generateMockResponse(userMessage, context);
        
        const aiMsg = {
          role: 'assistant',
          content: mockResponse,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMsg]);
        conversationHistory.current.push(aiMsg);
        setStatus('idle');

        return mockResponse;
      } catch (mockErr) {
        console.error('Mock response generation failed:', mockErr);
        
        // If even mock fails, show a generic helpful message
        const fallbackMsg = {
          role: 'assistant',
          content: `I'm here to help you understand your indoor air quality! I can answer questions about:

• Air quality scores and what they mean
• How to improve your air quality
• PM2.5 levels and health effects
• Best times to ventilate your space
• Health risks for sensitive groups

${context?.analysis ? `I can see you have an air quality score of ${context.analysis.air_health_score}/100. Try asking me about it!` : 'Run an analysis first to get personalized insights!'}`,
          timestamp: new Date().toISOString(),
          isError: false
        };

        setMessages(prev => [...prev, fallbackMsg]);
        setStatus('idle');

        return fallbackMsg.content;
      }
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

/**
 * Generate mock AI response when API is unavailable
 * @private
 * @param {string} userMessage - User's message
 * @param {Object} context - Application context
 * @returns {string} Mock response
 */
function generateMockResponse(userMessage, context) {
  const lowerMsg = userMessage.toLowerCase();
  const { analysis } = context;

  if (lowerMsg.includes('score') || lowerMsg.includes('what it is')) {
    if (analysis?.air_health_score) {
      return `Your air quality score of ${analysis.air_health_score}/100 indicates **${analysis.comfort_level || 'moderate'}** air quality. This score is calculated based on multiple factors including PM2.5 levels, CO₂ concentration, temperature, and humidity. ${
        analysis.air_health_score >= 75 
          ? 'Your indoor air quality is within acceptable ranges. Keep up the good work with ventilation!' 
          : analysis.air_health_score >= 50
          ? 'There\'s room for improvement. Consider increasing ventilation and reducing pollution sources.'
          : 'Your air quality needs attention. I recommend immediate action like opening windows and using air purifiers.'
      }`;
    }
    return "I'd love to explain your air quality score! Please run an analysis first from the Analysis page so I can see your current readings.";
  }

  if (lowerMsg.includes('improve') || lowerMsg.includes('what should i do')) {
    return `Here are my top recommendations to improve your indoor air quality:

1. **Ventilate**: Open windows for 15-20 minutes every few hours to bring in fresh air
2. **Clean regularly**: Vacuum with HEPA filters and dust surfaces weekly
3. **Use air purifiers**: Place them in high-traffic areas, especially bedrooms
4. **Control humidity**: Keep it between 30-50% to prevent mold
5. **Avoid pollution sources**: Minimize cooking smoke, candles, and aerosols

${analysis?.air_health_score ? `Given your current score of ${analysis.air_health_score}/100, focus especially on ventilation and reducing indoor pollutants.` : 'Run an analysis to get personalized recommendations!'}`;
  }

  if (lowerMsg.includes('pm2.5') || lowerMsg.includes('pm 2.5')) {
    return `PM2.5 refers to fine particulate matter smaller than 2.5 micrometers. These tiny particles can penetrate deep into your lungs and bloodstream. 

**Healthy levels**: Below 12 µg/m³
**Moderate**: 12-35 µg/m³
**Unhealthy**: Above 35 µg/m³

${analysis?.sensorSummary?.pm25?.avg ? `Your current PM2.5 level is ${analysis.sensorSummary.pm25.avg.toFixed(1)} µg/m³.` : 'Check your readings from the dashboard for current levels.'}`;
  }

  if (lowerMsg.includes('health') || lowerMsg.includes('risk')) {
    return `Poor indoor air quality can affect your health in several ways:

**Short-term effects:**
- Respiratory irritation
- Headaches and fatigue
- Eye, nose, and throat irritation

**Long-term effects:**
- Increased asthma symptoms
- Cardiovascular issues
- Reduced lung function

**Most vulnerable:** Children, elderly, and people with respiratory conditions.

${analysis?.air_health_score && analysis.air_health_score < 50 ? '⚠️ Your current air quality warrants attention. Consider improving ventilation immediately.' : 'Maintaining good air quality helps prevent these issues!'}`;
  }

  if (lowerMsg.includes('when') || lowerMsg.includes('open window')) {
    return `The best times to open windows depend on outdoor air quality:

**Best times:**
- Early morning (6-8 AM) when outdoor pollution is lower
- Late evening (after 8 PM) when traffic decreases
- After rain (air is cleaner)

**Avoid:**
- Rush hours (7-9 AM, 5-7 PM)
- During cooking (keep exhaust on instead)
- When outdoor AQI is poor

**Pro tip:** Open windows on opposite sides of your home for cross-ventilation!`;
  }

  if (lowerMsg.includes('safe') || lowerMsg.includes('children')) {
    return `Children are more vulnerable to poor air quality because:
- They breathe faster and inhale more air per body weight
- Their lungs are still developing
- They're more active indoors

${analysis?.air_health_score 
  ? `With your current score of ${analysis.air_health_score}/100: ${
      analysis.air_health_score >= 75 
        ? '✅ Air quality is acceptable for children'
        : analysis.air_health_score >= 50
        ? '⚠️ Monitor sensitive children, consider air purifiers'
        : '🚨 Improve ventilation immediately for children\'s safety'
    }` 
  : 'Run an analysis to check if current levels are safe for children.'}`;
  }

  // Default response
  return `I'm here to help you understand and improve your indoor air quality! 

You can ask me about:
- Your current air quality score
- How to improve air quality
- Health risks and safety
- PM2.5 levels and meanings
- Best times to ventilate
- Recommendations for specific groups

${!analysis ? '\n💡 **Tip**: Run an analysis first so I can give you personalized insights about your space!' : ''}`;
}
