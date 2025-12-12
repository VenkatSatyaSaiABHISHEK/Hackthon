# Advanced Analysis Pipeline - Setup Instructions

## Overview
This implements a production-ready visual analysis pipeline with:
- **Frame extraction** from video using FFmpeg
- **Gemini AI integration** for vision analysis and reasoning
- **Deterministic verification** of AI claims
- **Canva-style visual reporting** with interactive drill-down

## Backend Setup

### 1. Install FFmpeg
FFmpeg is required for video frame extraction.

**Windows:**
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from: https://www.gyan.dev/ffmpeg/builds/
# Add ffmpeg.exe to PATH
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### 2. Install Node.js Dependencies
```powershell
cd server
npm install
```

This installs:
- `express` - Web server framework
- `@google/generative-ai` - Gemini AI SDK
- `fluent-ffmpeg` - FFmpeg wrapper for Node.js
- `multer` - File upload handling
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 3. Configure Environment Variables
```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
NODE_ENV=development
```

**Get Gemini API Key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Get API Key" → "Create API key"
4. Copy the key and paste it in `.env`

### 4. Start Backend Server
```powershell
# Development mode (with auto-restart)
cd server
npm run dev

# Production mode
npm start
```

Server will run on **http://localhost:3001**

You should see:
```
Analysis server running on port 3001
Health check: http://localhost:3001/health
```

## Frontend Setup

### 1. Install Frontend Dependencies (if not already done)
```powershell
cd ..
npm install
```

### 2. Start Frontend Development Server
```powershell
npm run dev
```

Frontend will run on **http://localhost:5173** (or next available port)

## Testing the Pipeline

### 1. Prepare Test Files
- **Video file**: MP4 or MOV format, < 100MB
- **CSV file**: Sensor data with columns like `timestamp`, `co2`, `pm25`, `temperature`, etc.

### 2. Upload and Analyze
1. Navigate to **http://localhost:5173/analysis**
2. Upload room video
3. Upload sensor CSV
4. Click "Analyze Room Health"
5. Wait for processing (3 stages):
   - Stage 1: Extracting frames (0-33%)
   - Stage 2: Analyzing with AI (34-66%)
   - Stage 3: Generating report (67-100%)
6. View results at `/analysis/result/:id`

### 3. Explore Result Page
The result page includes:
- **Score pill** (0-100) with color coding
- **Risk description** in gradient card
- **Confidence badge** (high/medium/low)
- **Annotated video canvas** with:
  - Bounding boxes (red) from Gemini Vision
  - Sensor event markers (blue circles)
  - Frame captions with AI explanations
- **Frame timeline** for quick navigation
- **Evidence panel** with sensor + vision evidence
- **Verification panel** showing AI claim validation
- **Canva report card** with visual summary tiles
- **Download options**: JSON, Share link, PDF export (placeholder)

## API Endpoints

### POST /api/analyze
Analyzes uploaded video + CSV files.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `video` (file): Video file
  - `csv` (file): CSV file
  - `strategy` (string, optional): 'peak' or 'fixed' (default: 'peak')

**Response:**
```json
{
  "id": "abc123",
  "air_health_score": 72,
  "risk_description": "Moderate air quality concerns detected...",
  "evidence": [...],
  "recommended_actions": [...],
  "confidence": "high",
  "frames": [...],
  "verification": [...],
  "prompt": "..."
}
```

### GET /api/analyze/result/:id
Retrieves cached analysis result.

**Response:** Same as POST /api/analyze

### GET /api/analyze/demo
Returns demo analysis with sample data.

### GET /health
Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

## Architecture

### Frame Extraction Strategy
1. **Peak-based** (default):
   - Analyzes CSV for sensor value peaks (mean + 1.5*std threshold)
   - Extracts frames at peak timestamps
   - Captures top 5 peaks for cost efficiency
   
2. **Fixed interval**:
   - Extracts 1 frame every 2 seconds
   - Max 10 frames total

### AI Analysis Pipeline
1. **Frame Extraction** (`extractFrames`)
   - FFmpeg extracts frames at target timestamps
   - Resizes to 400px max width (token optimization)
   - Encodes to base64 for API transmission

