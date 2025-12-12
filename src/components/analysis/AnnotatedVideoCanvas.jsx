// src/components/analysis/AnnotatedVideoCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff, Maximize2 } from 'lucide-react';

export default function AnnotatedVideoCanvas({ frames, evidence, selectedFrame, onFrameSelect, overlayMode, onOverlayModeChange }) {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoveredBox, setHoveredBox] = useState(null);

  useEffect(() => {
    drawFrame();
  }, [selectedFrame, overlayMode, imageLoaded]);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const frame = frames[selectedFrame];
    if (!frame) return;

    // Load and draw image
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw overlays
      if (overlayMode !== 'none') {
        drawOverlays(ctx, canvas.width, canvas.height);
      }

      setImageLoaded(true);
    };
    img.src = frame.thumbnail_base64;
  };

  const drawOverlays = (ctx, width, height) => {
    // Find evidence for this frame
    const frameEvidence = evidence.filter(ev => 
      ev.frame_index === selectedFrame || 
      (overlayMode === 'both' && ev.type === 'sensor')
    );

    frameEvidence.forEach((ev, idx) => {
      if (ev.type === 'vision' && ev.bboxes) {
        // Draw bounding boxes
        ev.bboxes.forEach(bbox => {
          const x = bbox.x * width;
          const y = bbox.y * height;
          const w = bbox.w * width;
          const h = bbox.h * height;

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // Label background
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.fillRect(x, y - 25, w, 25);

          // Label text
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px sans-serif';
          ctx.fillText(`${bbox.label} (${(bbox.score * 100).toFixed(0)}%)`, x + 5, y - 8);
        });
      }

      if (ev.type === 'sensor') {
        // Draw sensor event marker (pulsing dot)
        const markerX = width * 0.1 + (idx * 30);
        const markerY = 30;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.beginPath();
        ctx.arc(markerX, markerY, 12, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', markerX, markerY + 4);
      }
    });

    // Draw frame caption if available
    const frameEv = evidence.find(ev => ev.frame_index === selectedFrame && ev.caption);
    if (frameEv) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, height - 60, width, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      const lines = wrapText(ctx, frameEv.caption, width - 20);
      lines.forEach((line, i) => {
        ctx.fillText(line, 10, height - 40 + (i * 20));
      });
    }
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);
    return lines;
  };

  const toggleOverlay = (mode) => {
    const modes = ['both', 'vision', 'sensor', 'none'];
    const currentIndex = modes.indexOf(overlayMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    onOverlayModeChange(nextMode);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Controls */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between">
        <div className="text-white">
          <h3 className="font-bold text-lg">Frame {selectedFrame + 1} of {frames.length}</h3>
          <p className="text-sm text-gray-300">{frames[selectedFrame]?.ts}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleOverlay}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {overlayMode === 'none' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Overlays: {overlayMode}
          </button>
          <button
            onClick={() => window.open(frames[selectedFrame]?.thumbnail_base64, '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Full Size
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{ maxHeight: '600px' }}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">Vision Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Sensor Event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded"></div>
            <span className="text-gray-700">AI Caption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
