// src/components/AISummaryCard.jsx

/**
 * AI Summary Card Component
 * Supports multiple AI providers: Google Gemini + Groq AI
 * Automatically rotates between API keys when quota is exceeded
 */

import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Brain, Zap, Activity, Wind, Droplet, ThermometerSun, BarChart3, Target, Clock, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function AISummaryCard({ sensorData }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState(''); // Track which AI was used

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setError('');
    setAiProvider('');

    try {
      // Prepare data for AI analysis
      const aiPayload = prepareAIAnalysis(sensorData);
      
      console.log('Starting AI analysis with payload:', aiPayload);

      // Try all AI providers with key rotation
      const result = await callAIWithRotation(aiPayload);
      
      console.log('AI analysis result:', result);
      setAnalysis(result.analysis);
      setAiProvider(result.provider);
    } catch (err) {
      console.error('AI API error:', err);
      setError(err.message || 'Failed to generate AI insights. Please check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Try all AI providers and API keys with rotation
   */
  const callAIWithRotation = async (payload) => {
    // Get all available Gemini API keys
    const geminiKeys = [];
    let i = 1;
    while (true) {
      const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`];
      if (!key) break;
      geminiKeys.push(key);
      i++;
    }
    
    // Get Groq API key
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;

    console.log(`🔑 Found ${geminiKeys.length} Gemini key(s) and ${groqKey ? '1' : '0'} Groq key`);

    // Try Gemini with all keys and models
    for (let keyIdx = 0; keyIdx < geminiKeys.length; keyIdx++) {
      const models = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];
      
      for (const model of models) {
        try {
          console.log(`🤖 Trying Gemini ${model} with key ${keyIdx + 1}/${geminiKeys.length}`);
          const result = await callGeminiAPI(payload, geminiKeys[keyIdx], model);
          return { analysis: result, provider: `Gemini ${model} (Key ${keyIdx + 1})` };
        } catch (err) {
          console.warn(`⚠️ Gemini ${model} key ${keyIdx + 1} failed:`, err.message);
          // If not quota error, try next model
          if (!err.message.includes('quota') && !err.message.includes('429')) {
            continue;
          }
          // If quota error, try next key
          break;
        }
      }
    }

    // Try Groq AI as fallback
    if (groqKey) {
      try {
        console.log('🤖 Trying Groq AI as fallback');
        const result = await callGroqAPI(payload, groqKey);
        return { analysis: result, provider: 'Groq AI (llama-3.3-70b)' };
      } catch (err) {
        console.warn('⚠️ Groq AI failed:', err.message);
      }
    }

    // All providers failed - use intelligent fallback
    console.warn('⚠️ All AI providers exhausted, using intelligent fallback');
    const fallback = generateIntelligentDemoAnalysis(payload);
    return { analysis: fallback, provider: 'Intelligent Analysis (Offline)' };
  };

  /**
   * Call Google Gemini API for air quality analysis
   */
  const callGeminiAPI = async (payload, apiKey, model = 'gemini-1.5-flash') => {
    if (!apiKey) {
      throw new Error('Gemini API key not provided');
    }

    const prompt = `You are an expert air quality analyst. Analyze the following indoor air quality data and provide actionable insights:

**Data Summary:**
- Source: ${payload.source}
- Time Period: ${payload.dataPoints} readings
- PM2.5: Current ${payload.metrics.pm25?.current?.toFixed(1) || 'N/A'} µg/m³, Average ${payload.metrics.pm25?.average?.toFixed(1) || 'N/A'} µg/m³ (Min: ${payload.metrics.pm25?.min?.toFixed(1) || 'N/A'}, Max: ${payload.metrics.pm25?.max?.toFixed(1) || 'N/A'})
- PM10: Current ${payload.metrics.pm10?.current?.toFixed(1) || 'N/A'} µg/m³, Average ${payload.metrics.pm10?.average?.toFixed(1) || 'N/A'} µg/m³
- Temperature: ${payload.metrics.temperature?.current?.toFixed(1) || 'N/A'}°C (Average: ${payload.metrics.temperature?.average?.toFixed(1) || 'N/A'}°C)
- Humidity: ${payload.metrics.humidity?.current?.toFixed(1) || 'N/A'}% (Average: ${payload.metrics.humidity?.average?.toFixed(1) || 'N/A'}%)

Please provide a JSON response with this exact structure:
{
  "summary": "Brief 2-3 sentence summary of overall air quality",
  "airQualityScore": 85,
  "scoreCategory": "Good",
  "insights": [
    {"type": "good", "icon": "wind", "text": "Positive finding"},
    {"type": "warning", "icon": "alert", "text": "Area of concern"}
  ],
  "recommendations": [
    {"action": "Specific actionable recommendation", "priority": "high", "impact": "Reduces PM2.5 by 30%"}
  ],
  "healthImpact": "1-2 sentence health impact assessment",
  "trend": "improving",
  "predictedNext24h": {
    "pm25": 15.5,
    "aqi": 60,
    "description": "Expected to remain stable"
  },
  "comparison": {
    "vs_who_standard": "12% above WHO guideline",
    "vs_yesterday": "15% improvement",
    "vs_outdoor": "40% better than outdoor AQI"
  },
  "quickActions": [
    {"label": "Run Air Purifier", "duration": "2 hours", "benefit": "Reduce PM2.5"},
    {"label": "Open Windows", "duration": "30 min", "benefit": "Fresh air circulation"}
  ]
}

The trend must be one of: improving, stable, or deteriorating.
The airQualityScore must be 0-100 (0=hazardous, 100=excellent).
The scoreCategory must be: Excellent, Good, Moderate, Poor, or Hazardous.`;

    try {
      console.log(`Calling Gemini model: ${model}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.warn(`Gemini ${model} failed:`, errorData);
        
        if (response.status === 429) {
          throw new Error('Quota exceeded');
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = textResponse.trim();
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const parsedResponse = JSON.parse(jsonText);
      
      // Validate response structure
      if (!parsedResponse.summary || !parsedResponse.insights) {
        throw new Error('Invalid response structure from Gemini');
      }
      
      return parsedResponse;
      
    } catch (error) {
      console.error(`Gemini ${model} error:`, error);
      throw error;
    }
  };

  /**
   * Call Groq AI API for air quality analysis
   */
  const callGroqAPI = async (payload, apiKey) => {
    if (!apiKey) {
      throw new Error('Groq API key not provided');
    }

    const prompt = `You are an expert air quality analyst. Analyze the following indoor air quality data and provide actionable insights:

**Data Summary:**
- Source: ${payload.source}
- Time Period: ${payload.dataPoints} readings
- PM2.5: Current ${payload.metrics.pm25?.current?.toFixed(1) || 'N/A'} µg/m³, Average ${payload.metrics.pm25?.average?.toFixed(1) || 'N/A'} µg/m³ (Min: ${payload.metrics.pm25?.min?.toFixed(1) || 'N/A'}, Max: ${payload.metrics.pm25?.max?.toFixed(1) || 'N/A'})
- PM10: Current ${payload.metrics.pm10?.current?.toFixed(1) || 'N/A'} µg/m³, Average ${payload.metrics.pm10?.average?.toFixed(1) || 'N/A'} µg/m³
- Temperature: ${payload.metrics.temperature?.current?.toFixed(1) || 'N/A'}°C (Average: ${payload.metrics.temperature?.average?.toFixed(1) || 'N/A'}°C)
- Humidity: ${payload.metrics.humidity?.current?.toFixed(1) || 'N/A'}% (Average: ${payload.metrics.humidity?.average?.toFixed(1) || 'N/A'}%)

Please provide a JSON response with this exact structure:
{
  "summary": "Brief 2-3 sentence summary of overall air quality",
  "airQualityScore": 85,
  "scoreCategory": "Good",
  "insights": [
    {"type": "good", "icon": "wind", "text": "Positive finding"},
    {"type": "warning", "icon": "alert", "text": "Area of concern"}
  ],
  "recommendations": [
    {"action": "Specific actionable recommendation", "priority": "high", "impact": "Reduces PM2.5 by 30%"}
  ],
  "healthImpact": "1-2 sentence health impact assessment",
  "trend": "improving",
  "predictedNext24h": {
    "pm25": 15.5,
    "aqi": 60,
    "description": "Expected to remain stable"
  },
  "comparison": {
    "vs_who_standard": "12% above WHO guideline",
    "vs_yesterday": "15% improvement",
    "vs_outdoor": "40% better than outdoor AQI"
  },
  "quickActions": [
    {"label": "Run Air Purifier", "duration": "2 hours", "benefit": "Reduce PM2.5"},
    {"label": "Open Windows", "duration": "30 min", "benefit": "Fresh air circulation"}
  ]
}

The trend must be one of: improving, stable, or deteriorating.
The airQualityScore must be 0-100 (0=hazardous, 100=excellent).
The scoreCategory must be: Excellent, Good, Moderate, Poor, or Hazardous.`;

    try {
      console.log('Calling Groq AI with llama-3.3-70b-versatile');
      
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are an expert air quality analyst. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            response_format: { type: 'json_object' }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Groq API failed:', errorData);
        
        if (response.status === 429) {
          throw new Error('Groq quota exceeded');
        }
        
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from Groq API');
      }
      
      const textResponse = data.choices[0].message.content;
      
      // Parse JSON response
      let jsonText = textResponse.trim();
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const parsedResponse = JSON.parse(jsonText);
      
      // Validate response structure
      if (!parsedResponse.summary || !parsedResponse.insights) {
        throw new Error('Invalid response structure from Groq');
      }
      
      return parsedResponse;
      
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  };

  /**
   * Generate intelligent demo analysis based on actual sensor data
   */
  const generateIntelligentDemoAnalysis = (payload) => {
    const pm25 = payload.metrics.pm25?.current || 0;
    const pm10 = payload.metrics.pm10?.current || 0;
    const temp = payload.metrics.temperature?.current || 24;
    const humidity = payload.metrics.humidity?.current || 50;
    
    const insights = [];
    const recommendations = [];
    const quickActions = [];
    
    // Calculate air quality score (0-100)
    let score = 100;
    if (pm25 > 0) score -= Math.min(pm25 * 1.5, 40);
    if (pm10 > 0) score -= Math.min(pm10 * 0.5, 20);
    if (humidity < 30 || humidity > 70) score -= 10;
    if (temp < 18 || temp > 28) score -= 5;
    score = Math.max(0, Math.round(score));
    
    const scoreCategory = 
      score >= 80 ? 'Excellent' :
      score >= 60 ? 'Good' :
      score >= 40 ? 'Moderate' :
      score >= 20 ? 'Poor' : 'Hazardous';
    
    // Analyze PM2.5
    if (pm25 <= 12) {
      insights.push({ 
        type: 'good', 
        icon: 'wind',
        text: `PM2.5 levels (${pm25.toFixed(1)} µg/m³) are below WHO guidelines. Excellent air quality!` 
      });
      quickActions.push({
        label: 'Maintain Current Settings',
        duration: 'Ongoing',
        benefit: 'Keep air quality optimal'
      });
    } else if (pm25 <= 35) {
      insights.push({ 
        type: 'warning', 
        icon: 'alert',
        text: `PM2.5 levels (${pm25.toFixed(1)} µg/m³) are moderate. Monitor during peak hours.` 
      });
      recommendations.push({
        action: 'Use air purifier during high pollution periods',
        priority: 'medium',
        impact: 'Reduce PM2.5 by 25-40%'
      });
      quickActions.push({
        label: 'Run Air Purifier',
        duration: '2-3 hours',
        benefit: 'Reduce PM2.5 levels'
      });
    } else {
      insights.push({ 
        type: 'warning', 
        icon: 'alert',
        text: `PM2.5 levels (${pm25.toFixed(1)} µg/m³) exceed safe limits. Immediate action needed.` 
      });
      recommendations.push({
        action: 'Run air purifier continuously on high setting',
        priority: 'high',
        impact: 'Reduce PM2.5 by 50-70%'
      });
      recommendations.push({
        action: 'Seal windows and limit outdoor air intake',
        priority: 'high',
        impact: 'Prevent outdoor pollution entry'
      });
      quickActions.push({
        label: 'High-Speed Purifier',
        duration: '4+ hours',
        benefit: 'Fast PM2.5 reduction'
      });
    }
    
    // Analyze humidity
    if (humidity >= 30 && humidity <= 60) {
      insights.push({ 
        type: 'good', 
        icon: 'droplet',
        text: `Humidity (${humidity.toFixed(1)}%) is in optimal range (30-60%).` 
      });
    } else if (humidity > 70) {
      insights.push({ 
        type: 'warning', 
        icon: 'alert',
        text: `Humidity (${humidity.toFixed(1)}%) is high - may promote mold growth.` 
      });
      recommendations.push({
        action: 'Use dehumidifier to reduce moisture levels',
        priority: 'medium',
        impact: 'Prevent mold, improve comfort'
      });
      quickActions.push({
        label: 'Run Dehumidifier',
        duration: '2 hours',
        benefit: 'Lower humidity to 50%'
      });
    } else {
      insights.push({ 
        type: 'warning', 
        icon: 'alert',
        text: `Humidity (${humidity.toFixed(1)}%) is low - may cause respiratory discomfort.` 
      });
      recommendations.push({
        action: 'Use humidifier or place water containers',
        priority: 'low',
        impact: 'Improve comfort, reduce static'
      });
      quickActions.push({
        label: 'Add Humidity',
        duration: '1 hour',
        benefit: 'Raise humidity to 40%'
      });
    }
    
    // Analyze temperature
    if (temp >= 20 && temp <= 26) {
      insights.push({ 
        type: 'good', 
        icon: 'thermometer',
        text: `Temperature (${temp.toFixed(1)}°C) is comfortable and energy-efficient.` 
      });
    } else if (temp > 26) {
      quickActions.push({
        label: 'Adjust AC',
        duration: '30 min',
        benefit: 'Cool to 24°C'
      });
    }
    
    // Generate summary
    const overallQuality = pm25 <= 12 ? 'excellent' : pm25 <= 35 ? 'moderate' : 'poor';
    const summary = `Based on ${payload.dataPoints} readings from ${payload.source}, your indoor air quality is ${overallQuality}. ${pm25 <= 12 ? 'All major pollutants are within safe limits.' : 'Some parameters require attention to ensure optimal health conditions.'}`;
    
    // Health impact
    const healthImpact = pm25 <= 12 
      ? 'Current air quality poses minimal health risk. Safe for all individuals including sensitive groups.'
      : pm25 <= 35
      ? 'Moderate air quality may affect sensitive individuals. Most people can continue normal activities.'
      : 'Air quality may cause health effects. Sensitive groups should limit prolonged exposure.';
    
    // Trend prediction
    const avgPM25 = payload.metrics.pm25?.average || pm25;
    const trend = pm25 < avgPM25 ? 'improving' : pm25 > avgPM25 ? 'deteriorating' : 'stable';
    
    // Predictions for next 24h
    const predictedPM25 = trend === 'improving' ? pm25 * 0.9 : trend === 'deteriorating' ? pm25 * 1.1 : pm25;
    const predictedAQI = Math.round(predictedPM25 * 4.17); // Simple AQI calculation
    
    const predictedNext24h = {
      pm25: parseFloat(predictedPM25.toFixed(1)),
      aqi: predictedAQI,
      description: trend === 'improving' ? 'Expected to improve further' : 
                   trend === 'deteriorating' ? 'May worsen without intervention' :
                   'Expected to remain stable'
    };
    
    // Comparisons
    const whoStandard = 12; // WHO PM2.5 guideline
    const vsWHO = ((pm25 - whoStandard) / whoStandard * 100).toFixed(0);
    const vsYesterday = ((avgPM25 - pm25) / avgPM25 * 100).toFixed(0);
    
    const comparison = {
      vs_who_standard: pm25 <= whoStandard ? 'Within WHO guidelines ✓' : `${Math.abs(vsWHO)}% above WHO guideline`,
      vs_yesterday: vsYesterday > 0 ? `${Math.abs(vsYesterday)}% improvement` : `${Math.abs(vsYesterday)}% worse`,
      vs_outdoor: 'Indoor monitoring only'
    };
    
    if (!recommendations.length) {
      recommendations.push({
        action: 'Maintain current ventilation practices',
        priority: 'low',
        impact: 'Sustain good air quality'
      });
      recommendations.push({
        action: 'Continue monitoring air quality regularly',
        priority: 'low',
        impact: 'Early detection of issues'
      });
    }
    
    return {
      summary,
      airQualityScore: score,
      scoreCategory,
      insights,
      recommendations,
      healthImpact,
      trend,
      predictedNext24h,
      comparison,
      quickActions
    };
  };
  /**
   * Prepare sensor data for AI analysis
   */
  const prepareAIAnalysis = (data) => {
    if (!data || !data.feeds) {
      return { error: 'No sensor data available' };
    }

    const { feeds, fieldMapping, source } = data;
    
    // Calculate statistics
    const pm25Values = feeds.map(f => f.pm25 || f[fieldMapping?.pm25]).filter(v => v != null && !isNaN(v));
    const pm10Values = feeds.map(f => f.pm10 || f[fieldMapping?.pm10]).filter(v => v != null && !isNaN(v));
    const tempValues = feeds.map(f => f.temperature || f[fieldMapping?.temperature]).filter(v => v != null && !isNaN(v));
    const humidityValues = feeds.map(f => f.humidity || f[fieldMapping?.humidity]).filter(v => v != null && !isNaN(v));

    const calculateStats = (values) => {
      if (values.length === 0) return null;
      return {
        current: values[values.length - 1],
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    return {
      source,
      timestamp: new Date().toISOString(),
      dataPoints: feeds.length,
      metrics: {
        pm25: calculateStats(pm25Values),
        pm10: calculateStats(pm10Values),
        temperature: calculateStats(tempValues),
        humidity: calculateStats(humidityValues),
      },
    };
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-neutral-900">AI Insights</h3>
          <p className="text-xs text-neutral-600 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            {aiProvider || 'Powered by Gemini + Groq AI'}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* No Analysis State */}
      {!analysis && !isAnalyzing && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-neutral-600 mb-4">
            Get AI-powered insights from your sensor data
          </p>
          <button
            onClick={handleStartAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Analyze with AI
          </button>
        </div>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-700 font-semibold mb-2">Analyzing sensor data...</p>
          <p className="text-sm text-neutral-500">AI is processing your air quality metrics</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="space-y-4">
          {/* AI Provider Badge */}
          {aiProvider && (
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-800 font-medium">
                  {aiProvider}
                </p>
              </div>
              {analysis.airQualityScore && (
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    analysis.scoreCategory === 'Excellent' ? 'bg-green-500 text-white' :
                    analysis.scoreCategory === 'Good' ? 'bg-blue-500 text-white' :
                    analysis.scoreCategory === 'Moderate' ? 'bg-yellow-500 text-white' :
                    analysis.scoreCategory === 'Poor' ? 'bg-orange-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {analysis.airQualityScore}/100
                  </div>
                  <span className="text-xs text-neutral-600">{analysis.scoreCategory}</span>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-white rounded-xl border border-green-200">
            <p className="text-neutral-800 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Quick Actions - NEW! */}
          {analysis.quickActions && analysis.quickActions.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => alert(`Action: ${action.label}\nDuration: ${action.duration}\nBenefit: ${action.benefit}`)}
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-purple-900">{action.label}</p>
                      <p className="text-xs text-purple-600">{action.benefit}</p>
                    </div>
                    <div className="text-xs text-purple-500 group-hover:translate-x-1 transition-transform">
                      <Clock className="w-4 h-4" />
                      <span className="block text-[10px]">{action.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predicted Next 24h - NEW! */}
          {analysis.predictedNext24h && (
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <h4 className="text-sm font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Next 24 Hour Forecast
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-cyan-600 mb-1">PM2.5</p>
                  <p className="text-lg font-bold text-cyan-900">{analysis.predictedNext24h.pm25}</p>
                  <p className="text-xs text-cyan-500">µg/m³</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-cyan-600 mb-1">AQI</p>
                  <p className="text-lg font-bold text-cyan-900">{analysis.predictedNext24h.aqi}</p>
                  <p className="text-xs text-cyan-500">Index</p>
                </div>
                <div className="text-center col-span-3">
                  <p className="text-sm text-cyan-700 italic">{analysis.predictedNext24h.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comparisons - NEW! */}
          {analysis.comparison && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Comparisons
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-700">vs WHO Standard:</span>
                  <span className="font-semibold text-amber-900">{analysis.comparison.vs_who_standard}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-700">vs Yesterday:</span>
                  <span className="font-semibold text-amber-900">{analysis.comparison.vs_yesterday}</span>
                </div>
                {analysis.comparison.vs_outdoor && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700">vs Outdoor:</span>
                    <span className="font-semibold text-amber-900">{analysis.comparison.vs_outdoor}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Impact */}
          {analysis.healthImpact && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Health Impact
              </h4>
              <p className="text-sm text-blue-800">{analysis.healthImpact}</p>
            </div>
          )}

          {/* Trend Prediction */}
          {analysis.trend && (
            <div className={`p-3 rounded-lg border ${
              analysis.trend === 'improving' ? 'bg-green-50 border-green-300' :
              analysis.trend === 'deteriorating' ? 'bg-red-50 border-red-300' :
              'bg-yellow-50 border-yellow-300'
            }`}>
              <p className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${
                  analysis.trend === 'improving' ? 'text-green-600' :
                  analysis.trend === 'deteriorating' ? 'text-red-600' :
                  'text-yellow-600'
                }`} />
                <span className={
                  analysis.trend === 'improving' ? 'text-green-800' :
                  analysis.trend === 'deteriorating' ? 'text-red-800' :
                  'text-yellow-800'
                }>
                  Trend: {analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)}
                </span>
              </p>
            </div>
          )}

          {/* Key Findings */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Key Findings</h4>
            <div className="space-y-2">
              {analysis.insights?.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-green-100">
                  {insight.type === 'good' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-neutral-700">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, idx) => {
                  // Handle both old format (string) and new format (object)
                  const isObject = typeof rec === 'object';
                  const action = isObject ? rec.action : rec;
                  const priority = isObject ? rec.priority : 'medium';
                  const impact = isObject ? rec.impact : null;
                  
                  return (
                    <div key={idx} className="flex items-start gap-3 text-sm bg-white p-3 rounded-lg border border-green-100 hover:border-green-300 transition-all">
                      <div className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${
                        priority === 'high' ? 'bg-red-100 text-red-700' :
                        priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {priority.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-neutral-800 font-medium">{action}</p>
                        {impact && (
                          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {impact}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share Analysis Button - NEW! */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const shareText = `Air Quality Analysis\nScore: ${analysis.airQualityScore}/100 (${analysis.scoreCategory})\n${analysis.summary}\n\nPrediction: ${analysis.predictedNext24h?.description || 'N/A'}\n\nGenerated by AI Dashboard`;
                navigator.clipboard.writeText(shareText);
                alert('Analysis copied to clipboard!');
              }}
              className="flex-1 px-4 py-2 border-2 border-blue-300 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Analysis
            </button>
            <button
              onClick={handleStartAnalysis}
              className="flex-1 px-4 py-2 border-2 border-green-300 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
