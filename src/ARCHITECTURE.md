# Advanced Analysis Pipeline - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. User uploads video + CSV → AnalysisPage.jsx
                              ↓
2. POST /api/analyze         Backend Server (Express)
                              ↓
3. Frame Extraction          FFmpeg extracts frames
                              ├── Peak-based (sensor spikes)
                              └── Fixed interval (every 2s)
                              ↓
4. Vision Analysis           Gemini 1.5 Flash
                              ├── Detects objects
                              ├── Labels with confidence
                              └── Generates captions
                              ↓
5. Unified Reasoning         Gemini 1.5 Pro
                              ├── Correlates sensor + vision
                              ├── Calculates air health score
                              ├── Generates risk description
                              └── Recommends actions
                              ↓
6. Verification              Deterministic checks
                              ├── Validates AI claims
                              ├── Checks ±10% tolerance
                              └── Returns trust score
                              ↓
7. Response                  JSON with analysis result
                              ↓
8. Navigate                  /analysis/result/:id
                              ↓
9. Display                   AnalysisResultPage.jsx
                              ├── AnnotatedVideoCanvas
                              ├── FrameTimeline
                              ├── EvidencePanel
                              ├── VerificationPanel
                              └── CanvaReportCard


┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

server/index.js (Express Server)
    │
    ├── CORS middleware
    ├── JSON/urlencoded parsers
    └── Routes:
        ├── POST /api/analyze       → Upload & analyze
        ├── GET /api/analyze/result/:id → Retrieve cached result
        ├── GET /api/analyze/demo   → Demo endpoint
        └── GET /health             → Health check

server/analyze.js (Analysis Pipeline)
    │
    ├── extractFrames(video, strategy)
    │   ├── Peak detection (mean + 1.5*std)
    │   ├── FFmpeg frame extraction
    │   ├── Resize to 400px (optimization)
    │   └── Base64 encoding
    │
    ├── analyzeFramesWithGemini(frames)
    │   ├── Send to Gemini 1.5 Flash
    │   ├── Receive bboxes, labels, captions
    │   └── Fallback: Local heuristic
    │
    ├── callGeminiUnifiedAnalysis(payload)
    │   ├── Send to Gemini 1.5 Pro
    │   ├── Strict JSON schema
    │   └── Fallback: Deterministic scoring
    │
    ├── verifyAIEvidence(result, csv)
    │   ├── Check claimed values in source
    │   ├── Validate ±10% tolerance
    │   └── Return verified/unverified
    │
    ├── hashPayload(video + csv)
    │   ├── MD5 hash for caching
    │   └── Avoid duplicate processing
    │
    └── Cleanup temp files (60s delay)


┌─────────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND ARCHITECTURE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

App.jsx (Router)
    │
    ├── /analysis → AnalysisPage.jsx
    │   ├── Video upload input
    │   ├── CSV upload input
    │   ├── Progress tracking (3 stages)
    │   ├── Error handling
    │   └── Navigate to /analysis/result/:id
    │
    └── /analysis/result/:id → AnalysisResultPage.jsx
        │
        ├── Header Section
        │   ├── Score pill (color-coded)
        │   ├── Risk description
        │   ├── Confidence badge
        │   └── Metadata (model, frame count)
        │
        ├── Action Bar
        │   ├── Download JSON
        │   ├── New Analysis
        │   └── Show/Hide Prompt
        │
        ├── Main Content (3-column layout)
        │   │
        │   ├── Left Column (2/3 width)
        │   │   ├── AnnotatedVideoCanvas.jsx
        │   │   │   ├── Canvas rendering
        │   │   │   ├── Bounding boxes (red)
        │   │   │   ├── Sensor markers (blue)
        │   │   │   ├── Captions (black overlay)
        │   │   │   ├── Overlay toggle
        │   │   │   └── Full-size preview
        │   │   │
        │   │   └── FrameTimeline.jsx
        │   │       ├── Horizontal scrollable
        │   │       ├── Thumbnail grid
        │   │       ├── Evidence badges (red)
        │   │       └── Click to select
        │   │
        │   └── Right Column (1/3 width)
        │       ├── EvidencePanel.jsx
        │       │   ├── Sensor evidence (blue)
        │       │   ├── Vision evidence (red)
        │       │   ├── Expandable details
        │       │   └── Click to highlight
        │       │
        │       ├── VerificationPanel.jsx
        │       │   ├── ✓ Verified claims (green)
        │       │   ├── ✗ Unverified (red)
        │       │   ├── ⚠ Low confidence (yellow)
        │       │   └── Overall trust score
        │       │
        │       └── CanvaReportCard.jsx
        │           ├── Score circle
        │           ├── Top 3 issues
        │           ├── Top action
        │           ├── Share button
        │           └── Download PDF


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW DIAGRAM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Video File + CSV File
        ↓
    [FormData]
        ↓
