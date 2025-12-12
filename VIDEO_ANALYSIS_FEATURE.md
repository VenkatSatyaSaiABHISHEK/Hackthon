# 🎥 Video-Only Analysis Feature

## Overview
Users can now analyze room videos **without uploading CSV sensor data** by using public AQI data instead!

## New Features

### 1. **Dual Data Source Options**
Users can choose between:
- **📊 Upload CSV**: Traditional sensor data upload
- **🌍 Public AQI**: Live outdoor air quality data from your location

### 2. **Video-Only Analysis**
- Upload room/indoor video
- Enter your location (city name)
- AI analyzes the video for air quality issues
- Combines visual analysis with public AQI data

### 3. **AI Vision Analysis**
The AI examines your video for:
- ✅ **Ventilation Assessment**: Window status, air circulation devices
- ⚠️ **Pollutant Sources**: Cooking equipment, smoking areas, industrial equipment
- 👁️ **Visible Issues**: Dust, smoke, condensation, mold
- 🏠 **Room Conditions**: Air purifiers, plants, clutter
- ⚕️ **Health Risks**: Visible hazards affecting air quality

### 4. **Canva-Style Results**
Beautiful visual report includes:
- **Overall Assessment**: AI summary of room air quality
- **Visual Findings Grid**: Color-coded cards showing each issue
  - 🟢 Green: Good conditions
  - 🟡 Yellow: Moderate concerns
  - 🔴 Red: Serious issues
- **Priority Recommendations**: Action items sorted by urgency
- **Location Tags**: Where in the room each issue was detected

## How to Use

### Option 1: Video + Public AQI
1. Go to **Analysis Page**
2. Upload your room video
3. Click **"Public AQI"** toggle
4. Enter your city name (e.g., "New York", "London", "Tokyo")
5. Click **"Analyze Air Quality"**
6. View comprehensive results with:
   - Video analysis findings
   - Public AQI data for your location
   - Combined air quality score
   - Visual report cards

### Option 2: Video + CSV (Original)
1. Upload room video
2. Keep **"Upload CSV"** selected
3. Upload sensor CSV file
4. Click **"Analyze Air Quality"**
5. Get detailed analysis with both video and sensor data

## What the AI Sees

### Video Analysis Details
The AI vision model analyzes:
- **Ventilation**: Are windows open? Any fans or AC units running?
- **Cleanliness**: Visible dust, dirt, or debris
- **Moisture**: Condensation on windows, damp walls
- **Equipment**: Air purifiers, dehumidifiers, HVAC systems
- **Plants**: Indoor plants that improve air quality
- **Hazards**: Smoking, cooking without ventilation, mold growth

### Public AQI Data Includes
- Overall AQI index (0-500 scale)
- PM2.5 particulate matter
- PM10 particulate matter
- CO₂ levels
- Temperature
- Humidity

## Example Use Cases

### 🏠 Home Air Quality Check
"I want to know if my bedroom has good air quality but don't have sensors"
- Upload bedroom video
- Use public AQI for outdoor comparison
- Get recommendations like "Open windows for ventilation" or "Add air purifier"

### 🏢 Office Assessment
"Check if our meeting room needs better ventilation"
- Record short video of the room
- AI detects closed windows, no visible air circulation
- Recommends opening windows or installing ventilation system

### 🍳 Kitchen Analysis
"Is my kitchen air quality safe when cooking?"
- Upload cooking video
- AI identifies gas stove, lack of exhaust hood
- High-priority recommendation: Install range hood

## Technical Details

### AI Model
- **Vision Model**: Gemini 2.0 Flash Experimental
- **Capabilities**: Multi-modal analysis (video/image + text)
- **Analysis Time**: 5-10 seconds per video

### Public AQI Integration
- **Current**: Mock data (demo mode)
- **Production Ready**: Integrate with OpenWeatherMap Air Pollution API
- **Real-time**: Fetches current outdoor air quality data

### Canva-Style Design
- Gradient backgrounds (purple, pink, orange)
- Color-coded severity indicators
- Priority badges (HIGH, MEDIUM, LOW)
- Location tags for each finding
- Glassmorphism effects (backdrop blur)

## UI Components

### Data Source Toggle
```
┌─────────────────┬─────────────────┐
│   Upload CSV    │   Public AQI    │
│  Your sensor    │ Live outdoor    │
│      data       │      data       │
└─────────────────┴─────────────────┘
```

### Location Input (Public AQI mode)
```
📍 Your Location
┌──────────────────────────────────┐
│ Enter city name...               │
└──────────────────────────────────┘
💡 We'll fetch current outdoor AQI
```

### Visual Findings Cards
```
┌────────────────────────────────┐
│ 🌪️  Poor Ventilation    [BAD] │
│ ─────────────────────────────  │
│ Windows appear closed, no      │
│ visible air circulation        │
│ 📍 Location: Main window area  │
└────────────────────────────────┘
```

### Recommendations
```
┌────────────────────────────────┐
│ 🔴 HIGH                        │
│ Open windows for cross-        │
│ ventilation                    │
│ ─────────────────────────────  │
│ Why: Improves air circulation  │
│ and reduces CO₂ levels         │
└────────────────────────────────┘
```

## Future Enhancements

### Phase 2
- [ ] Real-time video streaming analysis
- [ ] Multiple room comparison
- [ ] Time-lapse analysis (before/after improvements)
- [ ] AR overlays showing problem areas
- [ ] Export video with annotations

### Phase 3
- [ ] Integration with smart home devices
- [ ] Automated monitoring with webcam
- [ ] Alert system for detected issues
- [ ] Historical tracking of improvements
- [ ] Community benchmarking

## API Key Requirements

### Current Setup
- **Gemini API**: Required for video analysis
- **Public AQI**: Currently using mock data (no key needed)

### For Production
Add to `.env`:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

Get keys from:
- Gemini: https://aistudio.google.com/apikey
- OpenWeather: https://openweathermap.org/api

## Benefits

### For Users Without Sensors
✅ Still get air quality insights
✅ Visual assessment of room conditions
✅ Context-aware recommendations
✅ Compare indoor video with outdoor AQI

### For Power Users
✅ Combine video + CSV for comprehensive analysis
✅ Verify sensor readings with visual evidence
✅ Identify physical sources of air quality issues
✅ Get location-specific recommendations

## Testing Tips

### Good Test Videos
- Well-lit room (natural or artificial light)
- Show entire room or specific areas
- Include windows, vents, air purifiers
- 5-30 seconds duration
- MP4 or MOV format

### Test Locations
- Your city name
- Nearby city for comparison
- International cities (London, Tokyo, etc.)

## Support

Having issues? Check:
1. Video file is < 100MB
2. Gemini API key is valid
3. Browser console for errors
4. Internet connection for AQI fetch

## Summary

This feature makes air quality analysis accessible to everyone - no sensors required! Just upload a video of your room, and AI will tell you what's affecting your air quality and how to fix it. 🎉

**Live Demo**: http://localhost:5173/home
