# 🚀 Quick Setup Guide for AirGuard AI

## Step 1: Install Dependencies

```powershell
npm install
```

This installs:
- React & React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- PapaParse (CSV parsing)
- PostCSS & Autoprefixer

## Step 2: Get Your Gemini API Key

1. Visit: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

## Step 3: Configure Environment

```powershell
# Create .env file from template
copy .env.example .env

# Edit .env and paste your API key:
# VITE_GEMINI_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important:** Never commit the `.env` file to Git!

## Step 4: Start Development Server

```powershell
npm run dev
```

You should see:
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 5: Test the App

1. **Open browser:** http://localhost:5173

2. **Upload test files:**
   - Video: Any short MP4 video of a room
   - CSV: Use the included `sample-data.csv` file

3. **Click "Analyze Room Health"**

4. **View results** - Should see:
   - Air Health Score (0-100)
   - Comfort Level
   - Risk Description
   - Recommended Actions
   - Key Evidence

## What Each File Does

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app logic + Gemini integration |
| `src/main.jsx` | React entry point |
| `src/index.css` | Tailwind CSS setup |
| `tailwind.config.js` | Tailwind configuration |
| `vite.config.js` | Vite build configuration |
| `package.json` | Dependencies and scripts |
| `.env` | API key (create this yourself) |
| `sample-data.csv` | Example sensor data for testing |

## CSV Data Format

Your CSV should have sensor readings over time:

```csv
created_at,field1,field2,field3,field4,field5
2025-12-10 10:00,35.2,45.1,22.5,65.3,45.0
```

**Column meanings:**
- `field1` = PM2.5 (µg/m³)
- `field2` = PM10 (µg/m³)
- `field3` = Temperature (°C)
- `field4` = Humidity (%)
- `field5` = Noise (dB)

Or use descriptive headers like `pm2.5`, `temperature`, `humidity`, etc.

## Troubleshooting

### "API Key Missing" message
- Check `.env` file exists in project root
- Verify key starts with `AIza`
- Restart dev server after creating `.env`

### CSV not parsing
- Ensure file is comma-separated (not semicolon)
- Check for headers in first row
- Verify numeric values (not text)

### Build errors
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## Production Build

```powershell
# Create optimized build
npm run build

# Preview production build
npm run preview
```

⚠️ **Production Warning:** Don't deploy with client-side API keys! Create a backend proxy first.

## Need Help?

- Check browser console (F12) for errors
- Review `README.md` for detailed documentation
- Gemini API docs: https://ai.google.dev/docs

---

**Ready to analyze your indoor air quality! 🌿**
