# AirGuard Advanced AI Features - Installation & Setup Guide

## 📦 Installation Commands

### 1. Install Frontend Dependencies
Run this command in the project root directory:

```powershell
npm install axios papaparse html2pdf.js recharts react-apexcharts file-saver
```

### 2. Install Backend Proxy Server Dependencies
```powershell
npm install express cors body-parser
```

**Alternative (Install All at Once):**
```powershell
npm install axios papaparse html2pdf.js recharts react-apexcharts file-saver express cors body-parser
```

---

## 🚀 Running the Application

### Option A: With Proxy Server (Recommended for API Key Security)

#### Step 1: Start the Proxy Server
Open a terminal in project root:

**With API Key (Real Gemini Analysis):**
```powershell
# Set environment variable
$env:GEMINI_API_KEY="your-gemini-api-key-here"

# Start proxy server
node server/proxy.js
```

**Without API Key (Dummy Data Mode):**
```powershell
node server/proxy.js
```

You should see:
```
╔════════════════════════════════════════════════════════════════╗
║  🌐 AirGuard Gemini Proxy Server                              ║
╠════════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:3001                     ║
║  API endpoint: POST http://localhost:3001/api/gemini/analyze  ║
║  Health check: GET http://localhost:3001/api/health           ║
╠════════════════════════════════════════════════════════════════╣
║  API Key Status: ✅ Configured                                 ║
╚════════════════════════════════════════════════════════════════╝
```

#### Step 2: Start Frontend Development Server
Open a **NEW** terminal (keep proxy server running):

```powershell
npm run dev
```

Expected output:
```
VITE v4.4.5  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Option B: Without Proxy (Using Client-Side API Calls)

Just start the frontend:
```powershell
npm run dev
```

Note: This will use dummy data fallback unless you configure `VITE_GEMINI_API_KEY` in `.env` file.

---

## 🧪 Testing the AI Features

### Test 1: Forecast Feature

1. Open browser: `http://localhost:5173/forecast`
2. Click "Run Forecast" button
3. Select time horizon: 12h / 24h / 48h
4. Verify:
   - ✅ Chart displays predictions
   - ✅ Statistics cards show Avg/Min/Max
   - ✅ AI summary appears with confidence badge
   - ✅ Can switch between PM2.5, PM10, Temperature, Humidity

### Test 2: Chat Assistant

1. Navigate to: `http://localhost:5173/assistant`
2. Try these test questions:
   - "What's the current air quality?"
   - "Is it safe to open windows?"
   - "What are the health risks for children?"
   - "How can I improve air quality?"
3. Verify:
   - ✅ AI responds with context-aware answers
   - ✅ Suggested questions appear when empty
   - ✅ Typing indicator shows during response
   - ✅ Clear Chat button works
   - ✅ Messages scroll automatically

### Test 3: Report Page Advanced Components

1. Navigate to: `http://localhost:5173/dashboard`
2. Click "Run Analysis" (if available) OR navigate directly to `/report`
3. Scroll through report to verify new sections:

   **✅ Source Detection Card:**
   - Primary pollution source displayed (e.g., "Cooking Fumes")
   - Confidence percentage badge
   - Evidence list (expandable)
   - Secondary sources as tags

   **✅ Health Risk Matrix:**
   - 4 demographic cards: Children, Elderly, Asthma, Adults
   - Risk level badges (High/Moderate/Low)
   - Progress bars (0-100 score)
   - Recommended actions
   - Expandable reasoning

   **✅ Ventilation Advisor:**
   - Indoor vs Outdoor PM2.5 comparison
   - 24-hour schedule table
   - Visual timeline (color-coded)
   - Warning alerts (if any)

   **✅ Room Optimization Card:**
   - Layout issue cards (expandable)
   - Severity badges
   - Fix instructions
   - Expected improvements
   - Summary counters (Total Issues, High Priority, Quick Wins)

### Test 4: LocalStorage Context Persistence

