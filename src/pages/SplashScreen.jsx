// Splash Screen - Shows for 10 seconds on app launch
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Leaf, Droplets } from 'lucide-react';
import { getCurrentUser, getThingSpeakCredentials } from '../firebase/config';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out at 9 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 9000);

    // Navigate after 10 seconds
    const navTimer = setTimeout(() => {
      const user = getCurrentUser();
      const thingspeak = getThingSpeakCredentials();

      if (user) {
        // User is logged in
        if (thingspeak) {
          // Has ThingSpeak config - go to home
          navigate('/home');
        } else {
          // No ThingSpeak - go to setup
          navigate('/setup');
        }
      } else {
        // Not logged in - go to login
        navigate('/login');
      }
    }, 10000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center animate-fade-in">
        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Floating particles animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute animate-float-slow">
              <Droplets className="w-8 h-8 text-white/30" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute animate-float-slow" style={{ left: '60px', top: '-20px' }}>
              <Leaf className="w-6 h-6 text-white/40" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute animate-float-slow" style={{ right: '60px', top: '-20px' }}>
              <Wind className="w-7 h-7 text-white/35" style={{ animationDelay: '2s' }} />
            </div>
          </div>

          {/* Main Logo */}
          <div className="relative bg-white/10 backdrop-blur-md w-32 h-32 rounded-3xl mx-auto flex items-center justify-center shadow-2xl border border-white/20 animate-pulse-slow">
            <Wind className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight animate-slide-up">
          AirGuard AI
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-white/90 mb-8 font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Your Personal AI for Indoor Air Health
        </p>

        {/* Breathing Animation */}
        <div className="flex justify-center items-center space-x-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-3 h-3 bg-white rounded-full animate-breath" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-breath" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-breath" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Loading text */}
        <p className="mt-8 text-white/70 text-sm animate-pulse">
          Initializing AI systems...
        </p>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes breath {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out backwards;
        }
        
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        
        .animate-breath {
          animation: breath 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