POST /api/analyze
        ↓
┌───────────────────┐
│ extractFrames()   │ → FFmpeg extracts frames at peaks/intervals
│ ├── Peak detect   │    ↓
│ └── Resize 400px  │ [frames: Array<{frame_index, ts, thumbnail_base64}>]
└───────────────────┘
        ↓
┌─────────────────────────────┐
│ analyzeFramesWithGemini()   │ → Gemini 1.5 Flash
│ ├── Send max 5 frames       │    ↓
│ └── Receive bboxes/labels   │ [frame_evidence: Array<{frame_index, labels, caption}>]
└─────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ callGeminiUnifiedAnalysis()    │ → Gemini 1.5 Pro
│ ├── Sensor summary             │    ↓
│ ├── Frame evidence             │ {air_health_score, risk_description,
│ └── Correlate data             │  evidence[], actions[], confidence}
└────────────────────────────────┘
        ↓
┌──────────────────────┐
│ verifyAIEvidence()   │ → Local deterministic checks
│ ├── Check CSV rows   │    ↓
│ └── ±10% tolerance   │ [verification: Array<{claim, verified, details}>]
└──────────────────────┘
        ↓
┌────────────────┐
│ hashPayload()  │ → MD5 hash for caching
│ └── Store in   │    ↓
│     cache      │ resultCache[id] = fullResult
└────────────────┘
        ↓
Response JSON
        ↓
AnalysisResultPage.jsx
        ↓
Visual Components Render


┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMPONENT PROPS FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

AnalysisResultPage.jsx (Parent State)
    │
    ├── State:
    │   ├── analysisData (full API response)
    │   ├── selectedFrame (0-based index)
    │   ├── showPrompt (boolean)
    │   └── overlayMode ('both' | 'vision' | 'sensor' | 'none')
    │
    └── Children:
        │
        ├── AnnotatedVideoCanvas
        │   ├── frames={analysisData.frames}
        │   ├── evidence={analysisData.evidence}
        │   ├── selectedFrame={selectedFrame}
        │   ├── onFrameSelect={setSelectedFrame}
        │   ├── overlayMode={overlayMode}
        │   └── onOverlayModeChange={setOverlayMode}
        │
        ├── FrameTimeline
        │   ├── frames={analysisData.frames}
        │   ├── selectedFrame={selectedFrame}
        │   ├── onFrameSelect={setSelectedFrame}
        │   └── evidence={analysisData.evidence}
        │
        ├── EvidencePanel
        │   ├── evidence={analysisData.evidence}
        │   ├── frames={analysisData.frames}
        │   ├── deterministicMetrics={analysisData.deterministic_metrics}
        │   └── onEvidenceClick={(idx) => {...}}
        │
        ├── VerificationPanel
        │   ├── verification={analysisData.verification}
        │   └── evidence={analysisData.evidence}
        │
        └── CanvaReportCard
            ├── score={analysisData.air_health_score}
            ├── evidence={analysisData.evidence}
            └── actions={analysisData.recommended_actions}


┌─────────────────────────────────────────────────────────────────────────────┐
│                         API RESPONSE SCHEMA                                  │
└─────────────────────────────────────────────────────────────────────────────┘

{
  "id": "abc123",                          // MD5 hash for caching
  "air_health_score": 72,                  // 0-100 score
  "risk_description": "Moderate concerns...",
  "confidence": "high",                     // high | medium | low
  "model_name": "gemini-1.5-pro",
  
  "evidence": [
    {
      "type": "sensor",                     // sensor | vision
      "message": "CO2 spiked to 1200 ppm...",
      "timestamp": "2024-01-15T10:30:00Z",
      "source_rows": [42, 43, 44],         // CSV row references
      "labels": null
    },
    {
      "type": "vision",
      "message": "Closed window detected...",
      "frame_index": 2,
      "labels": [
        { "label": "window", "score": 0.92 }
      ]
    }
  ],
  
  "recommended_actions": [
    {
      "action": "Open windows for ventilation",
      "impact": "Reduce CO2 by ~200 ppm",
      "priority": "high"
    }
  ],
  
  "frames": [
    {
      "frame_index": 0,
      "ts": "2024-01-15T10:00:00Z",
      "thumbnail_base64": "data:image/jpeg;base64,...",
      "path": "/tmp/frame_0.jpg",
      "frame_evidence": {
        "bboxes": [[0.1, 0.2, 0.3, 0.4]],  // normalized coords
        "labels": [
          { "label": "window", "score": 0.92, "bbox_index": 0 }
        ],
        "caption": "Closed window in upper right corner",
        "has_sensor_event": true
      }
    }
  ],
  
  "verification": [
    {
      "claim": "CO2 spiked to 1200 ppm at 10:30",
      "verified": true,
      "details": "Found value 1198 ppm in row 42 (within ±10%)"
    }
  ],
  
  "deterministic_metrics": {
    "co2": { "mean": 850, "median": 820, "max": 1200, "min": 400 }
  },
  
  "prompt": "You are an air quality analyst...",  // Full AI prompt
  "trace": "Analysis completed in 8.2s"
}


