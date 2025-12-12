// src/components/QRShare.jsx

/**
 * QR Code Share Component
 * Generate QR codes for sharing ThingSpeak channel credentials
 * 
 * TODO: Install qrcode.react or react-qr-code library
 * npm install qrcode.react
 */

import React, { useState } from 'react';
import { QrCode, Copy, Download, CheckCircle2, Printer } from 'lucide-react';
// import QRCodeReact from 'qrcode.react'; // Uncomment after installing

export default function QRShare({ channelId, readKey, label = 'AirGuard Channel', className = '' }) {
  const [copied, setCopied] = useState(false);

  // Create shareable data object
  const shareData = {
    type: 'airguard_channel',
    channelId,
    readKey,
    label,
    timestamp: new Date().toISOString(),
  };

  const shareText = JSON.stringify(shareData, null, 2);
  const qrValue = JSON.stringify(shareData);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // TODO: Implement QR code download as PNG
    // const canvas = document.querySelector('#qr-code canvas');
    // if (canvas) {
    //   const url = canvas.toDataURL('image/png');
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.download = `airguard-qr-${channelId}.png`;
    //   link.click();
    // }
    
    alert('QR download feature - implement with qrcode.react library');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-primary-600" />
        Share Channel Access
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div>
          <div className="bg-white p-6 rounded-xl border-2 border-neutral-200 shadow-md">
            <div id="qr-code" className="flex items-center justify-center">
              {/* Placeholder - Replace with QRCodeReact component */}
              {/* <QRCodeReact 
                value={qrValue}
                size={200}
                level="H"
                includeMargin={true}
              /> */}
              
              {/* Fallback placeholder */}
              <div className="w-52 h-52 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">QR Code Placeholder</p>
                  <p className="text-xs text-neutral-400 mt-1">Install qrcode.react</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-2 text-center">
            Scan with AirGuard mobile app or QR scanner
          </p>
        </div>

        {/* Channel Info & Actions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Channel Label
            </label>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="font-medium text-neutral-900">{label}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Channel ID
            </label>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 font-mono text-sm">
              {channelId}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Read API Key
            </label>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 font-mono text-xs break-all">
              {readKey.substring(0, 8)}{'•'.repeat(8)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
              aria-label="Copy credentials to clipboard"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Credentials
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg transition-colors font-medium"
              aria-label="Download QR code"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg transition-colors font-medium print:hidden"
              aria-label="Print credentials card"
            >
              <Printer className="w-4 h-4" />
              Print Card
            </button>
          </div>
        </div>
      </div>

      {/* Printable Card */}
      <div className="hidden print:block mt-8 p-8 border-4 border-dashed border-neutral-300 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">AirGuard AI - Channel Access</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-600">Channel Label:</p>
            <p className="text-lg font-bold">{label}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Channel ID:</p>
            <p className="text-lg font-mono">{channelId}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-neutral-600">Read API Key:</p>
            <p className="text-sm font-mono bg-neutral-100 p-2 rounded break-all">{readKey}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-4">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Security Warning */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Security Note:</strong> Read API keys grant access to your channel data. Only share with trusted devices and team members.
        </p>
      </div>
    </div>
  );
}
