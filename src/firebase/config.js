// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "khub-bdabd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "khub-bdabd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "khub-bdabd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "401713212611",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:401713212611:web:d569d4a07fac761fb24676",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LTK6TY8YX1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save user to localStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    };
    
    localStorage.setItem('airguard_user', JSON.stringify(userData));
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('airguard_user');
    localStorage.removeItem('airguard_user_thingspeak');
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('airguard_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const getThingSpeakCredentials = () => {
  const credsStr = localStorage.getItem('airguard_user_thingspeak');
  if (credsStr) {
    try {
      return JSON.parse(credsStr);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const saveThingSpeakCredentials = (channelId, apiKey) => {
  const credentials = {
    channelId,
    apiKey,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('airguard_user_thingspeak', JSON.stringify(credentials));
  return credentials;
};

export { onAuthStateChanged };
export default app;
