// src/pages/Login.jsx

/**
 * Login Page
 * Simple email-only authentication for demo
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wind, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const placeholderAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 90,
    w: 400,
    h: 400,
    nm: "Login",
    ddd: 0,
    assets: [],
    layers: []
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      login(email);
      setIsLoading(false);
      
      // Check if onboarding completed
      const onboardingCompleted = localStorage.getItem('airguard_onboarding_completed');
      if (onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }, 800);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      loginDemo();
      setIsLoading(false);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding & Animation */}
        <div className="hidden md:block">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
              <Wind className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent mb-4">
              AirGuard AI
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Indoor Air Health Analysis Platform
            </p>
            
            <div className="w-80 h-80 mx-auto">
              <Lottie 
                animationData={placeholderAnimation}
                loop={true}
                className="w-full h-full opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Mobile branding */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
              <Wind className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent">
              AirGuard AI
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome Back</h2>
          <p className="text-neutral-600 mb-8">Sign in to access your air quality dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  aria-label="Email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-gradient-to-r from-primary-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Sign in"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">Or try demo mode</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full mt-6 border-2 border-neutral-300 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Quick demo access"
          >
            <Sparkles className="w-5 h-5 text-primary-600" />
            Quick Demo Access
          </button>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Demo mode uses sample data for testing
          </p>
        </div>
      </div>
    </div>
  );
}
