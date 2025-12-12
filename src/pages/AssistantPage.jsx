// src/pages/AssistantPage.jsx
import React, { useState, useEffect } from 'react';
import AssistantLayout from '../components/assistant/AssistantLayout';

// ============================================================
// 🔴 PLUG AI HOOK HERE
// ============================================================
// Uncomment and integrate real AI chat hook when available:
// import { useChatAssistantAI } from '../hooks/useChatAssistantAI';
// const { messages, sendMessage, isLoading } = useChatAssistantAI({ context: lastAnalysis });

// ============================================================
// 📊 DEMO DATA (Last Analysis)
// ============================================================
const DEMO_LAST_ANALYSIS = {
  score: 72,
  comfort: 'Medium',
  risk_description: 'Air quality is acceptable but some pollutants may be a concern for sensitive individuals.',
  summary: 'Your indoor air quality analysis reveals moderate PM2.5 levels (42 µg/m³) with occasional spikes during cooking hours. Ventilation appears adequate but could be improved in bedroom areas. Overall comfort score is 72/100.',
  evidence: [
    {
      title: 'PM2.5 Spike Detected',
      type: 'pollution',
      description: 'Elevated particulate matter observed between 6:00-7:30 PM, likely from cooking activities.'
    },
    {
      title: 'Low Ventilation',
      type: 'airflow',
      description: 'Bedroom area shows reduced air circulation during nighttime hours.'
    },
    {
      title: 'Temperature Fluctuation',
      type: 'comfort',
      description: 'Temperature variance of 4°C detected across different rooms.'
    }
  ],
  frames: [
    { thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2393c5fd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="24"%3EFrame 1%3C/text%3E%3C/svg%3E' },
    { thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2310b981" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="24"%3EFrame 2%3C/text%3E%3C/svg%3E' },
    { thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f59e0b" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="24"%3EFrame 3%3C/text%3E%3C/svg%3E' }
  ]
};

// ============================================================
// 💬 SUGGESTED QUESTIONS
// ============================================================
const SUGGESTED_QUESTIONS = [
  'What factors affect indoor air quality?',
  'How often should I check air quality?',
  'What is a healthy PM2.5 level?',
  'How can I reduce PM2.5 levels?',
  'What are the health risks of poor air quality?'
];

// ============================================================
// 🤖 MOCK AI FUNCTIONS (Replace with real API calls)
// ============================================================
function mockStreamAssistantResponse(text, onChunk, onComplete) {
  const words = text.split(' ');
  let currentText = '';
  let idx = 0;

  const interval = setInterval(() => {
    if (idx < words.length) {
      currentText += (idx > 0 ? ' ' : '') + words[idx];
      onChunk(currentText);
      idx++;
    } else {
      clearInterval(interval);
      onComplete(currentText);
    }
  }, 80); // 80ms per word for streaming effect
}

function generateAIResponse(userMessage, lastAnalysis) {
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('pm2.5') || lowerMsg.includes('pm 2.5')) {
    return `PM2.5 refers to fine particulate matter with a diameter of 2.5 micrometers or less. According to your last analysis, your PM2.5 level is at 42 µg/m³, which is in the moderate range. For optimal health, PM2.5 should be below 12 µg/m³. I recommend increasing ventilation and using an air purifier during cooking hours when spikes were detected.`;
  }
  
  if (lowerMsg.includes('improve') || lowerMsg.includes('reduce')) {
    return `To improve your air quality score from ${lastAnalysis.score}/100, I recommend:\n\n1. **Increase Ventilation**: Open windows for 10-15 minutes every 2 hours, especially in the bedroom.\n2. **Use Air Purifiers**: Place HEPA filters in high-traffic areas.\n3. **Control Cooking Emissions**: Use exhaust fans during cooking and avoid high-heat frying.\n4. **Regular Cleaning**: Vacuum with HEPA filters weekly to reduce dust accumulation.\n5. **Monitor Humidity**: Keep levels between 30-50% to prevent mold growth.\n\nImplementing these changes should increase your score to 85+ within 2 weeks.`;
  }
  
  if (lowerMsg.includes('health') || lowerMsg.includes('risk')) {
    return `Based on your current air quality (score: ${lastAnalysis.score}), the health risks are **moderate**. Sensitive groups like children, elderly, and people with respiratory conditions may experience:\n\n- Mild respiratory irritation\n- Increased allergy symptoms\n- Slight reduction in lung function during extended exposure\n\nFor healthy adults, short-term exposure is generally safe, but long-term exposure to PM2.5 levels above 35 µg/m³ can increase cardiovascular and respiratory disease risk. I recommend maintaining levels below 12 µg/m³ for optimal health.`;
  }
  
  if (lowerMsg.includes('score') || lowerMsg.includes('mean')) {
    return `Your air quality score of ${lastAnalysis.score}/100 indicates **${lastAnalysis.comfort}** comfort level. Here's what this means:\n\n**Score Breakdown:**\n- 0-40: Poor (Immediate action needed)\n- 41-60: Fair (Improvements recommended)\n- 61-80: Good (Minor optimizations suggested)\n- 81-100: Excellent (Maintain current practices)\n\nYour score reflects moderate PM2.5 levels and adequate but improvable ventilation. Focus on reducing cooking emissions and improving bedroom airflow to reach 85+.`;
  }
  
  if (lowerMsg.includes('how often') || lowerMsg.includes('check')) {
    return `I recommend checking your air quality:\n\n**Daily:** Quick visual check of your monitoring dashboard\n**Weekly:** Detailed analysis with trend review\n**Monthly:** Comprehensive assessment with adjustments to ventilation/cleaning routines\n\nFor real-time monitoring, consider setting up continuous sensors that alert you when PM2.5 exceeds 35 µg/m³. This helps you take immediate action during pollution events like cooking or nearby construction.`;
  }

  // Default response
  return `Thank you for your question! Based on your last analysis (score: ${lastAnalysis.score}/100), I'm here to help you understand and improve your indoor air quality. Your current comfort level is **${lastAnalysis.comfort}** with moderate PM2.5 levels at 42 µg/m³.\n\nWould you like specific recommendations on:\n- Reducing pollutant levels\n- Improving ventilation\n- Understanding health impacts\n- Setting up automated alerts\n\nFeel free to ask anything about your air quality data!`;
}

// ============================================================
// 📱 MAIN ASSISTANT PAGE COMPONENT
// ============================================================
export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastAnalysis] = useState(DEMO_LAST_ANALYSIS);

  // Load last analysis from localStorage on mount
  useEffect(() => {
    const storedAnalysis = localStorage.getItem('airguard_last_analysis');
    if (storedAnalysis) {
      try {
        const parsed = JSON.parse(storedAnalysis);
        // You can set this to state if needed: setLastAnalysis(parsed);
      } catch (e) {
        console.error('Failed to parse last analysis:', e);
      }
    }
  }, []);

  // Mock send message function with streaming
  const handleSendMessage = async (text, attachments = []) => {
    if (!text.trim() && attachments.length === 0) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: text,
      ts: new Date().toISOString(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    setIsTyping(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate AI response
    const aiResponseText = generateAIResponse(text, lastAnalysis);
    
    // Create assistant message with streaming
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      ts: new Date().toISOString(),
      attachments: []
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);

    // Stream the response
    mockStreamAssistantResponse(
      aiResponseText,
      (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, text: streamedText }
            : msg
        ));
      },
      (finalText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, text: finalText }
            : msg
        ));
        setIsSending(false);
      }
    );

    // 🔴 REPLACE WITH REAL API CALL:
    // const response = await sendMessage(text, { context: lastAnalysis, attachments });
    // Handle streaming response from real API
  };

  const handleSelectQuestion = (question, autoSend = false) => {
    if (autoSend) {
      handleSendMessage(question);
    }
    // If not auto-send, you could set the composer text instead
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
    }
  };

  const handleReplayAnalysis = () => {
    const systemMessage = {
      id: Date.now(),
      role: 'system',
      text: 'Replaying last analysis...',
      ts: new Date().toISOString()
    };
    setMessages(prev => [...prev, systemMessage]);

    setTimeout(() => {
      const summaryMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `Here's a summary of your last analysis:\n\n**Score:** ${lastAnalysis.score}/100\n**Comfort:** ${lastAnalysis.comfort}\n\n${lastAnalysis.summary}\n\nWould you like recommendations to improve your score?`,
        ts: new Date().toISOString()
      };
      setMessages(prev => [...prev, summaryMessage]);
    }, 1000);
  };

  const handleRunQuickAnalysis = () => {
    // 🔴 HOOK INTO REAL ANALYSIS FUNCTION
    if (typeof window.runQuickAnalysis === 'function') {
      window.runQuickAnalysis();
    } else {
      alert('Quick analysis feature coming soon! Connect your sensor data in the Dashboard.');
    }
  };

  const handleEvidenceSelect = (evidence) => {
    const evidenceMessage = {
      id: Date.now(),
      role: 'assistant',
      text: `📋 **${evidence.title}**\n\n${evidence.description}\n\nWould you like more details or recommendations to address this?`,
      ts: new Date().toISOString()
    };
    setMessages(prev => [...prev, evidenceMessage]);
  };

  return (
    <AssistantLayout
      messages={messages}
      isTyping={isTyping}
      isSending={isSending}
      suggestedQuestions={SUGGESTED_QUESTIONS}
      onSelectQuestion={handleSelectQuestion}
      onSendMessage={handleSendMessage}
      onClearConversation={handleClearConversation}
      onReplayAnalysis={handleReplayAnalysis}
      onRunQuickAnalysis={handleRunQuickAnalysis}
      onEvidenceSelect={handleEvidenceSelect}
      lastAnalysis={lastAnalysis}
    />
  );
}
