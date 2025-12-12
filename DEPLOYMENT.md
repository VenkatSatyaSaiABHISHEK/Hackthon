# Deployment Guide

## Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   vercel
   ```
   - Follow the prompts
   - First deployment will be a preview
   - Use `vercel --prod` for production deployment

4. **Set Environment Variables**
   ```powershell
   vercel env add VITE_GEMINI_API_KEY
   ```
   - Enter your Gemini API key when prompted
   - Select "Production" environment

### Option 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub, GitLab, or Bitbucket
3. **Import your repository**
   - Click "Add New" → "Project"
   - Import your Git repository
   - Or drag & drop your project folder

4. **Configure Build Settings** (auto-detected)
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_GEMINI_API_KEY` = `your-api-key-here`

6. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app.vercel.app`

---

## Deploy to Netlify (Alternative)

### Option 1: Netlify CLI

1. **Install Netlify CLI**
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login**
   ```powershell
   netlify login
   ```

3. **Deploy**
   ```powershell
   netlify deploy --prod
   ```

### Option 2: Netlify Dashboard

1. **Go to [netlify.com](https://netlify.com)**
2. **Drag & drop** your `dist` folder (after running `npm run build`)
3. **Or connect Git repository** for continuous deployment

---

## Build Locally First

Before deploying, test the production build:

```powershell
# Build the project
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` folder.

---

## Important Notes

### Environment Variables
- **VITE_GEMINI_API_KEY**: Your Google Gemini API key (required for AI analysis)
- All Vite env vars must start with `VITE_` to be exposed to the client

### Domain Setup
- After deployment, you can add a custom domain in your hosting dashboard
- Free domains: `your-app.vercel.app` or `your-app.netlify.app`

### Continuous Deployment
- Connect your Git repository for automatic deployments on push
- Vercel and Netlify both support GitHub, GitLab, and Bitbucket

---

## Quick Deploy Commands

```powershell
# Build and test locally
npm run build
npm run preview

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

---

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure `VITE_GEMINI_API_KEY` is set in deployment platform
- Review build logs in the hosting dashboard

### 404 Errors on Refresh
- Handled by `vercel.json` rewrites configuration
- Ensures React Router works correctly

### Environment Variables Not Working
- Remember: Only vars starting with `VITE_` are exposed
- Redeploy after adding new environment variables
