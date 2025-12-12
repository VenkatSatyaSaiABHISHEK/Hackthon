// src/components/analysis/FrameTimeline.jsx
import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FrameTimeline({ frames, selectedFrame, onFrameSelect, evidence }) {
  const timelineRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to selected frame
    if (timelineRef.current) {
      const selectedEl = timelineRef.current.children[selectedFrame];
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedFrame]);

  const hasEvidence = (frameIndex) => {
    return evidence.some(ev => ev.frame_index === frameIndex);
  };

  const scrollTimeline = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = 200;
      timelineRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Frame Timeline</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scrollTimeline('left')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scrollTimeline('right')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {frames.map((frame, idx) => (
          <button
            key={idx}
            onClick={() => onFrameSelect(idx)}
            className={`relative flex-shrink-0 w-32 rounded-lg overflow-hidden transition-all ${
              selectedFrame === idx
                ? 'ring-4 ring-blue-500 scale-105 shadow-xl'
                : 'hover:ring-2 hover:ring-blue-300 hover:scale-102'
            }`}
          >
            {/* Thumbnail */}
            <img
              src={frame.thumbnail_base64}
              alt={`Frame ${idx + 1}`}
              className="w-full h-20 object-cover"
            />

            {/* Evidence Badge */}
            {hasEvidence(idx) && (
              <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}

            {/* Frame Number */}
            <div className={`p-2 text-center ${
              selectedFrame === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              <div className="text-xs font-semibold">Frame {idx + 1}</div>
              <div className="text-xs opacity-75">
                {new Date(frame.ts).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        Click any frame to view details • Frames with evidence marked with red badge
      </div>
    </div>
  );
}
