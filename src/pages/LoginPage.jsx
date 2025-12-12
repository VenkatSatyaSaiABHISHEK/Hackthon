// Login Page - Google Authentication
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Leaf, Cloud, Sparkles, Loader2 } from 'lucide-react';
import { signInWithGoogle, getCurrentUser, getThingSpeakCredentials } from '../firebase/config';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const user = getCurrentUser();
    if (user) {
      const thingspeak = getThingSpeakCredentials();
      if (thingspeak) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    }
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    const result = await signInWithGoogle();

    if (result.success) {
      // Check if ThingSpeak credentials exist
      const thingspeak = getThingSpeakCredentials();
      
      if (thingspeak) {
        // User has credentials - go to home
        navigate('/home');
      } else {
        // First time user - go to setup
        navigate('/setup');
      }
    } else {
      setError(result.error || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Cloud className="absolute top-20 left-10 w-24 h-24 text-sky-200/30 animate-float" style={{ animationDelay: '0s' }} />
        <Leaf className="absolute top-40 right-20 w-16 h-16 text-emerald-200/40 animate-float" style={{ animationDelay: '1s' }} />
        <Wind className="absolute bottom-32 left-1/4 w-20 h-20 text-cyan-200/30 animate-float" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute bottom-20 right-1/3 w-12 h-12 text-blue-200/40 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/50">
          {/* Logo Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                <Wind className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3">
            Welcome to AirGuard AI
          </h1>

          {/* Subtitle */}
          <p className="text-center text-neutral-600 mb-8 text-sm sm:text-base">
            Analyze, Predict & Improve Your Indoor Air Health
          </p>

          {/* Lottie Animation Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-32">
              {/* Animated breathing illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full animate-breath-large"></div>
                <div className="absolute w-16 h-16 bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 rounded-full animate-breath-medium"></div>
                <div className="absolute w-8 h-8 bg-gradient-to-br from-emerald-400/40 to-cyan-400/40 rounded-full animate-breath-small"></div>
              </div>
              <Leaf className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                {/* Google Logo SVG */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-base">Sign in with Google</span>
              </>
            )}
          </button>

          {/* Additional Info */}
          <p className="mt-6 text-center text-xs text-neutral-500">
            By signing in, you agree to use AirGuard AI's services to improve your indoor air quality.
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Powered by AI • Secured by Firebase
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes breath-large {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.3); opacity: 0.4; }
        }
        
        @keyframes breath-medium {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        
        @keyframes breath-small {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-breath-large {
          animation: breath-large 4s ease-in-out infinite;
        }
        
        .animate-breath-medium {
          animation: breath-medium 4s ease-in-out infinite 0.5s;
        }
        
        .animate-breath-small {
          animation: breath-small 4s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}
