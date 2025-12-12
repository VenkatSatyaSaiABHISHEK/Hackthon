import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Play, Loader2, Download, Code, Trash2, Clock, ArrowLeft, Database, Upload } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import ReportHeader from '../components/report/ReportHeader';
import InputSummaryCard from '../components/report/InputSummaryCard';
import DataQualityCard from '../components/report/DataQualityCard';
import ExecutiveSummary from '../components/report/ExecutiveSummary';
import EvidenceBar from '../components/report/EvidenceBar';
import AnnotatedCharts from '../components/report/AnnotatedCharts';
import FramesRow from '../components/report/FramesRow';
import ActionPlan from '../components/report/ActionPlan';
import ReproducibilityBlock from '../components/report/ReproducibilityBlock';
import SourceDetectionCard from '../components/report/SourceDetectionCard';
import HealthRiskMatrix from '../components/report/HealthRiskMatrix';
import VentilationAdvisor from '../components/report/VentilationAdvisor';
import RoomOptimizationCard from '../components/report/RoomOptimizationCard';
import { callGeminiAdvancedAnalysis, dummyAdvancedAnalyze } from '../api/geminiClient';
import { saveReport, getAllReports, deleteReport, loadReport } from '../firebase/reportStorage';
import { getThingSpeakCredentials } from '../firebase/config';
import ThingSpeakModal from '../components/ThingSpeakModal';
import AQISourceSelector from '../components/AQISourceSelector';
import CSVUploader from '../components/CSVUploader';

