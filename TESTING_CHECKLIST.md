# AI Integration Testing Checklist

## ✅ Setup Complete

### Environment Configuration
- [x] 2 Gemini API keys added to .env
- [x] 1 Groq API key added to .env
- [x] Dev server running (http://localhost:5174)

### Code Integration
- [x] `callAIWithRotation()` function implemented
- [x] `callGeminiAPI()` updated for multi-key support
- [x] `callGroqAPI()` function added
- [x] UI updated to show AI provider
- [x] No compile errors

## 🧪 Testing Steps

### 1. Connect Data Source
- [ ] Open http://localhost:5174 in browser
- [ ] Choose a data source:
  - [ ] Option A: ThingSpeak (requires channel ID)
  - [ ] Option B: India AQI (select city)
  - [ ] Option C: CSV upload
- [ ] Verify dashboard displays with charts

### 2. Test AI Analysis
- [ ] Locate "AI Insights" card on dashboard
- [ ] Click "Analyze with AI" button
- [ ] Watch for loading spinner
- [ ] Check browser console (F12) for logs

### 3. Verify Provider Rotation
**Expected Console Output:**
```
🔑 Found 2 Gemini key(s) and 1 Groq key
🤖 Trying Gemini gemini-1.5-flash with key 1/2
```

**Success Scenario:**
- [ ] Analysis appears within 1-5 seconds
- [ ] Provider badge shows: "Analysis by: Gemini gemini-1.5-flash (Key 1)"
- [ ] Results include:
  - [ ] Summary paragraph
  - [ ] Health Impact section
  - [ ] Trend indicator (improving/stable/deteriorating)
  - [ ] Key Findings (with checkmarks/warnings)
  - [ ] Recommendations list

### 4. Test Groq Fallback (Optional)
To test Groq as fallback:
1. [ ] Temporarily modify `.env` to use invalid Gemini key
2. [ ] Refresh page
3. [ ] Click "Analyze with AI"
4. [ ] Should see: `🤖 Trying Groq AI as fallback`
5. [ ] Analysis should still work with Groq
6. [ ] Restore valid Gemini keys after test

### 5. Test Offline Mode (Optional)
To test offline analysis:
1. [ ] Comment out all API keys in `.env`
2. [ ] Restart dev server: Ctrl+C, then `npm run dev`
3. [ ] Click "Analyze with AI"
4. [ ] Should see: `⚠️ All AI providers exhausted, using intelligent fallback`
5. [ ] Analysis still appears (based on sensor data patterns)
6. [ ] Restore API keys after test

## 📊 Expected Results

### Successful Analysis Response
```json
{
  "summary": "Your indoor air quality is currently...",
  "insights": [
    {"type": "good", "text": "PM2.5 levels are within safe limits..."},
    {"type": "warning", "text": "Humidity is slightly high..."}
  ],
  "recommendations": [
    "Continue monitoring PM2.5 levels...",
    "Consider running dehumidifier..."
  ],
  "healthImpact": "Current conditions are generally safe...",
  "trend": "stable"
}
```

### UI Display
- Header: "Powered by Gemini + Groq AI"
- Provider badge: "Analysis by: [Provider Name]"
- Color-coded insights (green checkmark = good, yellow warning = concern)
- Trend badge (green = improving, red = deteriorating, yellow = stable)

## 🐛 Troubleshooting

### Issue: "Failed to generate AI insights"
**Check:**
- [ ] Browser console for error details
- [ ] Network tab (F12 → Network) for API request status
- [ ] API keys are correct in .env (no extra spaces)
- [ ] Internet connection is active

### Issue: No provider rotation visible
**Check:**
- [ ] Browser console shows rotation attempts
- [ ] Dev server restarted after .env changes
- [ ] Hard refresh browser (Ctrl+Shift+R)

### Issue: Always using offline mode
**Check:**
- [ ] API keys present in .env
- [ ] Keys don't have quotes around them
- [ ] Dev server restarted after adding keys
- [ ] Keys are valid (test in API playground)

## 🎯 Success Criteria

✅ **PASS** if:
1. AI analysis completes successfully
2. Provider badge shows correct AI name
3. Analysis results are relevant to sensor data
4. Console shows provider rotation logic
5. No errors in console

❌ **FAIL** if:
1. Always shows offline mode (with valid keys)
2. Errors appear in console
3. Analysis never completes (stuck loading)
4. Results are generic/irrelevant

## 📝 Notes

### API Rate Limits
- **Gemini Free Tier**: 15 requests/minute per key
- **Groq Free Tier**: 30 requests/minute
- **Combined**: ~60 requests/minute with all 3 keys

### Response Times
- Gemini 1.5 Flash: ~1-2 seconds (fastest)
- Gemini 2.0 Flash Exp: ~2-3 seconds
- Groq llama-3.3-70b: ~2-4 seconds
- Offline: Instant (< 100ms)

### Provider Priority
1. Gemini Key 1 (3 models)
2. Gemini Key 2 (3 models)
3. Groq AI (1 model)
4. Offline analysis (always works)

---

**Test Date**: ___________
**Tested By**: ___________
**Result**: ⬜ PASS | ⬜ FAIL
**Notes**: ___________________________________________