2. **Vision Analysis** (`analyzeFramesWithGemini`)
   - Sends max 5 frames to Gemini 1.5 Flash
   - Returns bounding boxes, labels, captions
   - Fallback: Local heuristic analysis if API fails

3. **Unified Reasoning** (`callGeminiUnifiedAnalysis`)
   - Gemini 1.5 Pro correlates sensor + vision data
   - Returns structured JSON: score, risk, evidence, actions
   - Fallback: Deterministic scoring from sensor stats

4. **Verification** (`verifyAIEvidence`)
   - Validates AI claims against source CSV rows
   - Checks if claimed values exist within ±10% tolerance
   - Returns verified/unverified status per evidence item

5. **Caching** (`hashPayload`)
   - MD5 hash of video+CSV payload
   - Stores results in memory cache
   - Avoids redundant processing for identical uploads

### Security Features
- API keys stored in `.env` (never committed)
- Temp file cleanup after 60 seconds
- File size limit: 100MB per file
- Input validation for file types

### Performance Optimizations
- Thumbnail generation (400px width) reduces API tokens
- Frame limiting (max 5 to Gemini) controls costs
- Result caching prevents duplicate analysis
- Async file processing with cleanup

## Troubleshooting

### Issue: "FFmpeg not found"
**Solution:** Install FFmpeg and ensure it's in PATH:
```powershell
ffmpeg -version
```

### Issue: "Gemini API key invalid"
**Solution:** 
1. Check `.env` file has correct key
2. Verify key at: https://makersuite.google.com/app/apikey
3. Restart server after updating `.env`

### Issue: "Analysis failed: Network error"
**Solution:**
1. Ensure backend server is running on port 3001
2. Check CORS is enabled in `server/index.js`
3. Verify frontend is calling `http://localhost:3001/api/analyze`

### Issue: "Frames not showing overlays"
**Solution:**
- Check browser console for image loading errors
- Verify `thumbnail_base64` field in API response
- Ensure `AnnotatedVideoCanvas` receives correct props

### Issue: "Verification always fails"
**Solution:**
- Check CSV has required columns (timestamp, co2, pm25, etc.)
- Verify CSV timestamp format matches video frame timestamps
- Increase tolerance threshold in `verifyAIEvidence` (currently ±10%)

## Next Steps

### Implement PDF Export
1. Install `html2pdf` library:
   ```powershell
   npm install html2pdf.js
   ```

2. Update `CanvaReportCard.jsx`:
   ```javascript
   import html2pdf from 'html2pdf.js';
   
   const handleDownloadPDF = () => {
     const element = document.getElementById('report-content');
     html2pdf()
       .from(element)
       .save('analysis-report.pdf');
   };
   ```

### Add Real-time Progress
1. Implement WebSocket connection for live progress updates
2. Stream frame extraction progress from backend
3. Show current frame being analyzed

### Deploy to Production
1. Set `NODE_ENV=production` in `.env`
2. Use environment variables for API URLs (not hardcoded localhost)
3. Add authentication/authorization for API endpoints
4. Implement rate limiting to prevent abuse
5. Use cloud storage for temp files (S3, GCS)
6. Deploy backend to cloud platform (Heroku, Railway, GCP)
7. Deploy frontend to Vercel/Netlify

## File Structure
```
server/
├── index.js              # Express server entry point
├── analyze.js            # Analysis pipeline (580+ lines)
├── package.json          # Dependencies
├── .env                  # Environment variables (not committed)
└── .env.example          # Template for environment variables

src/
├── pages/
│   ├── AnalysisPage.jsx         # Upload UI with progress tracking
│   └── AnalysisResultPage.jsx   # Result visualization page
└── components/
    └── analysis/
        ├── AnnotatedVideoCanvas.jsx    # Canvas with overlays
        ├── FrameTimeline.jsx            # Horizontal frame selector
        ├── EvidencePanel.jsx            # Evidence list
        ├── VerificationPanel.jsx        # Verification display
        └── CanvaReportCard.jsx          # Visual summary tiles
```

## Support
For issues or questions:
1. Check backend logs in terminal running `npm run dev`
2. Check browser console for frontend errors
3. Verify FFmpeg installation: `ffmpeg -version`
4. Verify Gemini API key is valid
5. Test with demo endpoint: http://localhost:3001/api/analyze/demo
