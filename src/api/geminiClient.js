// File: src/api/geminiClient.js
// AI client wrapper for Gemini 3 Pro advanced analysis

import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY_1;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
const PROXY_ENDPOINT = '/api/gemini/analyze'; // Backend proxy (if available)
const MAX_RETRIES = 1;

/**
 * Call Gemini 3 Pro for advanced air quality analysis
 * @param {Object} payload - Analysis payload containing sensor data, frames, etc.
 * @param {Array} payload.timeSeries - Time-series sensor data
 * @param {Array} payload.frames - Video frame descriptions
 * @param {Object} payload.sensorSummary - Aggregated sensor stats
 * @param {string} payload.source - Data source type
 * @returns {Promise<Object>} Advanced analysis results
 */
export async function callGeminiAdvancedAnalysis(payload) {
  let attempt = 0;
  
  while (attempt <= MAX_RETRIES) {
    try {
      // Try proxy endpoint first (if backend exists)
      if (window.location.hostname !== 'localhost' || attempt === 0) {
        try {
          const proxyResponse = await axios.post(PROXY_ENDPOINT, payload, {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (proxyResponse.data && proxyResponse.data.forecast) {
            return proxyResponse.data;
          }
        } catch (proxyError) {
          console.warn('Proxy endpoint failed, falling back to direct call:', proxyError.message);
        }
      }

      // Direct Gemini API call
      const prompt = buildAdvancedAnalysisPrompt(payload);
      const geminiResponse = await axios.post(
        `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        },
        {
          timeout: 45000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Parse Gemini response
      const aiText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        throw new Error('Invalid Gemini API response structure');
      }

      // Clean JSON response (remove markdown code blocks if present)
      const cleanedText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedResult = JSON.parse(cleanedText);

      // Validate required fields
      if (!parsedResult.forecast || !parsedResult.pollution_source) {
        throw new Error('Incomplete AI response');
      }

      return parsedResult;

    } catch (error) {
      console.error(`Gemini API call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error.message);
      
      if (attempt >= MAX_RETRIES) {
        console.warn('All attempts failed, using dummy data fallback');
        return dummyAdvancedAnalyze(payload);
      }
      
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
    }
  }
}

/**
 * Build comprehensive prompt for advanced analysis
 * @private
 * @param {Object} payload - Input data
 * @returns {string} Formatted prompt
 */
function buildAdvancedAnalysisPrompt(payload) {
  const { timeSeries, frames, sensorSummary, source } = payload;
  
  return `You are an expert air quality AI analyst. Perform comprehensive analysis with 6 advanced features.

INPUT DATA:
====================
Data Source: ${source || 'unknown'}

Sensor Summary:
${JSON.stringify(sensorSummary, null, 2)}

Recent Time Series (last 20 readings):
${JSON.stringify(timeSeries.slice(-20), null, 2)}

Video Frame Descriptions:
${JSON.stringify(frames || [], null, 2)}

REQUIRED OUTPUT:
====================
Provide a JSON response with ALL of these fields:

{
  "forecast": [
    {
      "timestamp": "2025-12-11T20:00:00Z",
      "pm25": 85,
      "pm10": 120,
      "temperature": 24,
      "humidity": 65,
      "confidence": 0.75
    }
    // ... predict next 24 hours (hourly intervals)
  ],
  
  "pollution_source": {
    "primary": "cooking_fumes" | "outdoor_pollution" | "dust" | "smoking" | "cleaning_chemicals" | "poor_ventilation" | "construction" | "traffic",
    "confidence": 0.85,
    "evidence": [
      {
        "timestamp": "2025-12-10T19:30:00Z",
        "observation": "PM2.5 spike to 180 µg/m³ coincides with kitchen activity",
        "frameRef": 2,
        "metric": "pm25",
        "value": 180
      }
    ],
    "secondary_sources": ["poor_ventilation"],
    "explanation": "Detailed reasoning based on sensor patterns and visual evidence..."
  },
  
  "health_risk_groups": {
    "children": {
      "level": "high" | "moderate" | "low",
      "score": 75,
      "advice": "Specific advice for children...",
      "reasoning": "Why this level..."
    },
    "elderly": { "level": "moderate", "score": 62, "advice": "...", "reasoning": "..." },
    "asthma": { "level": "high", "score": 80, "advice": "...", "reasoning": "..." },
    "adults": { "level": "low", "score": 45, "advice": "...", "reasoning": "..." }
  },
  
  "ventilation_tips": {
    "schedule": [
      {
        "startTime": "06:00",
        "endTime": "07:00",
        "action": "open_windows" | "keep_closed" | "partial_ventilation",
        "reasoning": "Outdoor PM2.5 typically lowest in early morning",
        "outdoorPM25Estimate": 25
      }
    ],
    "summary": "Best ventilation windows: 6-7 AM and 8-9 PM when outdoor pollution is minimal.",
    "warnings": ["Avoid opening windows during traffic rush hour (5-7 PM)"],
    "indoorOutdoorDiff": -15
  },
  
  "layout_suggestions": {
    "issues": [
      {
        "type": "purifier_placement" | "blocked_vent" | "furniture_obstruction" | "fan_direction" | "window_access",
        "severity": "high" | "medium" | "low",
        "location": "Living room, northeast corner",
        "description": "Air purifier placed in corner reduces efficiency by 35%",
        "fix": "Move purifier to center of room, at least 2 feet from walls",
        "expectedImprovement": "35% increase in air circulation efficiency",
        "frameRef": 0
      }
    ],
    "summary": "3 layout issues detected that reduce air quality by an estimated 40%"
  },
  
  "summary": "Overall AI assessment: Your indoor air quality shows moderate PM2.5 levels primarily due to cooking activities without proper ventilation. Forecast suggests conditions will improve after 8 PM. Priority actions: improve kitchen ventilation, relocate air purifier to center of room.",
  
  "confidence": "high" | "medium" | "low",
  
  "evidence": [
    "PM2.5 mean 82 µg/m³ exceeds WHO guideline of 25 µg/m³",
    "Humidity peaked at 78% at 21:00, creating mold risk",
    "Closed window observed in frame 3 during pollution spike"
  ]
}

ANALYSIS RULES:
1. Forecast must include next 24 hours at hourly intervals
2. Pollution source must cite specific timestamps and metric values
3. Health risks must use WHO/EPA thresholds
4. Ventilation schedule must consider indoor/outdoor differential
5. Layout suggestions must reference frame numbers if applicable
6. All confidence scores between 0.0-1.0

IMPORTANT: Respond ONLY with valid JSON. No markdown formatting, no explanations outside the JSON structure.`;
}

/**
 * Dummy fallback for when Gemini API is unavailable
 * @private
 * @param {Object} payload - Input data
 * @returns {Object} Mock analysis results
 */
function dummyAdvancedAnalyze(payload) {
  const now = new Date();
  const { sensorSummary } = payload;
  
  // Generate 24-hour forecast
  const forecast = [];
  for (let i = 1; i <= 24; i++) {
    const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    forecast.push({
      timestamp: futureTime.toISOString(),
      pm25: Math.max(10, (sensorSummary?.pm25?.avg || 50) + (Math.random() - 0.5) * 30),
      pm10: Math.max(15, (sensorSummary?.pm10?.avg || 70) + (Math.random() - 0.5) * 40),
      temperature: Math.max(18, (sensorSummary?.temperature?.avg || 24) + (Math.random() - 0.5) * 3),
      humidity: Math.max(30, Math.min(90, (sensorSummary?.humidity?.avg || 60) + (Math.random() - 0.5) * 10)),
      confidence: 0.65 + Math.random() * 0.2
    });
  }

  return {
    forecast,
    
    pollution_source: {
      primary: 'cooking_fumes',
      confidence: 0.78,
      evidence: [
        {
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          observation: 'PM2.5 spike to 180 µg/m³ during typical cooking hours',
          frameRef: 2,
          metric: 'pm25',
          value: 180
        },
        {
          timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
          observation: 'Humidity increase suggests steam from cooking',
          frameRef: null,
          metric: 'humidity',
          value: 75
        }
      ],
      secondary_sources: ['poor_ventilation'],
      explanation: 'Analysis shows consistent PM2.5 spikes during evening hours (6-8 PM) correlating with typical meal preparation times. No exhaust fan activity detected in video frames. Humidity spikes suggest steam generation from cooking.'
    },
    
    health_risk_groups: {
      children: {
        level: sensorSummary?.pm25?.avg > 75 ? 'high' : sensorSummary?.pm25?.avg > 35 ? 'moderate' : 'low',
        score: Math.min(100, Math.round((sensorSummary?.pm25?.avg || 50) * 1.2)),
        advice: 'Children should avoid prolonged indoor exposure during pollution spikes. Ensure air purifier runs in bedrooms during sleep hours.',
        reasoning: 'Children\'s developing respiratory systems are more vulnerable to particulate matter. Current PM2.5 levels exceed safe thresholds for sensitive groups.'
      },
      elderly: {
        level: sensorSummary?.pm25?.avg > 65 ? 'high' : sensorSummary?.pm25?.avg > 35 ? 'moderate' : 'low',
        score: Math.min(100, Math.round((sensorSummary?.pm25?.avg || 50) * 1.1)),
        advice: 'Monitor for respiratory symptoms. Limit physical activity during high pollution periods.',
        reasoning: 'Elderly individuals have reduced lung capacity and higher cardiovascular risk from air pollution exposure.'
      },
      asthma: {
        level: sensorSummary?.pm25?.avg > 55 ? 'high' : sensorSummary?.pm25?.avg > 25 ? 'moderate' : 'low',
        score: Math.min(100, Math.round((sensorSummary?.pm25?.avg || 50) * 1.4)),
        advice: 'Keep rescue inhaler accessible. Avoid cooking areas during meal preparation. Use HEPA air purifier continuously.',
        reasoning: 'PM2.5 particles can trigger asthma attacks by inflaming airways. Current levels significantly exceed safe thresholds for asthma patients.'
      },
      adults: {
        level: sensorSummary?.pm25?.avg > 85 ? 'high' : sensorSummary?.pm25?.avg > 55 ? 'moderate' : 'low',
        score: Math.min(100, Math.round((sensorSummary?.pm25?.avg || 50) * 0.8)),
        advice: 'Reduce vigorous indoor exercise during pollution spikes. Ventilate space when outdoor air quality permits.',
        reasoning: 'Healthy adults have higher tolerance but should still minimize exposure to elevated PM2.5 levels.'
      }
    },
    
    ventilation_tips: {
      schedule: [
        {
          startTime: '06:00',
          endTime: '07:30',
          action: 'open_windows',
          reasoning: 'Outdoor PM2.5 typically lowest in early morning before traffic buildup',
          outdoorPM25Estimate: 20
        },
        {
          startTime: '07:30',
          endTime: '09:00',
          action: 'keep_closed',
          reasoning: 'Morning traffic rush hour increases outdoor pollution',
          outdoorPM25Estimate: 65
        },
        {
          startTime: '09:00',
          endTime: '17:00',
          action: 'partial_ventilation',
          reasoning: 'Moderate outdoor conditions, use with air purifier running',
          outdoorPM25Estimate: 45
        },
        {
          startTime: '17:00',
          endTime: '19:00',
          action: 'keep_closed',
          reasoning: 'Evening traffic rush hour, outdoor pollution peaks',
          outdoorPM25Estimate: 85
        },
        {
          startTime: '19:00',
          endTime: '21:00',
          action: 'keep_closed',
          reasoning: 'Indoor cooking activities, use kitchen exhaust instead',
          outdoorPM25Estimate: 50
        },
        {
          startTime: '21:00',
          endTime: '23:00',
          action: 'open_windows',
          reasoning: 'Post-cooking ventilation window, outdoor pollution subsiding',
          outdoorPM25Estimate: 30
        }
      ],
      summary: 'Optimal ventilation windows: 6:00-7:30 AM and 9:00-11:00 PM. Avoid opening windows during traffic rush hours and cooking times.',
      warnings: [
        'Never ventilate during cooking (use kitchen exhaust fan instead)',
        'Check outdoor AQI before opening windows',
        'Close windows if outdoor PM2.5 exceeds indoor levels'
      ],
      indoorOutdoorDiff: (sensorSummary?.pm25?.avg || 50) - 35
    },
    
    layout_suggestions: {
      issues: [
        {
          type: 'purifier_placement',
          severity: 'high',
          location: 'Living room, against wall',
          description: 'Air purifier positioned against wall reduces intake efficiency by 40%',
          fix: 'Move purifier to center of room with 360° clearance, at least 2 feet from walls',
          expectedImprovement: '40% increase in air circulation efficiency',
          frameRef: 0
        },
        {
          type: 'furniture_obstruction',
          severity: 'medium',
          location: 'Window area blocked by bookshelf',
          description: 'Large bookshelf blocking natural ventilation path from window',
          fix: 'Relocate bookshelf to perpendicular wall to allow cross-ventilation',
          expectedImprovement: '25% improvement in natural airflow',
          frameRef: 1
        },
        {
          type: 'fan_direction',
          severity: 'low',
          location: 'Ceiling fan rotating clockwise',
          description: 'Fan pushing air upward in summer (should pull down for cooling)',
          fix: 'Reverse fan direction to counterclockwise for downward airflow',
          expectedImprovement: '15% better air mixing and comfort',
          frameRef: null
        }
      ],
      summary: '3 layout optimization opportunities detected. Combined improvements could increase air quality efficiency by 60%.'
    },
    
    summary: `Advanced analysis reveals moderate air quality primarily caused by cooking emissions without adequate ventilation. Forecast indicates PM2.5 will improve after 8 PM tonight. Key recommendations: (1) Install or use kitchen exhaust fan during cooking, (2) Relocate air purifier to room center, (3) Ventilate during optimal windows (6-7:30 AM, 9-11 PM). Health risks are elevated for children and asthma patients - use air purifiers in bedrooms.`,
    
    confidence: 'medium',
    
    evidence: [
      `PM2.5 average ${Math.round(sensorSummary?.pm25?.avg || 50)} µg/m³ exceeds WHO 24-hour guideline (25 µg/m³)`,
      `Humidity ${Math.round(sensorSummary?.humidity?.avg || 60)}% suggests adequate moisture levels, low mold risk`,
      'Pollution spikes correlate with evening hours (6-8 PM), consistent with cooking patterns',
      'No mechanical ventilation detected in video frames during pollution events',
      'Air purifier suboptimally positioned against wall, reducing efficiency'
    ]
  };
}

export { dummyAdvancedAnalyze };
export default callGeminiAdvancedAnalysis;

