# 🧪 Testing Guide for AirGuard AI

## Test Scenarios

### 1. Basic CSV Parsing Test

**Expected Behavior:** CSV uploads and displays summary table

**Steps:**
1. Click "Upload Sensor CSV"
2. Select `sample-data.csv`
3. Verify CSV summary appears with:
   - Record count: 20
   - Last timestamp shown
   - Table with PM2.5, PM10, Temperature, Humidity, Noise stats

**What to Check:**
- ✅ All 5 metrics show mean/min/max/last values
- ✅ Numbers are formatted with 2 decimal places
- ✅ Table is readable and well-formatted

---

### 2. Video Upload Test

**Expected Behavior:** Video file is accepted and filename displays

**Steps:**
1. Click "Upload Room Video"
2. Select any MP4/video file
3. Verify filename appears in green box below input

**What to Check:**
- ✅ File input accepts video/* files
- ✅ Filename displays correctly
- ✅ Green success styling appears

---

### 3. Analyze Button State Test

**Expected Behavior:** Button disabled until both files uploaded

**Steps:**
1. Start with no files
   - Button should be gray/disabled
2. Upload only CSV
   - Button still disabled
3. Upload only video
   - Button still disabled  
4. Upload both files
   - Button becomes green and clickable

**What to Check:**
- ✅ Proper disabled state styling
- ✅ Cursor changes appropriately
- ✅ Hover effects only work when enabled

---

### 4. Gemini API Integration Test (with API key)

**Prerequisites:** Valid `VITE_GEMINI_API_KEY` in `.env`

**Steps:**
1. Verify AI Status shows "✓ Gemini API Connected"
2. Upload `sample-data.csv` and any video
3. Click "Analyze Room Health"
4. Wait for response (2-5 seconds)

**Expected Results:**
- ✅ Loading spinner appears during analysis
- ✅ Results section populates with:
  - Numeric score (0-100)
  - Comfort level (low/medium/high)
  - Risk description (1-2 sentences)
  - 3+ recommended actions
  - Evidence items (if provided by Gemini)

**Character Changes:**
- Score 75-100: 😊 Green "Great news!"
- Score 50-74: 😐 Amber "Moderate quality"
- Score 0-49: 😟 Red "I'm concerned"

---

### 5. API Error Handling Test (without API key)

**Setup:** Remove or rename `.env` file

**Steps:**
1. Restart dev server
2. Verify AI Status shows "⚠ API Key Missing"
3. Upload both files
4. Click "Analyze Room Health"

**Expected Results:**
- ✅ Score shows "⚠️" instead of number
- ✅ Character shows ⚠️ warning emoji
- ✅ Risk description explains the error
- ✅ Recommended actions suggest fixing API key
- ✅ No JavaScript console errors

---

### 6. CSV Column Detection Test

**Create test files with different headers:**

**Test A: Descriptive headers**
```csv
timestamp,pm2.5,pm10,temperature,humidity,noise
2025-12-10 10:00,25.3,35.2,22.5,55.2,42.0
2025-12-10 10:15,26.1,36.8,22.7,56.1,43.2
```

**Test B: Generic field names**
```csv
created_at,field1,field2,field3,field4,field5
2025-12-10 10:00,30.2,40.1,24.0,60.5,45.0
2025-12-10 10:15,31.5,41.3,24.2,61.2,46.1
```

**Test C: Mixed/unusual names**
```csv
time,pm_2.5,pm_10,temp,hum,sound
2025-12-10 10:00,35.0,45.0,23.0,65.0,50.0
2025-12-10 10:15,36.2,46.1,23.2,66.1,51.2
```

**Expected:**
- ✅ All three variations parse correctly
- ✅ Metrics mapped to correct columns
- ✅ Summary table shows accurate statistics

---

### 7. Invalid CSV Handling Test

**Test files to try:**

**Semicolon-separated:**
```csv
created_at;field1;field2
2025-12-10;25;35
```
*Expected: May fail - should show alert*

**Missing data:**
```csv
created_at,field1,field2
2025-12-10 10:00,,
2025-12-10 10:15,abc,xyz
```
*Expected: Skips invalid rows, shows valid data only*

**Empty file:**
```csv

```
*Expected: Should handle gracefully or show error*

---

### 8. Character State Transition Test

**Create three test CSVs:**

**Good air quality (low PM2.5):**
```csv
created_at,field1,field2,field3,field4
2025-12-10 10:00,8.5,15.2,22.0,50.0
2025-12-10 10:15,9.1,16.1,22.2,51.0
```
*Expected: Score 75+, 😊 happy character*

**Moderate air quality:**
```csv
created_at,field1,field2,field3,field4
2025-12-10 10:00,35.0,45.0,24.0,65.0
2025-12-10 10:15,36.0,46.0,24.2,66.0
```
*Expected: Score 50-74, 😐 neutral character*

**Poor air quality (high PM2.5):**
```csv
created_at,field1,field2,field3,field4
2025-12-10 10:00,85.5,120.2,28.0,80.0
2025-12-10 10:15,87.1,122.1,28.5,81.0
```
*Expected: Score <50, 😟 worried character*

---

### 9. Responsive Design Test

**Test on different screen sizes:**

1. **Desktop (1920x1080):**
   - ✅ 3-column layout (character | uploads | results)
   - ✅ All cards visible side-by-side
   
2. **Tablet (768x1024):**
   - ✅ Stacked layout for smaller screens
   - ✅ Upload cards remain 2-column grid
   
3. **Mobile (375x667):**
   - ✅ Single column layout
   - ✅ Upload cards stack vertically
   - ✅ Touch-friendly button sizes

---

### 10. Network Error Simulation

**Using Browser DevTools:**

1. Open DevTools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Try to analyze
5. Re-enable network

**Expected:**
- ✅ Shows error message about network failure
- ✅ Doesn't crash the app
- ✅ Can retry after network restored

---

## Performance Checks

### Load Time
- ✅ Initial page load < 2 seconds
- ✅ CSV parsing < 500ms for 1000 rows
- ✅ Gemini API response < 10 seconds

### File Size Limits
- ✅ CSV files up to 5MB parse correctly
- ✅ Video files accepted (not processed yet)

### Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## Console Checks

**There should be NO errors for:**
- ✅ Normal operation
- ✅ CSV upload
- ✅ Successful analysis

**Expected warnings/logs:**
- `"Analyze clicked"` - when analysis starts
- Gemini API responses in network tab
- CSV parse progress (if any)

**Red flags (should NOT appear):**
- ❌ `Cannot read property of undefined`
- ❌ `CORS errors` (unless API key issue)
- ❌ React rendering errors
- ❌ Tailwind CSS not loading

---

## API Key Security Test

**Check for exposure:**

1. Open DevTools → Network tab
2. Run analysis
3. Find Gemini API request
4. Check request URL

**Expected:**
- ⚠️ API key IS visible in URL (client-side limitation)
- ⚠️ This is why we warn against production use

**Verify warnings exist:**
- ✅ Code comments warn about security
- ✅ README mentions backend proxy needed
- ✅ `.env` in `.gitignore`

---

## Automated Test Checklist

Run through this checklist for each code change:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] No console errors on page load
- [ ] AI Status indicator shows correct state
- [ ] CSV upload triggers summary display
- [ ] Both files required before analyze enabled
- [ ] Analysis completes with valid response
- [ ] Character emoji changes based on score
- [ ] Mobile layout renders correctly
- [ ] All color schemes display properly

---

## Sample Testing Data

### Good Air Quality CSV
Use when testing positive results:
```csv
created_at,field1,field2,field3,field4,field5
2025-12-10 10:00,8.2,12.5,21.5,48.0,35.0
2025-12-10 10:15,9.1,13.2,21.8,49.2,36.1
2025-12-10 10:30,7.8,11.9,22.0,47.5,34.8
```

### Poor Air Quality CSV  
Use when testing negative results:
```csv
created_at,field1,field2,field3,field4,field5
2025-12-10 10:00,125.3,180.2,30.5,85.2,75.0
2025-12-10 10:15,128.7,182.8,31.1,86.5,76.3
2025-12-10 10:30,130.2,185.5,31.8,87.8,77.8
```

---

**Happy Testing! 🧪**