export default function ReportPage() {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  
  console.log('🔵 ReportPage loaded');
  
  // State for analysis data
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEvidenceIndex, setSelectedEvidenceIndex] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  
  // Modal states for data sources
  const [showThingSpeakModal, setShowThingSpeakModal] = useState(false);
  const [showAQISelector, setShowAQISelector] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);

  // Load analysis and saved reports on mount
  useEffect(() => {
    console.log('🔵 ReportPage useEffect running');
    
    // Load saved reports
    const reports = getAllReports();
    setSavedReports(reports);
    
    // Load last analysis
    const savedAnalysis = localStorage.getItem('airguard_last_analysis');
    if (savedAnalysis) {
      try {
        const parsed = JSON.parse(savedAnalysis);
        console.log('✅ Loaded analysis from localStorage:', parsed);
        setAnalysis(parsed);
      } catch (error) {
        console.error('❌ Failed to parse saved analysis:', error);
      }
    } else if (reports.length > 0) {
      // If no current analysis, load the most recent report
      setAnalysis(reports[0].data);
    } else {
      console.log('⚠️ No saved analysis in localStorage');
    }
  }, []);

  // Dummy analyze function (fallback when real hooks are not available)
  function dummyAnalyze() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reportId: `RPT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          source: 'thingspeak',
          sourceDetails: {
            channelId: '2723363',
            apiKey: 'ABC123XYZ789',
            lastFetched: new Date().toISOString(),
            sampleCount: 150,
            city: null,
            filename: null
          },
          modelUsed: 'Gemini 3 Pro',
          air_health_score: 62,
          comfort_level: 'medium',
          risk_category: 'moderate',
          risk_description: 'High humidity + moderate PM2.5; closed windows likely causing poor ventilation.',
          recommended_actions: [
            'Open windows for 15 minutes',
            'Turn on fan to improve air circulation',
            'Run purifier for 30 minutes',
            'Monitor PM2.5 levels hourly',
            'Check HVAC filter replacement',
            'Consider dehumidifier usage'
          ],
          evidence: [
            'PM2.5 mean 82 µg/m³ exceeds WHO guideline',
            'Humidity peaked at 78% at 21:00',
            'Closed window observed in frame 3',
            'Temperature stable at 24°C',
            'No ventilation activity detected'
          ],
          frames: [
            { 
              ts: '2025-12-10T21:10:00', 
              caption: 'Closed window observed', 
              dataIndex: 12, 
              imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e0e7ee" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23334155" font-size="16" dy=".3em"%3EFrame 1: Closed Window%3C/text%3E%3C/svg%3E' 
            },
            { 
              ts: '2025-12-10T21:14:00', 
              caption: 'Visible smoke from outside', 
              dataIndex: 16, 
              imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e0e7ee" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23334155" font-size="16" dy=".3em"%3EFrame 2: Smoke Visible%3C/text%3E%3C/svg%3E' 
            },
            { 
              ts: '2025-12-10T21:18:00', 
              caption: 'Air purifier turned on', 
              dataIndex: 20, 
              imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e0e7ee" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23334155" font-size="16" dy=".3em"%3EFrame 3: Purifier On%3C/text%3E%3C/svg%3E' 
            }
          ],
          confidence: 'medium',
          sensorSummary: {
            pm25: { min: 12, max: 125, avg: 82, unit: 'µg/m³' },
            pm10: { min: 18, max: 180, avg: 110, unit: 'µg/m³' },
            temperature: { min: 22, max: 26, avg: 24, unit: '°C' },
            humidity: { min: 45, max: 78, avg: 62, unit: '%' },
            noise: { min: 35, max: 65, avg: 48, unit: 'dB' }
          },
          dataQuality: {
            rowsProcessed: 150,
            rowsDropped: 3,
            nanCount: 5,
            interpolationMethod: 'linear',
            smoothingApplied: true,
            timeRange: '2025-12-10T20:00:00 to 2025-12-10T23:00:00'
          },
          chartData: generateDummyChartData()
        });
      }, 2000);
    });
  }

  // Generate dummy chart data for visualization
  function generateDummyChartData() {
    const data = [];
    const startTime = new Date('2025-12-10T20:00:00');
    for (let i = 0; i < 30; i++) {
      const time = new Date(startTime.getTime() + i * 6 * 60 * 1000);
      data.push({
        timestamp: time.toISOString(),
        pm25: 50 + Math.random() * 75,
        pm10: 70 + Math.random() * 110,
        temperature: 22 + Math.random() * 4,
        humidity: 45 + Math.random() * 33,
        noise: 35 + Math.random() * 30
      });
    }
    return data;
  }

  // Run analysis - tries real Gemini API, falls back to dummy
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Prepare payload for advanced analysis
      const payload = {
        sensorSummary: analysis?.sensorSummary || {
          pm25: { min: 12, max: 125, avg: 82, unit: 'µg/m³' },
          pm10: { min: 18, max: 180, avg: 110, unit: 'µg/m³' },
          temperature: { min: 22, max: 26, avg: 24, unit: '°C' },
          humidity: { min: 45, max: 78, avg: 62, unit: '%' }
        },
        timeSeries: analysis?.chartData || generateDummyChartData(),
        frames: analysis?.frames || [],
        features: [
          'forecast',
          'pollution_source',
          'health_risk_groups',
          'ventilation_tips',
          'layout_suggestions'
        ],
        options: {
          forecastHours: 24,
          outdoorPM25: 45,
          exposureDuration: 8
        }
      };

      // Try real API call
      let result;
      try {
        const advancedAnalysis = await callGeminiAdvancedAnalysis(payload);
        
        // Merge with existing analysis or create new
        result = {
          ...analysis,
          reportId: analysis?.reportId || `RPT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          source: analysis?.source || 'manual',
          modelUsed: 'Gemini 1.5 Pro',
          air_health_score: analysis?.air_health_score || Math.round(100 - (payload.sensorSummary.pm25.avg * 0.8)),
          comfort_level: analysis?.comfort_level || 'medium',
          risk_category: analysis?.risk_category || 'moderate',
          risk_description: advancedAnalysis.summary || analysis?.risk_description || 'Analysis completed successfully',
          recommended_actions: analysis?.recommended_actions || advancedAnalysis.evidence || [],
          evidence: advancedAnalysis.evidence || analysis?.evidence || [],
          frames: analysis?.frames || payload.frames,
          confidence: advancedAnalysis.confidence || 'high',
          sensorSummary: payload.sensorSummary,
          chartData: payload.timeSeries,
          dataQuality: analysis?.dataQuality || {
            rowsProcessed: payload.timeSeries.length,
            rowsDropped: 0,
            nanCount: 0,
            interpolationMethod: 'linear',
            smoothingApplied: false,
            timeRange: `${payload.timeSeries[0]?.timestamp || 'N/A'} to ${payload.timeSeries[payload.timeSeries.length - 1]?.timestamp || 'N/A'}`
          },
          // Advanced AI features
          forecast: advancedAnalysis.forecast || null,
          pollution_source: advancedAnalysis.pollution_source || null,
          health_risk_groups: advancedAnalysis.health_risk_groups || null,
          ventilation_tips: advancedAnalysis.ventilation_tips || null,
          layout_suggestions: advancedAnalysis.layout_suggestions || null
        };
      } catch (apiError) {
        console.warn('Gemini API call failed, using dummy data:', apiError);
        
        // Fallback to dummy analysis
        const dummyResult = await dummyAnalyze();
        const dummyAdvanced = dummyAdvancedAnalyze(payload);
        
        result = {
          ...dummyResult,
          forecast: dummyAdvanced.forecast,
          pollution_source: dummyAdvanced.pollution_source,
          health_risk_groups: dummyAdvanced.health_risk_groups,
          ventilation_tips: dummyAdvanced.ventilation_tips,
          layout_suggestions: dummyAdvanced.layout_suggestions
        };
      }
      
      setAnalysis(result);
      
      // Save report to storage
      const savedReport = saveReport(result);
      if (savedReport) {
        setSavedReports([savedReport, ...savedReports]);
      }
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again or check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle ThingSpeak data source
  const handleThingSpeakConnect = async (data) => {
    setShowThingSpeakModal(false);
    setIsAnalyzing(true);
    
    try {
      // Generate analysis from ThingSpeak data
      const result = await generateAnalysisFromData(data);
      
      // Save and display
      const savedReport = saveReport(result);
      if (savedReport) {
        setSavedReports([savedReport, ...savedReports]);
      }
      setAnalysis(result);
    } catch (error) {
      console.error('ThingSpeak analysis failed:', error);
      alert('Failed to generate report from ThingSpeak data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle India AQI data source
  const handleAQIConnect = async (data) => {
    setShowAQISelector(false);
    setIsAnalyzing(true);
    
    try {
      const result = await generateAnalysisFromData(data);
      const savedReport = saveReport(result);
      if (savedReport) {
        setSavedReports([savedReport, ...savedReports]);
      }
      setAnalysis(result);
    } catch (error) {
      console.error('AQI analysis failed:', error);
      alert('Failed to generate report from AQI data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (data) => {
    setShowCSVUploader(false);
    setIsAnalyzing(true);
    
    try {
      const result = await generateAnalysisFromData(data);
      const savedReport = saveReport(result);
      if (savedReport) {
        setSavedReports([savedReport, ...savedReports]);
      }
      setAnalysis(result);
    } catch (error) {
      console.error('CSV analysis failed:', error);
      alert('Failed to generate report from CSV data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate analysis from any data source
  const generateAnalysisFromData = async (sensorData) => {
    // This is a simplified version - in production you'd call the real AI analysis
    const { feeds, fieldMapping, source, channelName } = sensorData;
    
    // Extract values
    const getField = (feed, field) => {
      if (feed && field in feed && feed[field] != null) {
        return parseFloat(feed[field]);
      }
      if (fieldMapping && fieldMapping[field]) {
        const mappedField = fieldMapping[field];
        if (feed && mappedField in feed && feed[mappedField] != null) {
          return parseFloat(feed[mappedField]);
        }
      }
      return null;
    };

    const pm25Values = feeds.map(f => getField(f, 'pm25')).filter(v => v != null);
    const pm10Values = feeds.map(f => getField(f, 'pm10')).filter(v => v != null);
    const tempValues = feeds.map(f => getField(f, 'temperature')).filter(v => v != null);
    const humidValues = feeds.map(f => getField(f, 'humidity')).filter(v => v != null);

    const avgPM25 = pm25Values.length > 0 ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : 0;
    const avgPM10 = pm10Values.length > 0 ? pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length : 0;
    const avgTemp = tempValues.length > 0 ? tempValues.reduce((a, b) => a + b, 0) / tempValues.length : 24;
    const avgHumid = humidValues.length > 0 ? humidValues.reduce((a, b) => a + b, 0) / humidValues.length : 60;

    // Calculate air health score (simple version)
    let score = 100;
    if (avgPM25 > 25) score -= (avgPM25 - 25) * 0.5;
    if (avgPM10 > 50) score -= (avgPM10 - 50) * 0.3;
    score = Math.max(0, Math.min(100, Math.round(score)));

    const riskCategory = score >= 80 ? 'low' : score >= 60 ? 'moderate' : score >= 40 ? 'high' : 'very high';

    return {
      reportId: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      source: source,
      sourceDetails: {
        channelId: sensorData.channelId || null,
        apiKey: sensorData.apiKey || null,
        channelName: channelName || 'Unknown',
        city: sensorData.city || null,
        filename: sensorData.filename || null,
        sampleCount: feeds.length,
        lastFetched: new Date().toISOString()
      },
      modelUsed: 'Gemini 1.5 Pro',
      air_health_score: score,
      comfort_level: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low',
      risk_category: riskCategory,
      risk_description: `PM2.5 average: ${avgPM25.toFixed(1)} µg/m³, PM10: ${avgPM10.toFixed(1)} µg/m³`,
      recommended_actions: [
        avgPM25 > 35 ? 'High PM2.5 detected - run air purifier' : 'PM2.5 levels acceptable',
        avgPM10 > 50 ? 'Elevated PM10 - avoid outdoor activities' : 'PM10 levels normal',
        avgHumid > 70 ? 'High humidity - consider dehumidifier' : avgHumid < 30 ? 'Low humidity - use humidifier' : 'Humidity optimal',
        'Monitor air quality regularly',
        'Ensure proper ventilation'
      ],
      evidence: [
        `PM2.5 average: ${avgPM25.toFixed(1)} µg/m³`,
        `PM10 average: ${avgPM10.toFixed(1)} µg/m³`,
        `Temperature: ${avgTemp.toFixed(1)}°C`,
        `Humidity: ${avgHumid.toFixed(1)}%`,
        `Data points analyzed: ${feeds.length}`
      ],
      frames: [],
      dataQuality: {
        rowsProcessed: feeds.length,
        rowsDropped: 0,
        overallScore: 100
      },
      sensorSummary: {
        pm25: { mean: avgPM25, min: Math.min(...pm25Values), max: Math.max(...pm25Values) },
        pm10: { mean: avgPM10, min: Math.min(...pm10Values), max: Math.max(...pm10Values) },
        temperature: { mean: avgTemp, min: Math.min(...tempValues), max: Math.max(...tempValues) },
        humidity: { mean: avgHumid, min: Math.min(...humidValues), max: Math.max(...humidValues) }
      }
    };
  };

  // Handle report selection from history
  const handleLoadReport = (reportId) => {
    const reportData = loadReport(reportId);
    if (reportData) {
      setAnalysis(reportData);
      setShowHistory(false);
    }
  };

  // Handle report deletion
  const handleDeleteReport = (reportId) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteReport(reportId);
      const updated = savedReports.filter(r => r.id !== reportId);
      setSavedReports(updated);
      
      // If deleted current analysis, clear it
      if (analysis?.reportId === reportId) {
        if (updated.length > 0) {
          setAnalysis(updated[0].data);
        } else {
          setAnalysis(null);
        }
      }
    }
  };

  // Export report to PDF
  const handleExportPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `airguard-report-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Export analysis data to JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airguard-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Saved reports history view
  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto pt-24">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
              <Database className="w-8 h-8 text-emerald-600" />
              Saved Reports
            </h1>
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Report View
            </button>
          </div>

          {savedReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 text-lg">No saved reports yet</p>
              <button
                onClick={() => setShowHistory(false)}
                className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
              >
                Generate Your First Report
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-neutral-800">{report.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.data.source === 'thingspeak' ? 'bg-blue-100 text-blue-700' :
                        report.data.source === 'india-aqi' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {report.data.source === 'thingspeak' ? 'IoT Sensor' :
                         report.data.source === 'india-aqi' ? 'India AQI' :
                         'CSV Upload'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                      <span>Score: {report.data.air_health_score}/100</span>
                      <span className="capitalize">Risk: {report.data.risk_category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadReport(report.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete report"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // No analysis placeholder view
  if (!analysis || analysis.air_health_score === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto pt-24">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-8 text-center">
            Air Quality Analysis Reports
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Create New Report */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-800">Create New Report</h2>
                  <p className="text-sm text-neutral-600">Generate analysis from your data</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* ThingSpeak Option */}
                <button
                  onClick={() => setShowThingSpeakModal(true)}
                  className="w-full p-4 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-all">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-neutral-800">IoT Sensor (ThingSpeak)</h3>
                  </div>
                  <p className="text-sm text-neutral-600 ml-13">Real-time data from your connected sensors</p>
                </button>

                {/* India AQI Option */}
                <button
                  onClick={() => setShowAQISelector(true)}
                  className="w-full p-4 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-all">
                      <Database className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-neutral-800">Public India AQI Data</h3>
                  </div>
                  <p className="text-sm text-neutral-600 ml-13">Government air quality data from Indian cities</p>
                </button>

                {/* CSV Upload Option */}
                <button
                  onClick={() => setShowCSVUploader(true)}
                  className="w-full p-4 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-all">
                      <Upload className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-neutral-800">Upload CSV File</h3>
                  </div>
                  <p className="text-sm text-neutral-600 ml-13">Analyze your own sensor data from CSV</p>
                </button>

                {/* Sample Report */}
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="w-full p-4 border-2 border-pink-200 hover:border-pink-400 rounded-xl transition-all group text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-all">
                      {isAnalyzing ? (
                        <Loader2 className="w-5 h-5 text-pink-600 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 text-pink-600" />
                      )}
                    </div>
                    <h3 className="font-bold text-neutral-800">
                      {isAnalyzing ? 'Generating...' : 'Generate Sample Report'}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600 ml-13">Create a demo report with sample data</p>
                </button>
              </div>
            </div>

            {/* Right: Saved Reports History */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-800">Report History</h2>
                  <p className="text-sm text-neutral-600">{savedReports.length} saved report{savedReports.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {savedReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">No reports yet</p>
                  <p className="text-sm text-neutral-500 mt-2">Create your first analysis to see it here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleLoadReport(report.id)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              report.data.source === 'thingspeak' ? 'bg-blue-100 text-blue-700' :
                              report.data.source === 'india-aqi' ? 'bg-green-100 text-green-700' :
                              report.data.source === 'csv' ? 'bg-purple-100 text-purple-700' :
                              'bg-pink-100 text-pink-700'
                            }`}>
                              {report.data.source === 'thingspeak' ? 'IoT' :
                               report.data.source === 'india-aqi' ? 'AQI' :
                               report.data.source === 'csv' ? 'CSV' :
                               'Sample'}
                            </span>
                            <span className="text-xs text-neutral-500 truncate">
                              {new Date(report.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-neutral-800 truncate">{report.id}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report.id);
                          }}
                          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-600">
                        <span className={`font-semibold ${
                          report.data.air_health_score >= 80 ? 'text-green-600' :
                          report.data.air_health_score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          Score: {report.data.air_health_score}/100
                        </span>
                        <span className="capitalize">• {report.data.risk_category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          <ThingSpeakModal 
            isOpen={showThingSpeakModal}
            onClose={() => setShowThingSpeakModal(false)}
            onConnect={handleThingSpeakConnect}
          />
          
          <AQISourceSelector
            isOpen={showAQISelector}
            onClose={() => setShowAQISelector(false)}
            onConnect={handleAQIConnect}
          />
          
          <CSVUploader
            isOpen={showCSVUploader}
            onClose={() => setShowCSVUploader(false)}
            onUpload={handleCSVUpload}
          />
        </div>
      </div>
    );
  }

  // Full report view with analysis
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto pt-24">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <button
            onClick={() => setAnalysis(null)}
            className="px-4 py-2 bg-white text-neutral-700 border border-neutral-300 rounded-xl font-semibold hover:bg-neutral-50 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
              aria-label="Download PDF report"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Download PDF Report</span>
              <span className="sm:hidden">PDF</span>
            </button>
            
            <button
              onClick={handleExportJSON}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
              aria-label="Download raw JSON data"
            >
              <Code className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Download Raw JSON</span>
              <span className="sm:hidden">JSON</span>
            </button>
          </div>
        </div>

        {/* Report content */}
        <div ref={reportRef} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 space-y-6 sm:space-y-8">
          <ReportHeader analysis={analysis} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputSummaryCard analysis={analysis} />
            <DataQualityCard analysis={analysis} />
          </div>

          <ExecutiveSummary analysis={analysis} />

          {/* Advanced AI Components */}
          {analysis.pollution_source && (
            <SourceDetectionCard pollution_source={analysis.pollution_source} />
          )}

          {analysis.health_risk_groups && (
            <HealthRiskMatrix health_risk_groups={analysis.health_risk_groups} />
          )}

          {analysis.ventilation_tips && (
            <VentilationAdvisor ventilation_tips={analysis.ventilation_tips} />
          )}

          {analysis.layout_suggestions && (
            <RoomOptimizationCard layout_suggestions={analysis.layout_suggestions} />
          )}

          <EvidenceBar 
            evidence={analysis.evidence || []}
            selectedIndex={selectedEvidenceIndex}
            onSelect={setSelectedEvidenceIndex}
          />

          <AnnotatedCharts 
            data={analysis.chartData || []}
            evidence={analysis.evidence || []}
            frames={analysis.frames || []}
            selectedEvidenceIndex={selectedEvidenceIndex}
          />

          <FramesRow 
            frames={analysis.frames || []}
            onFrameClick={(frameIndex) => {
              const frame = analysis.frames[frameIndex];
              if (frame && frame.dataIndex !== undefined) {
                setSelectedEvidenceIndex(frame.dataIndex);
              }
            }}
          />

          <ActionPlan actions={analysis.recommended_actions || []} />

          <ReproducibilityBlock analysis={analysis} onReplay={handleRunAnalysis} />

          {/* Footer disclaimer */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center italic">
              Report generated by {analysis.modelUsed || 'Gemini 3 Pro'} — interpretive AI output, not medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
