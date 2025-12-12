// src/components/QRScannerPlaceholder.jsx

/**
 * QR Scanner Placeholder Component
 * 
 * TODO: Install QR scanning library
 * npm install react-qr-reader
 * OR
 * npm install html5-qrcode
 * 
 * Implementation guide for react-qr-reader:
 * import { QrReader } from 'react-qr-reader';
 * 
 * <QrReader
 *   onResult={(result, error) => {
 *     if (result) {
 *       handleScan(result?.text);
 *     }
 *   }}
 *   constraints={{ facingMode: 'environment' }}
 * />
 */

import React, { useState } from 'react';
import { Camera, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';

export default function QRScannerPlaceholder({ onScan, className = '' }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState(null);

  const handleStartScan = () => {
    setIsScanning(true);
    setError('');
    
    // TODO: Initialize QR scanner
    // Example with react-qr-reader:
    // setShowScanner(true);
    
    // Placeholder message
    setError('QR scanner not implemented. Install react-qr-reader library.');
  };

  const handleScanResult = (text) => {
    try {
      const data = JSON.parse(text);
      
      if (data.type === 'airguard_channel') {
        setScannedData(data);
        setIsScanning(false);
        
        if (onScan) {
          onScan(data);
        }
      } else {
        setError('Invalid QR code format');
      }
    } catch (err) {
      setError('Failed to parse QR code data');
    }
  };

  return (
    <div className={`bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-primary-600" />
        Scan QR Code
      </h3>

      {!isScanning && !scannedData && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-700 font-medium mb-2">
            Scan a ThingSpeak Channel QR Code
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Quickly connect to a pre-configured channel
          </p>
          <button
            onClick={handleStartScan}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
          >
            <Camera className="w-5 h-5" />
            Start Scanning
          </button>
        </div>
      )}

      {isScanning && (
        <div className="relative">
          {/* Placeholder scanner UI */}
          <div className="aspect-square bg-neutral-900 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-teal-500/20" />
            
            {/* Scanning frame */}
            <div className="relative w-64 h-64 border-4 border-primary-500 rounded-xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
              
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500 animate-pulse" style={{ animation: 'scan 2s ease-in-out infinite' }} />
            </div>
          </div>

          <button
            onClick={() => setIsScanning(false)}
            className="mt-4 w-full px-4 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel Scanning
          </button>

          <style>{`
            @keyframes scan {
              0%, 100% { top: 0; }
              50% { top: calc(100% - 4px); }
            }
          `}</style>
        </div>
      )}

      {scannedData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">QR Code Scanned Successfully!</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-600 mb-1">Channel Label</p>
              <p className="font-medium text-neutral-900">{scannedData.label}</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-600 mb-1">Channel ID</p>
              <p className="font-mono text-sm text-neutral-900">{scannedData.channelId}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setScannedData(null);
              setIsScanning(false);
            }}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Scan Another Code
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-700 mt-1">
              Install react-qr-reader: <code className="bg-red-100 px-1 rounded">npm install react-qr-reader</code>
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm font-medium text-neutral-900 mb-2">How to use:</p>
        <ol className="text-sm text-neutral-600 space-y-1 list-decimal list-inside">
          <li>Click "Start Scanning" to activate camera</li>
          <li>Point your camera at the AirGuard QR code</li>
          <li>Wait for automatic detection</li>
          <li>Channel credentials will be filled automatically</li>
        </ol>
      </div>
    </div>
  );
}
