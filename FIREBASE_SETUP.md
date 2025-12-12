# 🔐 Firebase Authentication Setup Guide

## ✅ **Completed Features**

All authentication pages are now integrated:

1. ✅ **SplashScreen.jsx** - 10-second loading with auto-redirect
2. ✅ **LoginPage.jsx** - Google Sign-In with Firebase
3. ✅ **ThingSpeakSetupPage.jsx** - First-time IoT configuration
4. ✅ **App.jsx** - Updated with new auth flow
5. ✅ **firebase/config.js** - Firebase initialization

---

## 📦 **Step 1: Install Firebase**

```powershell
npm install firebase
```

---

## 🔥 **Step 2: Create Firebase Project**

### A. Go to Firebase Console
Visit: https://console.firebase.google.com/

### B. Create New Project
1. Click "Add project"
2. Enter name: **AirGuard AI**
3. Disable Google Analytics (optional)
4. Click "Create project"

### C. Enable Google Authentication
1. In Firebase Console → **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click "Google" → Enable → Save

### D. Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click **Web icon** (</>)
4. Register app name: "AirGuard Web"
5. Copy the `firebaseConfig` object

---

## 🔑 **Step 3: Configure Environment Variables**

Create `.env` file in project root:

```bash
# Copy .env.example to .env
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=airguard-ai-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=airguard-ai-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=airguard-ai-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

---

## 🚀 **Step 4: Test Authentication Flow**

### Start the app:
```powershell
npm run dev
```

### Test Flow:

**1. Splash Screen (`/`)**
- Opens automatically
- Shows for 10 seconds
- Auto-redirects to login

**2. Login Page (`/login`)**
- Click "Sign in with Google"
- Select Google account
- Grant permissions

**3. ThingSpeak Setup (`/setup`)**
- Enter Channel ID (e.g., `2723363`)
- Enter Read API Key
- Click "Save & Continue"

**4. Dashboard (`/dashboard`)**
- Auto-loads ThingSpeak data
- No manual input needed!

---

## 🗺️ **Complete User Journey**

```
App Start
   ↓
Splash Screen (10s)
   ↓
Not Logged In? → Login Page (Google Sign-In)
   ↓
First Time? → ThingSpeak Setup Page
   ↓
Dashboard (Auto-loads IoT data)
```

---

## 📁 **Files Created**

```
src/
├── firebase/
│   └── config.js                    # Firebase initialization
├── pages/
│   ├── SplashScreen.jsx             # 10-second loading screen
│   ├── LoginPage.jsx                # Google authentication
│   └── ThingSpeakSetupPage.jsx      # IoT configuration
└── App.jsx                          # Updated with new routes
```

---

## 🎨 **UI Features**

### Splash Screen:
- ✅ Animated floating particles
- ✅ Breathing animation
- ✅ Fade in/out transitions
- ✅ 10-second auto-redirect

### Login Page:
- ✅ Glassmorphism design
- ✅ Google official branding
- ✅ Animated background elements
- ✅ Error handling

### ThingSpeak Setup:
- ✅ Clean form with validation
- ✅ Help text & examples
- ✅ Skip option
- ✅ Success toast

---

## 🔒 **Security Features**

1. **Firebase Auth** - Secure Google OAuth
2. **localStorage** - User session persistence
3. **Auto-redirect** - Prevents unauthorized access
4. **Credential validation** - Input sanitization

---

## 🐛 **Troubleshooting**

### Issue: "Firebase not defined"
**Solution:** Run `npm install firebase`

### Issue: "Auth domain not whitelisted"
**Solution:** 
1. Go to Firebase Console → Authentication
2. Click "Settings" tab
3. Add `localhost:5174` to authorized domains

### Issue: "Popup blocked"
**Solution:** 
- Allow popups for localhost
- Or use redirect method (uncomment in `firebase/config.js`)

### Issue: White screen on load
**Solution:** 
- Check browser console (F12)
- Verify `.env` file exists and has valid Firebase credentials

---

## ✅ **Success Checklist**

- [ ] Firebase project created
- [ ] Google authentication enabled
- [ ] Firebase npm package installed
- [ ] `.env` file configured with Firebase credentials
- [ ] App starts without errors
- [ ] Splash screen shows for 10 seconds
- [ ] Google sign-in works
- [ ] ThingSpeak setup saves data
- [ ] Dashboard loads automatically

---

## 🎯 **Next Steps**

1. **Test the full flow** from splash → login → setup → dashboard
2. **Customize Firebase** (optional):
   - Add email/password login
   - Enable Firestore for cloud storage
   - Add user profile page
3. **Style adjustments** - Modify colors/animations as needed

---

## 📞 **Need Help?**

Check browser console (F12) for detailed error messages.

**Common Errors:**
- ❌ `Firebase: Error (auth/unauthorized-domain)` → Add localhost to authorized domains
- ❌ `Module not found: firebase` → Run `npm install firebase`
- ❌ `Invalid API key` → Check `.env` file has correct Firebase config

---

**🎉 Authentication System Complete!**

All pages are ready. Just add Firebase credentials and test!
