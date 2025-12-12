// src/components/LottieWrapper.jsx

/**
 * LottieWrapper Component
 * 
 * A resilient wrapper for Lottie animations with fallback support
 * 
 * Usage:
 * import LottieWrapper from './components/LottieWrapper';
 * 
 * <LottieWrapper 
 *   src={animationData} 
 *   loop={true} 
 *   autoplay={true} 
 *   width={100} 
 *   height={100} 
 * />
 */

import React, { useState } from 'react';
import Lottie from 'lottie-react';
import { Loader2 } from 'lucide-react';

export default function LottieWrapper({ 
  src, 
  loop = true, 
  autoplay = true, 
  width = 200, 
  height = 200,
  className = '',
  fallbackIcon: FallbackIcon = Loader2,
}) {
  const [hasError, setHasError] = useState(false);

  // Fallback SVG if Lottie fails
  if (hasError || !src) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <FallbackIcon 
          className="text-primary-500 animate-spin" 
          style={{ width: width / 2, height: height / 2 }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={src}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
