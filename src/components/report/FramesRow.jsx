// File: src/components/report/FramesRow.jsx

import React, { useState } from 'react';
import { Film, Clock, Image as ImageIcon, PlayCircle } from 'lucide-react';

export default function FramesRow({ frames, onSelectFrame }) {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(null);

  if (!frames || frames.length === 0) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Video Analysis</h3>
            <p className="text-xs text-neutral-600">No frames available</p>
          </div>
        </div>
        <div className="p-8 bg-white rounded-lg border-2 border-dashed border-purple-300 flex flex-col items-center justify-center">
          <ImageIcon className="w-12 h-12 text-purple-400 mb-3" />
          <p className="text-sm text-neutral-600">No video frames captured for this analysis</p>
        </div>
      </div>
    );
  }

  const displayFrames = frames.slice(0, 3);

  const handleFrameClick = (frame, index) => {
    setSelectedFrameIndex(index);
    if (onSelectFrame && frame.timestamp) {
      onSelectFrame(frame.timestamp);
    }
  };

  const handleKeyDown = (e, frame, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFrameClick(frame, index);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Video Analysis</h3>
          <p className="text-xs text-neutral-600">{frames.length} frame{frames.length !== 1 ? 's' : ''} captured</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayFrames.map((frame, index) => {
          const isSelected = selectedFrameIndex === index;
          const imageUrl = frame.url || frame.thumbnail || frame.image || '/placeholder-frame.jpg';
          const caption = frame.caption || frame.description || frame.text || `Frame ${index + 1}`;
          const timestamp = frame.timestamp || frame.time || null;

          return (
            <button
              key={index}
              onClick={() => handleFrameClick(frame, index)}
              onKeyDown={(e) => handleKeyDown(e, frame, index)}
              className={`
                group relative bg-white rounded-lg overflow-hidden border-2 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-purple-300
                ${isSelected
                  ? 'border-purple-600 shadow-xl scale-105 ring-4 ring-purple-200'
                  : 'border-purple-300 hover:border-purple-500 hover:shadow-lg hover:scale-102'
                }
              `}
              aria-label={`Video frame ${index + 1}: ${caption}`}
            >
              {/* Thumbnail image */}
              <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Frame ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23e5e7eb" width="400" height="225"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                {/* Play icon overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                </div>

                {/* Frame number badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                  Frame {index + 1}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Caption and timestamp */}
              <div className="p-4">
                <p className={`text-sm font-medium leading-snug mb-2 line-clamp-2 text-left ${isSelected ? 'text-purple-900' : 'text-neutral-800'}`}>
                  {caption}
                </p>
                
                {timestamp && (
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">{timestamp}</span>
                  </div>
                )}
              </div>

              {/* Click hint */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-200 ${isSelected ? 'bg-purple-600' : 'bg-transparent group-hover:bg-purple-400'}`} />
            </button>
          );
        })}
      </div>

      {/* More frames indicator */}
      {frames.length > 3 && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-xs text-neutral-600 text-center">
            Showing 3 of {frames.length} frames
            <span className="text-purple-600 font-semibold ml-1">• {frames.length - 3} more available</span>
          </p>
        </div>
      )}

      {/* Selected frame detail */}
      {selectedFrameIndex !== null && (
        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-600" />
            <p className="text-xs font-semibold text-purple-700">Selected Frame:</p>
          </div>
          <p className="text-sm text-neutral-800 mb-2">
            {displayFrames[selectedFrameIndex].caption || displayFrames[selectedFrameIndex].description || `Frame ${selectedFrameIndex + 1}`}
          </p>
          {displayFrames[selectedFrameIndex].timestamp && (
            <p className="text-xs text-neutral-500 font-mono">
              Timeline: {displayFrames[selectedFrameIndex].timestamp}
            </p>
          )}
        </div>
      )}

      {/* Interaction hint */}
      <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-300">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold">Click a frame</span> to highlight its timestamp on the charts below
        </p>
      </div>
    </div>
  );
}
