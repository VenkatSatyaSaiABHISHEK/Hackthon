// File: server/proxy.js
// Express proxy server for Gemini API to hide API keys from client

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// Gemini Advanced Analysis Proxy
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({
        error: 'Missing payload in request body'
      });
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ No GEMINI_API_KEY found in environment, returning dummy data');
      
      // Return dummy response when no API key
      const dummyResponse = generateDummyResponse(payload);
      return res.json(dummyResponse);
    }

    // Make real API call to Google Generative AI
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    // Build prompt
    const prompt = buildAdvancedAnalysisPrompt(payload);
    
    const geminiPayload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    };

    console.log(`🚀 Forwarding request to Gemini API...`);
    const startTime = Date.now();

    const response = await axios.post(geminiUrl, geminiPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Gemini API response received in ${duration}ms`);

    // Parse response
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text content in Gemini response');
    }

    // Clean and parse JSON
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsedData = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: parsedData,
      metadata: {
        duration,
        timestamp: new Date().toISOString(),
        model: 'gemini-1.5-pro'
      }
    });

  } catch (error) {
    console.error('❌ Proxy error:', error.message);

    // Return dummy data on error
    const dummyResponse = generateDummyResponse(req.body.payload || {});
    
    res.status(200).json({
      success: true,
      data: dummyResponse,
      metadata: {
        fallback: true,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Build comprehensive prompt for Gemini
function buildAdvancedAnalysisPrompt(payload) {
  const {
    sensorSummary = {},
    timeSeries = [],
    frames = [],
    features = [],
    options = {}
  } = payload;

  let prompt = `You are an expert air quality analyst and environmental health specialist. Analyze the following sensor data and provide comprehensive insights.\n\n`;

  // Sensor summary
  prompt += `## Sensor Summary:\n`;
  prompt += `- PM2.5: min=${sensorSummary.pm25?.min || 0}, max=${sensorSummary.pm25?.max || 0}, avg=${sensorSummary.pm25?.avg || 0} µg/m³\n`;
  prompt += `- PM10: min=${sensorSummary.pm10?.min || 0}, max=${sensorSummary.pm10?.max || 0}, avg=${sensorSummary.pm10?.avg || 0} µg/m³\n`;
  prompt += `- Temperature: ${sensorSummary.temperature?.avg || 0}°C\n`;
  prompt += `- Humidity: ${sensorSummary.humidity?.avg || 0}%\n\n`;

  // Time series data (sample)
  if (timeSeries.length > 0) {
    prompt += `## Recent Readings (last 5):\n`;
    timeSeries.slice(-5).forEach((reading, i) => {
      prompt += `${i + 1}. ${reading.timestamp}: PM2.5=${reading.pm25?.toFixed(1) || 'N/A'}, PM10=${reading.pm10?.toFixed(1) || 'N/A'}\n`;
    });
    prompt += '\n';
  }

  // Features requested
  if (features.includes('forecast')) {
    prompt += `\n### FORECAST (${options.forecastHours || 24} hours ahead):\nProvide predictions array with hour, pm25_predicted, pm10_predicted, confidence.\n`;
  }
  if (features.includes('pollution_source')) {
    prompt += `\n### POLLUTION SOURCE:\nIdentify primary source (cooking_fumes, outdoor_pollution, dust, smoking, cleaning_chemicals, poor_ventilation, construction, traffic), confidence (0-1), evidence array, secondary_sources array, explanation.\n`;
  }
  if (features.includes('health_risk_groups')) {
    prompt += `\n### HEALTH RISKS:\nAssess risks for: children, elderly, asthma, adults. Each with: level (low/moderate/high), score (0-100), advice, reasoning.\n`;
  }
  if (features.includes('ventilation_tips')) {
    prompt += `\n### VENTILATION:\nProvide schedule (startTime, endTime, action: open_windows/keep_closed/partial_ventilation, reasoning, outdoorPM25Estimate), summary, warnings array, indoorOutdoorDiff.\n`;
  }
  if (features.includes('layout_suggestions')) {
    prompt += `\n### ROOM LAYOUT:\nIdentify issues array with: type (purifier_placement, blocked_vent, furniture_obstruction, fan_direction, window_access), severity (low/medium/high), location, description, fix, expectedImprovement, frameRef. Include summary.\n`;
  }

  prompt += `\n\nReturn ONLY valid JSON matching this exact structure:\n`;
  prompt += `{\n`;
  if (features.includes('forecast')) {
    prompt += `  "forecast": [{"hour": 1, "pm25_predicted": 45, "pm10_predicted": 65, "confidence": "high"}],\n`;
  }
  if (features.includes('pollution_source')) {
    prompt += `  "pollution_source": {"primary": "outdoor_pollution", "confidence": 0.85, "evidence": ["spike at 2pm"], "secondary_sources": ["cooking_fumes"], "explanation": "..."},\n`;
  }
  if (features.includes('health_risk_groups')) {
    prompt += `  "health_risk_groups": {"children": {"level": "moderate", "score": 65, "advice": "...", "reasoning": "..."}, ...},\n`;
  }
  if (features.includes('ventilation_tips')) {
    prompt += `  "ventilation_tips": {"schedule": [{"startTime": "06:00", "endTime": "08:00", "action": "open_windows", "reasoning": "...", "outdoorPM25Estimate": 25}], "summary": "...", "warnings": [], "indoorOutdoorDiff": 15},\n`;
  }
  if (features.includes('layout_suggestions')) {
    prompt += `  "layout_suggestions": {"issues": [{"type": "purifier_placement", "severity": "medium", "location": "...", "description": "...", "fix": "...", "expectedImprovement": "...", "frameRef": 0}], "summary": "..."},\n`;
  }
  prompt += `  "summary": "Overall analysis summary",\n`;
  prompt += `  "confidence": "high",\n`;
  prompt += `  "evidence": ["Evidence item 1", "Evidence item 2"]\n`;
  prompt += `}\n`;

  return prompt;
}

