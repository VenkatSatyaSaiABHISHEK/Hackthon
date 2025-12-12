# AI Integration Guide - Dual Provider System

## Overview
The dashboard now supports **dual AI providers** for reliable air quality analysis:
1. **Google Gemini AI** (2 API keys with multi-model fallback)
2. **Groq AI** (llama-3.3-70b-versatile model)

## How It Works

### Multi-Provider Failover System
The system tries AI providers in this order:
1. **Gemini Key 1** → tries 3 models (gemini-1.5-flash, gemini-2.0-flash-exp, gemini-1.5-pro)
2. **Gemini Key 2** → tries 3 models (gemini-1.5-flash, gemini-2.0-flash-exp, gemini-1.5-pro)
3. **Groq AI** → llama-3.3-70b-versatile model
4. **Intelligent Offline Analysis** → If all APIs fail, uses data-driven analysis

Total API attempts: **7 attempts** before falling back to offline mode (2 keys × 3 models + 1 Groq)

## API Keys Configuration

### Environment Variables (.env)
```bash
VITE_GEMINI_API_KEY_1=your_gemini_api_key_1_here
VITE_GEMINI_API_KEY_2=your_gemini_api_key_2_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### Key Features
- **Gemini**: 2 keys with automatic rotation on quota errors (429)
- **Groq**: OpenAI-compatible API with llama-3.3-70b model
- **Smart Fallback**: Automatically switches providers on failure

## API Specifications

### Google Gemini API
**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

**Models**:
- `gemini-1.5-flash` (fastest, free tier)
- `gemini-2.0-flash-exp` (experimental, latest features)
- `gemini-1.5-pro` (most capable, larger context)

**Request Format**:
```json
{
  "contents": [{
    "parts": [{"text": "prompt"}]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 1024
  }
}
```

### Groq AI API
**Endpoint**: `https://api.groq.com/openai/v1/chat/completions`

**Model**: `llama-3.3-70b-versatile`

**Request Format** (OpenAI-compatible):
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {"role": "system", "content": "You are an expert air quality analyst."},
    {"role": "user", "content": "prompt"}
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "response_format": {"type": "json_object"}
}
```

## Error Handling

### Quota Exceeded (429)
- Gemini: Tries next model → next key → Groq
- Groq: Falls back to offline analysis
- **Result**: Continuous availability even during peak usage

### API Errors
- Network errors: Try next provider
- Invalid responses: Try next provider
- All failures: Use intelligent offline analysis

## AI Response Format

All AI providers return the same JSON structure:

```json
{
  "summary": "Brief 2-3 sentence overall assessment",
  "insights": [
    {"type": "good", "text": "Positive finding"},
    {"type": "warning", "text": "Area of concern"}
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ],
  "healthImpact": "1-2 sentence health assessment",
  "trend": "improving|stable|deteriorating"
}
```

## UI Features

### Provider Indication
The dashboard shows which AI provider was used:
- **Header Badge**: "Powered by Gemini + Groq AI"
- **Analysis Badge**: "Analysis by: Gemini gemini-1.5-flash (Key 1)"
- **Offline Badge**: "Analysis by: Intelligent Analysis (Offline)"

### User Experience
1. Click "Analyze with AI" button
2. System tries providers in order (user sees loading state)
3. First successful provider returns analysis
4. UI displays provider name and analysis results

## Testing

### Test Gemini Integration
1. Ensure dev server is running: `npm run dev`
2. Connect data source (ThingSpeak, India AQI, or CSV)
3. Click "Analyze with AI"
4. Check browser console for: `🤖 Trying Gemini gemini-1.5-flash with key 1/2`
5. Verify analysis appears with provider badge

### Test Groq Fallback
To test Groq failover, temporarily disable Gemini keys:
1. Comment out Gemini keys in `.env`
2. Restart dev server
3. Click "Analyze with AI"
4. Should see: `🤖 Trying Groq AI as fallback`

### Test Offline Mode
1. Comment out all API keys in `.env`
2. Restart dev server
3. Click "Analyze with AI"
4. Should see: `⚠️ All AI providers exhausted, using intelligent fallback`

## Performance

### Response Times (Typical)
- **Gemini 1.5 Flash**: 1-2 seconds
- **Gemini 2.0 Flash Exp**: 2-3 seconds
- **Groq llama-3.3-70b**: 2-4 seconds
- **Offline Analysis**: Instant (< 100ms)

### Cost Efficiency
- Gemini free tier: 15 requests/minute
- Groq free tier: 30 requests/minute
- With 2 Gemini + 1 Groq = ~60 requests/minute combined
- Offline mode: Unlimited, free

## Troubleshooting

### "Quota exceeded" Error
**Solution**: Wait 1 minute or let system auto-rotate to next provider

### "Invalid response format"
**Cause**: AI returned non-JSON response
**Solution**: System automatically tries next model/provider

### "Failed to generate AI insights"
**Cause**: Network error or all providers failed
**Solution**: Check console logs, verify API keys, check internet connection

## Code Location

**File**: `src/components/AISummaryCard.jsx`

**Key Functions**:
- `callAIWithRotation()` - Main orchestration (line 46)
- `callGeminiAPI()` - Gemini API integration (line 103)
- `callGroqAPI()` - Groq API integration (line 206)
- `generateIntelligentDemoAnalysis()` - Offline fallback (line 297)

## Benefits

✅ **High Availability**: 7 API attempts before offline mode
✅ **Cost Optimization**: Uses free tier efficiently
✅ **Performance**: Fast response times (1-4 seconds)
✅ **Reliability**: Never fails completely (offline fallback)
✅ **Transparency**: Shows which provider was used
✅ **Scalability**: Easy to add more keys or providers

## Future Enhancements

- [ ] Add OpenAI GPT-4 as 3rd provider
- [ ] Implement A/B testing between providers
- [ ] Cache analysis results for 5 minutes
- [ ] Add provider selection toggle in UI
- [ ] Track provider success rates
- [ ] Add cost tracking dashboard

---

**Created**: 2024
**Author**: AI Dashboard Team
**Status**: ✅ Production Ready
