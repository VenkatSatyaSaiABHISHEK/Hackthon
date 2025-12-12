DEMO ASSETS FOLDER
==================

This folder contains demo assets for the AirGuard demo mode.

REQUIRED FILES:
---------------
1. demo-video.mp4
   - A sample video showing air quality monitoring
   - Format: MP4 (H.264 codec recommended)
   - Recommended size: Keep under 50MB for faster loading
   - Suggested content: Indoor/outdoor air quality monitoring footage

2. demo-data.csv
   - Sample air quality sensor data from ThingSpeak
   - Format: CSV with columns matching ThingSpeak export format
   - Should include: created_at, PM2.5, PM10, Temperature, Humidity, etc.
   - Suggested rows: 100-500 data points for meaningful analysis

HOW TO USE:
-----------
1. Place your demo-video.mp4 and demo-data.csv files in this folder
2. Start the backend server: npm start (from server/ directory)
3. Files will be accessible at:
   - http://localhost:3001/demo/demo-video.mp4
   - http://localhost:3001/demo/demo-data.csv

4. The frontend will fetch these URLs from GET /api/demo endpoint
5. When Demo Mode is enabled, the app will use these assets instead of user uploads

DEMO CREDENTIALS:
-----------------
Default ThingSpeak credentials for demo mode:
- Channel ID: 2725064
- Read API Key: OO56NIHVPTB1BSY0

Users can switch between demo and real ThingSpeak channels from the UI.

NOTE:
-----
These files are NOT committed to git (added to .gitignore).
Each developer should add their own demo assets locally.