// Generate dummy response for testing/fallback
function generateDummyResponse(payload) {
  const { features = [], options = {} } = payload;
  
  const response = {
    summary: 'Dummy analysis: Moderate air quality with improvement opportunities. Real API key needed for actual analysis.',
    confidence: 'medium',
    evidence: [
      'PM2.5 levels elevated above WHO guidelines',
      'Indoor humidity within acceptable range',
      'No critical pollution events detected',
      'Dummy data mode - configure GEMINI_API_KEY for real analysis'
    ]
  };

  if (features.includes('forecast')) {
    response.forecast = Array.from({ length: options.forecastHours || 24 }, (_, i) => ({
      hour: i + 1,
      pm25_predicted: 40 + Math.random() * 30,
      pm10_predicted: 60 + Math.random() * 40,
      temperature_predicted: 22 + Math.random() * 4,
      humidity_predicted: 50 + Math.random() * 20,
      confidence: i < 12 ? 'high' : i < 24 ? 'medium' : 'low'
    }));
  }

  if (features.includes('pollution_source')) {
    response.pollution_source = {
      primary: 'outdoor_pollution',
      confidence: 0.75,
      evidence: [
        'PM2.5 spike correlates with traffic hours',
        'Higher readings near window areas',
        'Pattern consistent with external sources'
      ],
      secondary_sources: ['cooking_fumes', 'poor_ventilation'],
      explanation: 'Analysis suggests primary pollution source is outdoor traffic, with secondary contributions from indoor cooking activities and inadequate ventilation.'
    };
  }

  if (features.includes('health_risk_groups')) {
    response.health_risk_groups = {
      children: {
        level: 'moderate',
        score: 62,
        advice: 'Limit outdoor play during peak pollution hours (7-9 AM, 5-7 PM). Ensure proper ventilation indoors.',
        reasoning: 'Children have developing respiratory systems and breathe more air per body weight, making them more vulnerable to particulate matter exposure.'
      },
      elderly: {
        level: 'moderate',
        score: 68,
        advice: 'Monitor for respiratory symptoms. Use air purifier in main living areas. Avoid strenuous activities during high pollution periods.',
        reasoning: 'Reduced lung capacity and potential pre-existing conditions increase vulnerability to air quality fluctuations.'
      },
      asthma: {
        level: 'high',
        score: 78,
        advice: 'Keep rescue inhaler accessible. Consider using air purifier continuously. Consult physician if symptoms worsen.',
        reasoning: 'Particulate matter can trigger asthma attacks and exacerbate existing respiratory conditions.'
      },
      adults: {
        level: 'low',
        score: 45,
        advice: 'Maintain awareness of air quality. Consider light ventilation improvements.',
        reasoning: 'Healthy adults have better tolerance but should still minimize prolonged exposure to elevated PM2.5 levels.'
      }
    };
  }

  if (features.includes('ventilation_tips')) {
    response.ventilation_tips = {
      schedule: [
        { startTime: '06:00', endTime: '08:00', action: 'keep_closed', reasoning: 'Morning traffic pollution peak', outdoorPM25Estimate: 65 },
        { startTime: '08:00', endTime: '10:00', action: 'open_windows', reasoning: 'Outdoor air quality improving', outdoorPM25Estimate: 38 },
        { startTime: '10:00', endTime: '17:00', action: 'partial_ventilation', reasoning: 'Moderate outdoor conditions', outdoorPM25Estimate: 45 },
        { startTime: '17:00', endTime: '19:00', action: 'keep_closed', reasoning: 'Evening traffic pollution peak', outdoorPM25Estimate: 72 },
        { startTime: '19:00', endTime: '22:00', action: 'open_windows', reasoning: 'Air quality improves after rush hour', outdoorPM25Estimate: 35 },
        { startTime: '22:00', endTime: '06:00', action: 'partial_ventilation', reasoning: 'Overnight conditions stable', outdoorPM25Estimate: 28 }
      ],
      summary: 'Avoid ventilation during rush hours (6-8 AM, 5-7 PM). Best ventilation windows are 8-10 AM and 7-10 PM when outdoor air quality improves.',
      warnings: [
        'Current outdoor PM2.5 exceeds indoor levels during peak hours',
        'Keep windows closed if outdoor AQI exceeds 100'
      ],
      indoorOutdoorDiff: -12
    };
  }

  if (features.includes('layout_suggestions')) {
    response.layout_suggestions = {
      issues: [
        {
          type: 'purifier_placement',
          severity: 'medium',
          location: 'Main living room, near corner',
          description: 'Air purifier is placed in corner, reducing circulation effectiveness. Corner placement creates dead zones.',
          fix: 'Move air purifier to center of room or at least 3 feet from walls. Ensure unobstructed airflow on all sides.',
          expectedImprovement: '15-20% better circulation coverage',
          frameRef: 0
        },
        {
          type: 'blocked_vent',
          severity: 'high',
          location: 'Bedroom, north wall vent',
          description: 'HVAC vent partially blocked by furniture, restricting air circulation by approximately 40%.',
          fix: 'Remove furniture obstruction. Maintain 6-inch clearance around all vents for optimal airflow.',
          expectedImprovement: 'Restore 30-40% airflow capacity',
          frameRef: 1
        },
        {
          type: 'window_access',
          severity: 'low',
          location: 'Kitchen window',
          description: 'Window access restricted by counter items, making it difficult to open for ventilation.',
          fix: 'Clear window area. Consider installing window fan for easier ventilation control.',
          expectedImprovement: 'Improved ventilation flexibility',
          frameRef: 2
        }
      ],
      summary: 'Room layout has 3 optimization opportunities. Priority: unblock HVAC vent (high impact), reposition air purifier (medium impact), improve window access (low impact). Expected overall improvement: 25-30% better air circulation.'
    };
  }

  return response;
}

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  🌐 AirGuard Gemini Proxy Server                              ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Server running on: http://localhost:${PORT}                     ║`);
  console.log(`║  API endpoint: POST http://localhost:${PORT}/api/gemini/analyze ║`);
  console.log(`║  Health check: GET http://localhost:${PORT}/api/health          ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  API Key Status: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Not Set (using dummy data)'}`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n⚠️  WARNING: GEMINI_API_KEY environment variable not set!');
    console.log('📝 Server will return dummy data for all requests.\n');
    console.log('To use real Gemini API, run:');
    console.log('   Windows (PowerShell): $env:GEMINI_API_KEY="your-key-here"; node server/proxy.js');
    console.log('   Linux/Mac: GEMINI_API_KEY=your-key-here node server/proxy.js\n');
  }
});

module.exports = app;
