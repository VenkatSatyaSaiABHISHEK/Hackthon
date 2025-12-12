// src/components/CSVUploader.jsx

/**
 * CSV File Upload Component
 * Parse and extract sensor data from CSV files
 */

import React, { useState, useCallback } from 'react';
import { X, Upload, File, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';

export default function CSVUploader({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSV(e.target.result, selectedFile.name);
    };
    reader.readAsText(selectedFile);
  }, []);

  const parseCSV = (csvText, filename) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(results.errors[0].message);
          }

          const feeds = results.data;
          if (feeds.length === 0) {
            throw new Error('CSV file is empty');
          }

          // Auto-detect field mappings
          const headers = Object.keys(feeds[0]);
          const fieldMapping = detectFieldMapping(headers);

          // Create parsed data structure
          const parsedData = {
            source: 'csv',
            filename,
            feeds: feeds.map((row, idx) => ({
              created_at: row[fieldMapping.timestamp] || new Date(Date.now() - (feeds.length - idx) * 60000).toISOString(),
              entry_id: idx + 1,
              pm25: parseFloat(row[fieldMapping.pm25]) || null,
              pm10: parseFloat(row[fieldMapping.pm10]) || null,
              temperature: parseFloat(row[fieldMapping.temperature]) || null,
              humidity: parseFloat(row[fieldMapping.humidity]) || null,
              noise: parseFloat(row[fieldMapping.noise]) || null,
            })),
            fieldMapping,
            rawData: results.data,
          };

          // Save to localStorage
          localStorage.setItem('airguard_csv_filename', filename);

          setIsProcessing(false);
          onUpload(parsedData);
          onClose();

        } catch (err) {
          setError(err.message);
          setIsProcessing(false);
        }
      },
      error: (err) => {
        setError('CSV parsing failed: ' + err.message);
        setIsProcessing(false);
      },
    });
  };

  const detectFieldMapping = (headers) => {
    const mapping = {
      timestamp: null,
      pm25: null,
      pm10: null,
      temperature: null,
      humidity: null,
      noise: null,
    };

    headers.forEach((header) => {
      const lower = header.toLowerCase();
      
      if (lower.includes('time') || lower.includes('date')) {
        mapping.timestamp = header;
      } else if (lower.includes('pm2.5') || lower.includes('pm25')) {
        mapping.pm25 = header;
      } else if (lower.includes('pm10')) {
        mapping.pm10 = header;
      } else if (lower.includes('temp')) {
        mapping.temperature = header;
      } else if (lower.includes('humid')) {
        mapping.humidity = header;
      } else if (lower.includes('noise') || lower.includes('sound') || lower.includes('db')) {
        mapping.noise = header;
      }
    });

    // Fallback to field1, field2, etc.
    if (!mapping.timestamp) mapping.timestamp = headers[0];
    if (!mapping.pm25) mapping.pm25 = headers.find(h => h.toLowerCase().includes('field1')) || headers[1];
    if (!mapping.pm10) mapping.pm10 = headers.find(h => h.toLowerCase().includes('field2')) || headers[2];
    if (!mapping.temperature) mapping.temperature = headers.find(h => h.toLowerCase().includes('field3')) || headers[3];
    if (!mapping.humidity) mapping.humidity = headers.find(h => h.toLowerCase().includes('field4')) || headers[4];
    if (!mapping.noise) mapping.noise = headers.find(h => h.toLowerCase().includes('field5')) || headers[5];

    return mapping;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const sampleCSV = `timestamp,pm2.5,pm10,temperature,humidity,noise
2025-12-11 08:00:00,12.5,25.3,24.8,45.2,42.0
2025-12-11 09:00:00,15.3,28.1,25.1,44.8,43.5
2025-12-11 10:00:00,18.7,32.4,25.5,44.2,45.2`;

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-airguard-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Upload CSV Data</h2>
              <p className="text-sm text-purple-100">Import your sensor measurements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-neutral-300 hover:border-purple-400 bg-neutral-50'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />

            {!file ? (
              <div>
                <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-neutral-700 mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-neutral-500">
                  or click to browse (max 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <File className="w-8 h-8 text-purple-600" />
                <div className="text-left">
                  <p className="font-semibold text-neutral-900">{file.name}</p>
                  <p className="text-sm text-neutral-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {!isProcessing && (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-neutral-700">Processing CSV...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Expected Format */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <p className="text-sm font-semibold text-neutral-900 mb-2">Expected CSV Format:</p>
            <code className="text-xs text-neutral-700 block bg-white p-3 rounded border border-neutral-300 overflow-x-auto font-mono">
              timestamp,pm2.5,pm10,temperature,humidity,noise
            </code>
            <p className="text-xs text-neutral-500 mt-2">
              Column names are auto-detected. We support: timestamp, pm2.5, pm10, temperature, humidity, noise, field1-5
            </p>
          </div>

          {/* Sample Download */}
          <button
            onClick={downloadSample}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all"
          >
            <Download className="w-5 h-5" />
            Download Sample CSV
          </button>
        </div>
      </div>
    </div>
  );
}
