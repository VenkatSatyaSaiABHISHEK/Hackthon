// src/components/AiraSuccess.jsx

/**
 * AiraSuccess Component
 * 
 * Success state with checkmark animation and CSS confetti
 * 
 * Usage:
 * import AiraSuccess from './components/AiraSuccess';
 * 
 * <AiraSuccess message="Analysis complete!" />
 */

import React, { useEffect, useState } from 'react';
import LottieWrapper from './LottieWrapper';
import { CheckCircle2 } from 'lucide-react';

export default function AiraSuccess({ message = 'Success!', className = '' }) {
  const [showConfetti, setShowConfetti] = useState(true);

  // Success checkmark Lottie (placeholder)
  const successAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: []
  };

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative flex flex-col items-center gap-4 ${className}`}>
      {/* CSS Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                '--delay': `${i * 0.1}s`,
                '--left': `${Math.random() * 100}%`,
                '--rotation': `${Math.random() * 360}deg`,
                '--color': ['#0F9D58', '#4285F4', '#F4B400', '#DB4437'][i % 4],
              }}
            />
          ))}
        </div>
      )}

      {/* Success icon */}
      <div className="relative z-10">
        <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
            <LottieWrapper
              src={successAnimation}
              width={120}
              height={120}
              loop={false}
              autoplay={true}
              fallbackIcon={CheckCircle2}
            />
          </div>
        </div>
        
        {/* Success badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-md">
          ✓ Done
        </div>
      </div>

      {/* Message */}
      <p className="text-lg font-semibold text-neutral-900 text-center animate-fade-in">
        {message}
      </p>

      {/* Inline CSS for confetti animation */}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--color);
          top: -10%;
          left: var(--left);
          opacity: 0;
          animation: confetti-fall 3s ease-out forwards;
          animation-delay: var(--delay);
          transform: rotate(var(--rotation));
        }

        @keyframes confetti-fall {
          0% {
            top: -10%;
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