┌─────────────────────────────────────────────────────────────────────────────┐
│                       VISUAL OVERLAY SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

AnnotatedVideoCanvas.jsx draws overlays on HTML5 Canvas:

1. Base Image Layer
   └── frame.thumbnail_base64 drawn to canvas

2. Vision Overlays (red)
   ├── Bounding boxes (strokeRect with red)
   ├── Labels with background (fillText on red rect)
   └── Confidence scores ("window (92%)")

3. Sensor Overlays (blue)
   ├── Blue circles (arc with fill)
   └── White 'S' text (fillText)

4. Caption Overlay (black)
   ├── Semi-transparent black rect at bottom
   └── Wrapped white text (frame caption)

5. Toggle Modes:
   ├── 'both' → shows vision + sensor overlays
   ├── 'vision' → shows only red bounding boxes
   ├── 'sensor' → shows only blue markers
   └── 'none' → base image only

Drawing sequence (drawOverlays function):
   1. Check overlayMode
   2. If vision: draw bboxes → draw labels
   3. If sensor: draw blue circles → draw 'S' text
   4. Always draw caption at bottom (black bg + white text)


┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY MEASURES                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. API Key Management
   ├── Stored in .env file (not committed)
   ├── Loaded via dotenv
   └── Never exposed to frontend

2. File Upload Limits
   ├── Max file size: 100MB per file
   ├── File type validation (video/*, .csv)
   └── Multer middleware for safe uploads

3. Temp File Cleanup
   ├── Auto-delete after 60 seconds
   ├── Prevents disk bloat
   └── setTimeout cleanup in analyze route

4. Input Validation
   ├── File type checking
   ├── CSV parsing with error handling
   └── Sanitized file paths

5. CORS Configuration
   ├── Enabled for local development
   ├── Configure allowed origins for production
   └── Preflight request handling

6. Error Handling
   ├── Try-catch blocks in all async functions
   ├── Fallback to deterministic analysis
   └── User-friendly error messages


┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATIONS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. Frame Extraction
   ├── Peak-based strategy (5 frames vs fixed 10)
   ├── Resize to 400px width (reduces tokens)
   └── Base64 encoding for direct API transmission

2. API Cost Control
   ├── Max 5 frames sent to Gemini Vision
   ├── Single unified call to Gemini Pro
   └── Result caching prevents duplicate API calls

3. Caching Strategy
   ├── MD5 hash of video + CSV payload
   ├── In-memory cache (resultCache object)
   └── GET /result/:id retrieves cached results

4. Frontend Optimizations
   ├── Canvas rendering (faster than DOM overlays)
   ├── useEffect auto-scroll on frame selection
   └── Lazy loading of collapsed panels

5. Async Operations
   ├── Non-blocking file processing
   ├── Parallel frame extraction (FFmpeg batch)
   └── Async cleanup doesn't block response


┌─────────────────────────────────────────────────────────────────────────────┐
│                           FILE SIZE SUMMARY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Backend:
  server/index.js                      27 lines
  server/analyze.js                   580 lines
  server/package.json                  40 lines
  server/.env.example                   8 lines
                                      ─────────
  Total Backend:                      655 lines

Frontend:
  src/pages/AnalysisPage.jsx          355 lines (updated)
  src/pages/AnalysisResultPage.jsx    250 lines (new)
  src/components/analysis/
    AnnotatedVideoCanvas.jsx          200 lines (new)
    FrameTimeline.jsx                 120 lines (new)
    EvidencePanel.jsx                 150 lines (new)
    VerificationPanel.jsx             180 lines (new)
    CanvaReportCard.jsx               150 lines (new)
  src/App.jsx                          85 lines (updated)
                                      ─────────
  Total Frontend:                    1490 lines

Documentation:
  ANALYSIS_SETUP.md                   300 lines
  README_IMPLEMENTATION.md            250 lines
  ARCHITECTURE.md                     400 lines (this file)
                                      ─────────
  Total Documentation:                950 lines

GRAND TOTAL:                         3095 lines

Dependencies Installed:
  @google/generative-ai v0.1.3
  express v4.18.2
  fluent-ffmpeg v2.1.3
  multer v1.4.5
  cors v2.8.5
  dotenv v16.3.1
  nodemon v3.0.2 (dev)
```
