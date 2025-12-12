// src/context/AuthContext.jsx

/**
 * Authentication Context
 * 
 * Minimal demo authentication for hackathon
 * 🔴 TODO: Replace with real auth (Firebase, Auth0, NextAuth, etc.)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER } from '../constants/demo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('airguard_user');
    const storedToken = localStorage.getItem('airguard_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (email) => {
    // Demo login - accepts any email
    const demoUser = {
      email,
      name: email.split('@')[0],
      token: `TOKEN_${Date.now()}`,
    };
    
    localStorage.setItem('airguard_user', JSON.stringify(demoUser));
    localStorage.setItem('airguard_token', demoUser.token);
    
    setUser(demoUser);
    return demoUser;
  };

  const loginDemo = () => {
    localStorage.setItem('airguard_user', JSON.stringify(DEMO_USER));
    localStorage.setItem('airguard_token', DEMO_USER.token);
    
    setUser(DEMO_USER);
    return DEMO_USER;
  };

  const logout = () => {
    localStorage.removeItem('airguard_user');
    localStorage.removeItem('airguard_token');
    localStorage.removeItem('airguard_onboarding_completed');
    
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    loginDemo,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
