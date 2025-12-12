# 🚀 Quick Start Guide - Advanced Analysis Pipeline

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ Node.js installed (v16 or higher)
- ⬜ FFmpeg installed (required for video processing)
- ⬜ Gemini API key (get from Google AI Studio)

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ Install FFmpeg

**Windows (Chocolatey - Recommended):**
```powershell
choco install ffmpeg
```

**Windows (Manual):**
1. Download: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH
4. Restart PowerShell

**Verify installation:**
```powershell
ffmpeg -version
```

### 2️⃣ Get Gemini API Key

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key (starts with `AIza...`)

### 3️⃣ Configure Backend

```powershell
# Navigate to server directory
cd server

# Create environment file from template
Copy-Item .env.example .env

# Open .env in notepad
notepad .env
```

Paste your API key:
```
GEMINI_API_KEY=AIzaSyC...your_actual_key_here
PORT=3001
NODE_ENV=development
```

Save and close.

### 4️⃣ Start Backend Server

```powershell
# Still in server/ directory
npm run dev
```

✅ **Expected output:**
```
Analysis server running on port 3001
Health check: http://localhost:3001/health
```

**Keep this terminal open!**

### 5️⃣ Start Frontend (New Terminal)

Open **second terminal**:
```powershell
# From project root
cd c:\VS\hackthon
npm run dev
```

✅ **Expected output:**
```
VITE ready in X ms
➜  Local:   http://localhost:5173/
```

---

## 🎯 First Analysis

### Upload Test Files

1. Open browser: **http://localhost:5173/analysis**
2. Click **"Upload Room Video"**
   - Select MP4/MOV file (< 100MB)
   - Should show video preview
3. Click **"Upload Sensor CSV"**
   - Select CSV file with columns: `timestamp`, `co2`, `pm25`, etc.
   - Should show green checkmark
4. Click **"Analyze Room Health"**

### Watch Progress

You'll see 3 stages:
- **Stage 1** (0-33%): Extracting frames from video...
- **Stage 2** (34-66%): Analyzing frames with AI...
- **Stage 3** (67-100%): Generating report...

### View Results

Auto-redirected to results page with:
- **Score circle** (0-100) with color coding
- **Video canvas** with red/blue overlays
- **Frame timeline** (click thumbnails to navigate)
- **Evidence panel** (detected issues)
- **Verification panel** (AI claim validation)
- **Summary card** (top issues + actions)

---

## 🧪 Quick Test (No Files Needed)

Test backend without uploading files:

```powershell
# In new terminal
curl http://localhost:3001/api/analyze/demo
```

Should return JSON with demo analysis.

---

## 🔧 Troubleshooting

### "FFmpeg not found"
```powershell
# Install FFmpeg
choco install ffmpeg

# Verify
ffmpeg -version

# Restart terminals after installing
```

### "Gemini API key invalid"
1. Check `server/.env` file exists
2. Verify key format: starts with `AIza`
3. Restart backend server: `Ctrl+C` then `npm run dev`

### "Backend not responding"
1. Check backend terminal for errors
2. Verify port 3001 is free: `netstat -ano | findstr :3001`
3. Test health check: `curl http://localhost:3001/health`

### "CORS error in browser console"
- Ensure backend is running on port 3001
- Check `server/index.js` has CORS middleware enabled

---

## 📁 Sample CSV Format

Your CSV should have these columns:

```csv
timestamp,co2,pm25,temperature,humidity
2024-01-15T10:00:00Z,800,12,22.5,45
2024-01-15T10:01:00Z,850,15,22.6,46
2024-01-15T10:02:00Z,1200,18,22.8,47
```

**Required:**
- `timestamp` (ISO 8601 or Unix timestamp)
- At least one sensor metric: `co2`, `pm25`, `temperature`, `humidity`, etc.

---

## 🎨 Result Page Features

### Video Canvas
- **Red boxes**: Detected objects/issues from Gemini Vision
- **Blue circles**: Sensor event locations
- **Black caption**: AI explanation for the frame
- **Toggle button**: Switch between overlay modes

### Frame Timeline
- **Thumbnails**: Click to jump to frame
- **Red badge**: Frame has evidence
- **Auto-scroll**: Follows selected frame

