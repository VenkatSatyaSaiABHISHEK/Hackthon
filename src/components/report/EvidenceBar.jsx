// File: src/components/report/EvidenceBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EvidenceBar({ evidence, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const scrollContainerRef = useRef(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">No evidence points available</p>
      </div>
    );
  }

  const handleChipClick = (index, item) => {
    setActiveIndex(index);
    if (onSelect) {
      onSelect(item, index);
    }
  };

  const handleKeyDown = (e, index, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChipClick(index, item);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % evidence.length;
      document.getElementById(`evidence-chip-${nextIndex}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + evidence.length) % evidence.length;
      document.getElementById(`evidence-chip-${prevIndex}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      document.getElementById(`evidence-chip-0`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      document.getElementById(`evidence-chip-${evidence.length - 1}`)?.focus();
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center shadow">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Evidence Timeline</h3>
          <p className="text-xs text-neutral-600">{evidence.length} data points identified</p>
        </div>
      </div>

      <div className="relative">
        {/* Scroll buttons */}
        {evidence.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-neutral-700" />
            </button>
          </>
        )}

        {/* Evidence chips container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 px-10 scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-cyan-100"
          role="list"
          aria-label="Evidence points"
        >
          {evidence.map((item, index) => {
            const isActive = activeIndex === index;
            const evidenceText = typeof item === 'string' ? item : item.description || item.text || `Evidence ${index + 1}`;
            const timestamp = typeof item === 'object' ? item.timestamp || item.time : null;

            return (
              <button
                key={index}
                id={`evidence-chip-${index}`}
                onClick={() => handleChipClick(index, item)}
                onKeyDown={(e) => handleKeyDown(e, index, item)}
                className={`
                  flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all duration-200
                  focus:outline-none focus:ring-4 focus:ring-cyan-300
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-700 text-white shadow-lg scale-105'
                    : 'bg-white border-cyan-300 text-neutral-800 hover:border-cyan-500 hover:shadow-md hover:scale-102'
                  }
                `}
                role="listitem"
                aria-pressed={isActive}
                tabIndex={0}
              >
                <div className="flex flex-col items-start gap-1 min-w-[160px] max-w-[240px]">
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-cyan-600'}`} />
                    <span className={`text-xs font-semibold ${isActive ? 'text-cyan-100' : 'text-cyan-700'}`}>
                      Evidence #{index + 1}
                    </span>
                  </div>
                  <p className={`text-sm font-medium leading-snug text-left line-clamp-2 ${isActive ? 'text-white' : 'text-neutral-800'}`}>
                    {evidenceText}
                  </p>
                  {timestamp && (
                    <span className={`text-xs font-mono ${isActive ? 'text-cyan-200' : 'text-neutral-500'}`}>
                      {timestamp}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active evidence detail */}
      {activeIndex !== null && (
        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-cyan-300 shadow-sm">
          <p className="text-xs font-semibold text-cyan-700 mb-1">Selected Evidence:</p>
          <p className="text-sm text-neutral-800">
            {typeof evidence[activeIndex] === 'string' 
              ? evidence[activeIndex] 
              : evidence[activeIndex]?.description || evidence[activeIndex]?.text || `Evidence point ${activeIndex + 1}`
            }
          </p>
          {typeof evidence[activeIndex] === 'object' && evidence[activeIndex].timestamp && (
            <p className="text-xs text-neutral-500 mt-2 font-mono">
              Timestamp: {evidence[activeIndex].timestamp}
            </p>
          )}
        </div>
      )}

      {/* Keyboard navigation help */}
      <div className="mt-4 p-3 bg-cyan-100 rounded-lg border border-cyan-300">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold">Keyboard:</span> Arrow keys to navigate, Enter/Space to select, Home/End to jump
        </p>
      </div>
    </div>
  );
}
