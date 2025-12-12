// src/components/CSVUploadFallback.jsx

/**
 * CSV Upload Fallback Component
 * Allows users to upload CSV files as alternative to ThingSpeak
 */

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, File, CheckCircle2, AlertCircle, Download, X } from 'lucide-react';
import { SAMPLE_CSV_DOWNLOAD_URL } from '../constants/demo';

export default function CSVUploadFallback({ onData, className = '' }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const parseCSV = useCallback((csvText, filename) => {
    setIsProcessing(true);
    setError('');

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error('CSV parsing error: ' + results.errors[0].message);
          }

          const feeds = results.data;
          
          if (feeds.length === 0) {
            throw new Error('CSV file is empty');
          }

          // Auto-detect field mappings
          const headers = Object.keys(feeds[0]);
          const fieldMapping = {};

          headers.forEach((header, idx) => {
            const lower = header.toLowerCase();
            if (lower.includes('pm2.5') || lower.includes('pm25')) {
              fieldMapping.pm25 = header;
            } else if (lower.includes('pm10')) {
              fieldMapping.pm10 = header;
            } else if (lower.includes('temp')) {
              fieldMapping.temperature = header;
            } else if (lower.includes('humid')) {
              fieldMapping.humidity = header;
            } else if (lower.includes('noise') || lower.includes('sound')) {
              fieldMapping.noise = header;
            } else if (lower.includes('time') || lower.includes('date')) {
              fieldMapping.timestamp = header;
            }
          });

          // Fallback to field1, field2, etc.
          if (!fieldMapping.pm25) fieldMapping.pm25 = headers[1] || 'field1';
          if (!fieldMapping.pm10) fieldMapping.pm10 = headers[2] || 'field2';
          if (!fieldMapping.temperature) fieldMapping.temperature = headers[3] || 'field3';
          if (!fieldMapping.humidity) fieldMapping.humidity = headers[4] || 'field4';
          if (!fieldMapping.noise) fieldMapping.noise = headers[5] || 'field5';
          if (!fieldMapping.timestamp) fieldMapping.timestamp = headers[0] || 'created_at';

          // Calculate summary
          const summary = {
            records: feeds.length,
            last_reading: feeds[feeds.length - 1][fieldMapping.timestamp] || new Date().toISOString(),
            pm25_mean: calculateMean(feeds, fieldMapping.pm25),
            pm10_mean: calculateMean(feeds, fieldMapping.pm10),
            temp_mean: calculateMean(feeds, fieldMapping.temperature),
            humidity_mean: calculateMean(feeds, fieldMapping.humidity),
            noise_mean: calculateMean(feeds, fieldMapping.noise),
          };

          const parsedData = {
            channel: {
              name: filename.replace('.csv', ''),
              description: 'Uploaded CSV data',
              field1: fieldMapping.pm25,
              field2: fieldMapping.pm10,
              field3: fieldMapping.temperature,
              field4: fieldMapping.humidity,
              field5: fieldMapping.noise,
            },
            feeds,
            summary,
            fieldMapping,
            source: 'csv',
          };

          setSuccess(true);
          setIsProcessing(false);

          if (onData) {
            onData(parsedData);
          }

        } catch (err) {
          setError(err.message);
          setIsProcessing(false);
        }
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message);
        setIsProcessing(false);
      },
    });
  }, [onData]);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setSuccess(false);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSV(e.target.result, selectedFile.name);
    };
    reader.readAsText(selectedFile);
  }, [parseCSV]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setSuccess(false);
    setError('');
  };

  const calculateMean = (data, field) => {
    const values = data.map(row => parseFloat(row[field])).filter(v => !isNaN(v));
    if (values.length === 0) return null;
    return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2);
  };

  return (
    <div className={`bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary-600" />
        Upload CSV Data
      </h3>

      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload CSV file"
        />

        {!file ? (
          <div>
            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-700 font-medium mb-2">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-neutral-500">
              Supports CSV files up to 5MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="w-8 h-8 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">{file.name}</p>
                <p className="text-sm text-neutral-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {success && <CheckCircle2 className="w-6 h-6 text-green-600" />}
            {!isProcessing && !success && (
              <button
                onClick={handleRemove}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Remove file"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-600">Processing CSV...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">CSV uploaded successfully!</p>
            <p className="text-xs text-green-700 mt-1">Data is now available in your dashboard</p>
          </div>
        </div>
      )}

      {/* Sample CSV Download */}
      <div className="mt-6 pt-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-600 mb-3">
          Don't have a CSV file? Download our sample template:
        </p>
        <a
          href={SAMPLE_CSV_DOWNLOAD_URL}
          download="sample-airguard-data.csv"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download Sample CSV
        </a>
      </div>

      {/* Expected Format Help */}
      <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm font-medium text-neutral-900 mb-2">Expected CSV Format:</p>
        <code className="text-xs text-neutral-700 block bg-white p-2 rounded border border-neutral-200 overflow-x-auto">
          timestamp,pm2.5,pm10,temperature,humidity,noise
        </code>
        <p className="text-xs text-neutral-500 mt-2">
          Column names are auto-detected. Ensure headers match sensor types.
        </p>
      </div>
    </div>
  );
}
