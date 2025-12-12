# 🌿 AirGuard AI - Indoor Air Health Assistant

A modern web application that analyzes indoor air quality using IoT sensor data (CSV) and room video, with **Guest/Demo Mode** for instant exploration.

## ✨ Features

- 🎭 **Guest/Demo Mode** - Try the app instantly with pre-loaded demo credentials and assets
- 📊 **Smart CSV Parsing** - Automatically detects and parses PM2.5, PM10, temperature, humidity, and noise sensor data
- 🎥 **Video Analysis** - Upload room videos for visual context (placeholder for Gemini Vision integration)
- 🤖 **AI-Powered Analysis** - Real-time air quality assessment using Google Gemini 2.0
- 📈 **Interactive Dashboard** - Beautiful, responsive UI with real-time statistics
- 🎯 **Actionable Insights** - Get evidence-based recommendations for improving air quality
- 😊 **Dynamic Character** - Aira changes expression based on air quality score
- 🔌 **ThingSpeak Integration** - Connect to your own ThingSpeak channel or use demo credentials

## 🎭 Demo Mode

### Quick Start with Demo

The app now features a complete **Guest/Demo Mode** for instant exploration:

1. **No Login Required** - App launches directly to the dashboard
2. **Pre-filled ThingSpeak Credentials:**
   - Channel ID: `2725064`
   - Read API Key: `OO56NIHVPTB1BSY0`
3. **Demo Toggle** - Enable Demo Mode to see how the app works
4. **localStorage Persistence** - Your preferences are saved across sessions

### Demo Mode Features

- **Toggle Demo Mode:** Click the Demo Mode switch in the Analysis page
  - Shows "Demo Mode Active" badge when enabled
  - Helpful hints for using demo credentials
- **ThingSpeak Management:**
  - View and edit ThingSpeak credentials
  - "Use Demo Credentials" button to reset to demo values
  - "Clear" button to enter your own credentials
  - Credentials persist in localStorage (`airguard_thingspeak_demo`)
- **Seamless Experience:**
  - Upload your own video and CSV files anytime
  - Switch between demo and real data easily
  - No backend server required - fully client-side

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example env file
   copy .env.example .env
   
   # Edit .env and add your Gemini API key
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`

## 📊 Preparing Your Data

### CSV Format

Your sensor CSV should have columns for time-series data. The app automatically detects:

**Auto-detected column names:**
- PM2.5: `pm2.5`, `pm25`, `pm_2.5`, or `field1`
- PM10: `pm10`, `pm_10`, or `field2`
- Temperature: `temp`, `temperature`, or `field3`
- Humidity: `hum`, `humidity`, or `field4`
- Noise: `noise`, `sound`, or `field5`
- Timestamp: `created_at`, `time`, `date`

**Example CSV:**
```csv
created_at,field1,field2,field3,field4,field5
2025-12-10 10:00,35.2,45.1,22.5,65.3,45.0
2025-12-10 10:05,38.5,48.2,23.1,67.2,46.5
2025-12-10 10:10,36.1,46.8,22.8,66.5,44.8
```

### Video Requirements

- Format: MP4, MOV, or any browser-supported video format
- Content: Short clip (5-30 seconds) showing your room
- Currently uses placeholder description - Gemini Vision integration coming soon!

## 🎯 How to Use

### Option 1: Demo Mode (Fastest)

1. **Enable Demo Mode:**
   - Navigate to the Analysis page
   - Toggle "Demo Mode" to ON
   - Demo video and CSV are automatically loaded
   - ThingSpeak credentials are pre-filled

2. **Analyze:**
   - Click "Analyze Room Health" button
   - View air quality score and recommendations
   - Explore all features with demo data

### Option 2: Your Own Data

1. **Configure ThingSpeak (Optional):**
   - Enter your ThingSpeak Channel ID and Read API Key
   - Or use "Use Demo Credentials" button
   - Credentials are saved in localStorage

2. **Upload Files:**
   - Click "Upload Room Video" and select your video file
   - Click "Upload Sensor CSV" and select your CSV file
   - CSV summary appears automatically after upload

3. **Analyze:**
   - Click "Analyze Room Health" button
   - Wait for AI to process (2-5 seconds)
   - View your air quality score and recommendations

4. **Interpret Results:**
   - **Score 75-100 (😊 Green):** Excellent air quality
   - **Score 50-74 (😐 Amber):** Moderate - some improvements needed
   - **Score 0-49 (😟 Red):** Poor - immediate action recommended

## 🔧 Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **State Management:** React hooks + localStorage
- **Icons:** Lucide React
- **Client-Side Analysis:** Pure JavaScript (no backend required)
- **AI:** Google Gemini 2.0 Flash Experimental (optional)
- **Language:** JavaScript (ES6+)

## 🔐 localStorage Keys

The app uses localStorage to persist user preferences:

- `airguard_demo_mode` (boolean) - Demo Mode enabled/disabled
- `airguard_thingspeak_demo` (JSON) - ThingSpeak credentials `{channelId, readApiKey}`

## ⚠️ Security Notes

**Important:** This implementation exposes the API key in client-side code for development/demo purposes only.

**For production apps:**
1. Create a backend API server
2. Store API key securely on server
3. Proxy Gemini API calls through your backend
4. Never commit `.env` file to version control

## 📁 Project Structure

```
airguard-ai/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind CSS imports
├── public/
├── .env.example         # Environment template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## 🎨 Key Features Explained

### Smart CSV Column Mapping

The app intelligently detects sensor columns:
```javascript
// Detects variations like:
'pm2.5', 'pm25', 'pm_2.5' → PM2.5
'temperature', 'temp' → Temperature
// Falls back to field1-5 if no headers match
```

### Gemini Integration

Located in `App.jsx` - `callGeminiAnalyze()` function:
- Constructs detailed sensor data summary
- Sends structured prompt to Gemini
- Parses JSON response with error handling
- Fallback to error message if API fails

### Character States

Aira (🌿) changes based on analysis:
- 😊 Happy - Excellent air quality (75-100)
- 😐 Neutral - Moderate quality (50-74)
- 😟 Worried - Poor quality (0-49)

## 🐛 Troubleshooting

**API Key Not Working:**
- Verify key is correct in `.env` file
- Restart dev server after adding `.env`
- Check browser console for error messages

**CSV Not Parsing:**
- Ensure CSV has headers
- Check for proper comma separation
- Verify numeric values (not text)

**"Error analyzing data" message:**
- Check internet connection
- Verify API key has Gemini API enabled
- Check browser console for detailed errors

## 📝 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔮 Future Enhancements

- [ ] Gemini Vision API integration for real video analysis
- [ ] Historical data tracking and trends
- [ ] Multi-room comparison
- [ ] Export reports as PDF
- [ ] Real-time IoT sensor integration
- [ ] Backend API proxy for secure deployment

## 📄 License

MIT License - Feel free to use this project for learning and development!

## 🙏 Credits

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [PapaParse](https://www.papaparse.com/)

---

**Made with 💚 for healthier indoor environments**
