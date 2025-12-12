// src/components/AiraAnalyzing.jsx

/**
 * AiraAnalyzing Component
 * 
 * Shows Aira AI analyzing state with pulsing animation
 * 
 * Usage:
 * import AiraAnalyzing from './components/AiraAnalyzing';
 * 
 * {isAnalyzing && <AiraAnalyzing size="md" />}
 * 
 * Size options: 'sm' (80px), 'md' (120px), 'lg' (160px)
 */

import React from 'react';
import LottieWrapper from './LottieWrapper';
import { Brain, Sparkles } from 'lucide-react';

export default function AiraAnalyzing({ size = 'md', className = '' }) {
  const sizes = {
    sm: { container: 80, icon: 40 },
    md: { container: 120, icon: 60 },
    lg: { container: 160, icon: 80 },
  };

  const dimensions = sizes[size] || sizes.md;

  // Placeholder Lottie animation (replace with real Lottie JSON)
  const analyzingAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Analyzing",
    ddd: 0,
    assets: [],
    layers: []
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Pulsing border container */}
      <div 
        className="relative rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-1 animate-pulse-slow"
        style={{ width: dimensions.container + 8, height: dimensions.container + 8 }}
      >
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          <LottieWrapper
            src={analyzingAnimation}
            width={dimensions.container}
            height={dimensions.container}
            loop={true}
            autoplay={true}
            fallbackIcon={Brain}
          />
        </div>
        
        {/* Sparkle indicator */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
          Aira is analyzing your room...
        </p>
        <p className="text-xs text-neutral-500 mt-1">This may take a few moments</p>
      </div>
    </div>
  );
}