1. Run analysis on Dashboard (or use dummy data on Report page)
2. Navigate to `/forecast` - should load last analysis automatically
3. Navigate to `/assistant` - should show context info footer
4. Verify localStorage:
   ```javascript
   // In browser DevTools Console:
   JSON.parse(localStorage.getItem('airguard_last_analysis'))
   ```

### Test 5: Export Features

1. On Report page, click "Download PDF Report"
   - ✅ PDF downloads with all sections
2. Click "Download Raw JSON"
   - ✅ JSON file downloads with complete analysis data

---

## 🔍 Troubleshooting

### Issue: "No pollution source data available"
**Solution:** Analysis hasn't run yet or advanced features weren't included.
- Navigate to Dashboard and run analysis
- Verify localStorage has data: `localStorage.getItem('airguard_last_analysis')`

### Issue: Proxy server returns 404
**Solution:** Ensure proxy is running on correct port
```powershell
# Check if running:
curl http://localhost:3001/api/health
```

### Issue: CORS errors in browser console
**Solution:** Proxy server includes CORS headers for `localhost:5173`
- Restart proxy server
- Clear browser cache
- Verify frontend URL matches CORS config

### Issue: "Maximum token length exceeded" error
**Solution:** Reduce payload size
- Sample fewer time series points (currently: last 50)
- Reduce number of video frames (max 5)
- Disable unused features in payload

### Issue: All components show "No data available"
**Solution:** 
1. Check if analysis object exists: `console.log(analysis)`
2. Verify localStorage: `localStorage.getItem('airguard_last_analysis')`
3. Run analysis from Dashboard first
4. Check browser console for errors

---

## 📁 File Structure Reference

```
hackthon/
├── server/
│   └── proxy.js                          # Express proxy server
├── src/
│   ├── api/
│   │   ├── geminiClient.js               # Gemini API wrapper
│   │   └── dataFetchers.js               # Data source utilities
│   ├── components/
│   │   └── report/
│   │       ├── SourceDetectionCard.jsx   # Pollution source UI
│   │       ├── HealthRiskMatrix.jsx      # Health risks UI
│   │       ├── VentilationAdvisor.jsx    # Ventilation schedule UI
│   │       └── RoomOptimizationCard.jsx  # Layout suggestions UI
│   ├── hooks/
│   │   ├── useForecastAI.js              # Forecast hook
│   │   ├── useSourceDetectionAI.js       # Source detection hook
│   │   ├── useHealthRiskAI.js            # Health risk hook
│   │   ├── useRoomAdvisorAI.js           # Room advisor hook
│   │   └── useChatAssistantAI.js         # Chat assistant hook
│   └── pages/
│       ├── ForecastPage.jsx              # Forecast UI page
│       ├── ChatAssistant.jsx             # Chat UI page
│       └── ReportPage.jsx                # Updated with new components
└── package.json
```

---

## 🎯 Next Steps

1. **Get Gemini API Key:**
   - Visit: https://aistudio.google.com/app/apikey
   - Create new API key
   - Add to proxy server environment

2. **Test with Real Data:**
   - Connect ThingSpeak or OpenAQ
   - Upload CSV file
   - Add video frames
   - Run full analysis

3. **Customize Components:**
   - Adjust color schemes in Tailwind classes
   - Modify confidence thresholds
   - Add more demographic groups
   - Extend ventilation schedule logic

4. **Deploy:**
   - Build frontend: `npm run build`
   - Deploy proxy server to cloud (Heroku, Railway, etc.)
   - Configure production environment variables
   - Update CORS origins in proxy.js

---

## ✅ Success Checklist

- [ ] All npm packages installed
- [ ] Proxy server starts without errors
- [ ] Frontend dev server runs on :5173
- [ ] Forecast page displays predictions
- [ ] Chat assistant responds to questions
- [ ] Report page shows 4 new AI components
- [ ] PDF export works
- [ ] JSON export works
- [ ] LocalStorage persistence works
- [ ] No console errors in browser

---

**Need Help?** Check browser DevTools Console for detailed error messages.