### Evidence Panel
- **Blue icon**: Sensor-based evidence
- **Red icon**: Vision-based evidence
- **Expand**: Click for details

### Verification Panel
- **Green ✓**: Verified claim (matches CSV data)
- **Red ✗**: Unverified (doesn't match)
- **Yellow ⚠**: Low confidence
- **Trust score**: Overall percentage at bottom

### Summary Card
- **Score circle**: Visual air health score
- **Top 3 issues**: Most important findings
- **Recommended action**: Priority action to take
- **Share**: Copy link to clipboard
- **Download PDF**: Export report (placeholder)

---

## 📊 What Happens Behind the Scenes

### Frame Extraction
1. Backend receives video + CSV
2. Analyzes CSV for sensor peaks (mean + 1.5*std)
3. Uses FFmpeg to extract frames at peak timestamps
4. Resizes to 400px width for efficiency
5. Encodes to base64 for API transmission

### AI Analysis
1. **Gemini Vision** (1.5 Flash):
   - Sends max 5 frames
   - Returns bounding boxes, labels, captions
2. **Gemini Pro** (1.5 Pro):
   - Correlates sensor + vision data
   - Calculates air health score (0-100)
   - Generates risk description
   - Recommends actions

### Verification
1. Extracts claimed values from AI response
2. Searches CSV for matching rows
3. Validates within ±10% tolerance
4. Returns verified/unverified status
5. Calculates overall trust score

### Caching
- MD5 hash of video + CSV payload
- Stores result in memory
- Retrieves cached result if identical files uploaded again

---

## 📝 Next Steps

### Customize Analysis
Edit `server/analyze.js`:
- Line 45: Change peak threshold (currently 1.5*std)
- Line 120: Change frame extraction interval (currently 2s)
- Line 315: Change tolerance for verification (currently ±10%)

### Add More Metrics
Edit CSV to include additional sensor columns:
- `voc` - Volatile organic compounds
- `tvoc` - Total VOC
- `noise` - Noise level in dB
- `light` - Light intensity in lux

Backend will automatically include them in analysis.

### Export to PDF
Implement PDF export in `CanvaReportCard.jsx`:
```powershell
npm install html2pdf.js
```
Update `handleDownloadPDF()` function to generate PDF.

---

## 🆘 Need Help?

1. **Check logs**:
   - Backend terminal: Shows API calls, errors, frame extraction
   - Browser console (F12): Shows frontend errors, network requests

2. **Test endpoints**:
   - Health: http://localhost:3001/health
   - Demo: http://localhost:3001/api/analyze/demo

3. **Review documentation**:
   - `ANALYSIS_SETUP.md` - Detailed setup guide
   - `ARCHITECTURE.md` - Technical architecture
   - `README_IMPLEMENTATION.md` - Feature summary

4. **Common issues**:
   - FFmpeg not in PATH → Reinstall, restart terminals
   - API key invalid → Regenerate from Google AI Studio
   - Port 3001 in use → Kill process or change PORT in .env
   - CORS error → Restart backend server

---

## ✅ Success Checklist

Before you start analyzing:
- [ ] FFmpeg installed (`ffmpeg -version` works)
- [ ] Backend dependencies installed (`npm install` in server/)
- [ ] `.env` file created with Gemini API key
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173/analysis
- [ ] Demo endpoint works: http://localhost:3001/api/analyze/demo

**All checked?** You're ready to analyze! 🎉

---

## 🚀 Production Deployment (Future)

When ready to deploy:
1. Set `NODE_ENV=production` in `.env`
2. Use environment variables for API URLs
3. Add authentication (Firebase Auth, JWT, etc.)
4. Implement rate limiting (express-rate-limit)
5. Use cloud storage for temp files (AWS S3, GCS)
6. Deploy backend to cloud (Railway, Heroku, GCP)
7. Deploy frontend to Vercel/Netlify
8. Configure CORS for production domain
9. Set up monitoring (Sentry, LogRocket)
10. Add backup/restore for analysis cache

---

**Ready to go?** Start with Step 1 and follow through! 🎯
