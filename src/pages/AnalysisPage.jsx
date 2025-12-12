import { useState } from 'react'
import { Upload, Video, CheckCircle2, AlertCircle, TrendingUp, Wind, Eye, Droplets, Thermometer, Activity, Brain, Sparkles, ArrowRight, Lightbulb } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function AnalysisPage() {
  const [videoFile, setVideoFile] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoPreview, setVideoPreview] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [progress, setProgress] = useState({ stage: '', percent: 0 })
  const [error, setError] = useState(null)
  
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')
  
  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }
  
  const handleCsvUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCsvFile(file)
    }
  }

  // Parse CSV data
  const parseCSV = async (file) => {
    const text = await file.text()
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = line.split(',')
      const row = {}
      headers.forEach((header, i) => {
        row[header] = values[i]?.trim()
      })
      return row
    })
  }

  // Client-side analysis
  const analyzeData = async (csvData) => {
    // Calculate statistics
    const co2Values = csvData.map(row => parseFloat(row.co2 || row.CO2 || 0)).filter(v => !isNaN(v))
    const pm25Values = csvData.map(row => parseFloat(row.pm25 || row['PM2.5'] || 0)).filter(v => !isNaN(v))
    const tempValues = csvData.map(row => parseFloat(row.temperature || row.temp || 0)).filter(v => !isNaN(v))
    const humidityValues = csvData.map(row => parseFloat(row.humidity || 0)).filter(v => !isNaN(v))

    const avgCO2 = co2Values.reduce((a, b) => a + b, 0) / co2Values.length || 0
    const avgPM25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length || 0
    const avgTemp = tempValues.reduce((a, b) => a + b, 0) / tempValues.length || 0
    const avgHumidity = humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length || 0

    const maxCO2 = Math.max(...co2Values, 0)
    const maxPM25 = Math.max(...pm25Values, 0)

    // Calculate air quality score (0-100)
    let score = 100
    
    // CO2 penalties
    if (avgCO2 > 1000) score -= 20
    else if (avgCO2 > 800) score -= 10
    
    // PM2.5 penalties
    if (avgPM25 > 35) score -= 25
    else if (avgPM25 > 12) score -= 15
    
    // Temperature penalties
    if (avgTemp > 26 || avgTemp < 18) score -= 10
    
    // Humidity penalties
    if (avgHumidity > 60 || avgHumidity < 30) score -= 5

    score = Math.max(0, Math.min(100, score))

    // Generate insights
    const insights = []
    
    if (avgCO2 > 1000) {
      insights.push({
        icon: Wind,
        title: 'High CO₂ Levels Detected',
        status: 'warning',
        findings: [
          `Average CO₂: ${avgCO2.toFixed(0)} ppm (Target: <1000 ppm)`,
          `Peak CO₂: ${maxCO2.toFixed(0)} ppm`,
          'Recommendation: Improve ventilation by opening windows'
        ]
      })
    }

    if (avgPM25 > 12) {
      insights.push({
        icon: Droplets,
        title: 'Elevated Particulate Matter',
        status: avgPM25 > 35 ? 'danger' : 'warning',
        findings: [
          `Average PM2.5: ${avgPM25.toFixed(1)} µg/m³`,
          `Peak PM2.5: ${maxPM25.toFixed(1)} µg/m³`,
          'Recommendation: Consider using an air purifier'
        ]
      })
    }

    if (avgTemp > 26) {
      insights.push({
        icon: Thermometer,
        title: 'Temperature Above Comfort Zone',
        status: 'normal',
        findings: [
          `Average temperature: ${avgTemp.toFixed(1)}°C`,
          'Optimal range: 20-24°C',
          'Recommendation: Adjust cooling or ventilation'
        ]
      })
    }

    if (insights.length === 0) {
      insights.push({
        icon: CheckCircle2,
        title: 'Air Quality Excellent',
        status: 'good',
        findings: [
          'All metrics within healthy ranges',
          `CO₂: ${avgCO2.toFixed(0)} ppm`,
          `PM2.5: ${avgPM25.toFixed(1)} µg/m³`
        ]
      })
    }

    return { score, insights, stats: { avgCO2, avgPM25, avgTemp, avgHumidity }, rawData: csvData }
  }
  
  // AI-powered analysis using Gemini
  const analyzeWithAI = async (csvData) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      
      // Prepare data summary for AI
      const dataSummary = csvData.slice(0, 20).map(row => ({
        time: row.created_at || row.time,
        co2: row.co2 || row.CO2,
        pm25: row.pm25 || row['PM2.5'],
        temp: row.temperature || row.temp,
        humidity: row.humidity
      }))
      
      const prompt = `You are an air quality expert. Analyze this indoor air quality sensor data and provide insights:

${JSON.stringify(dataSummary, null, 2)}

Provide a JSON response with this structure:
{
  "score": (0-100 number),
  "insights": [
    {
      "title": "Issue Title",
      "status": "good|warning|danger",
      "findings": ["finding 1", "finding 2", "finding 3"]
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Consider CO2 levels (good <1000 ppm), PM2.5 (good <12 µg/m³), temperature (20-24°C optimal), and humidity (30-60% optimal).`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0])
        return aiResult
      }
      
      return null
    } catch (error) {
      console.error('AI Analysis error:', error)
      return null
    }
  }
  
  const handleAnalyze = async () => {
    if (!csvFile) {
      setAnalysisResult({ error: 'Please upload a CSV file with sensor data' })
      return
    }

    setIsProcessing(true)
    setAnalysisResult(null)
    
    try {
      // Stage 1: Reading data
      setProgress({ stage: 'Reading sensor data...', percent: 20 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const csvData = await parseCSV(csvFile)
      
      // Stage 2: AI Analysis
      setProgress({ stage: '🤖 Analyzing with AI...', percent: 50 })
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Try AI analysis first
      const aiResult = await analyzeWithAI(csvData)
      
      let result
      if (aiResult) {
        // Use AI results and add basic stats
        const basicResult = await analyzeData(csvData)
        result = {
          score: aiResult.score,
          insights: aiResult.insights.map(insight => ({
            icon: insight.status === 'good' ? CheckCircle2 : 
                  insight.status === 'danger' ? AlertCircle : Wind,
            title: insight.title,
            status: insight.status,
            findings: insight.findings
          })),
          stats: basicResult.stats,
          rawData: csvData,
          aiPowered: true
        }
      } else {
        // Fallback to basic analysis
        result = await analyzeData(csvData)
      }
      
      // Stage 3: Generating insights
      setProgress({ stage: 'Generating insights...', percent: 80 })
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setProgress({ stage: 'Complete!', percent: 100 })
      setAnalysisResult(result)
      
      setTimeout(() => {
        setIsProcessing(false)
        setProgress({ stage: '', percent: 0 })
      }, 500)
      
    } catch (err) {
      console.error('Analysis error:', err)
      setAnalysisResult({ error: 'Failed to analyze data. Please check your CSV format.' })
      setIsProcessing(false)
      setProgress({ stage: '', percent: 0 })
    }
  }
  
  // Placeholder Lottie animation
  const processingAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 300,
    h: 300,
    nm: "Processing",
    ddd: 0,
    assets: [],
    layers: []
  }
  
  const mockInsights = [
    {
      icon: Wind,
      title: 'Ventilation Assessment',
      status: 'warning',
      findings: [
        'Windows appear closed in video frames',
        'No visible air circulation devices active',
        'Recommended: Open windows for 15-20 minutes'
      ]
    },
    {
      icon: Eye,
      title: 'Visual Inspection',
      status: 'good',
      findings: [
        'Room appears clean and organized',
        'No visible dust accumulation detected',
        'Good natural lighting present'
      ]
    },
    {
      icon: Lightbulb,
      title: 'Environmental Clues',
      status: 'normal',
      findings: [
        'Indoor plants detected (positive for air quality)',
        'Electronics present (potential heat source)',
        'Curtains partially drawn'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Detected Issues',
      status: 'warning',
      findings: [
        'Potential air stagnation zones identified',
        'Limited cross-ventilation observed',
        'Consider air purifier placement'
      ]
    }
  ]
  
  const statusColors = {
    good: 'from-green-500 to-emerald-500',
    normal: 'from-primary-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    danger: 'from-red-500 to-rose-500'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-400 via-emerald-500 to-teal-500'
    if (score >= 60) return 'from-yellow-400 via-amber-500 to-orange-500'
    return 'from-red-400 via-pink-500 to-rose-500'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { text: 'Fair', color: 'text-yellow-600' }
    return { text: 'Poor', color: 'text-red-600' }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-28 pb-20">
      <div className="section-container">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Brain className="w-4 h-4" />
            AI-Powered Analysis
          </div>
          <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Air Quality Analysis
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Upload your sensor data for instant AI-powered insights and recommendations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Upload Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Room Video</h2>
                    <p className="text-sm text-neutral-600">Upload video of your room for visual analysis</p>
                  </div>
                </div>
                
                {!videoFile ? (
                  <label className="block">
                    <div className="border-2 border-dashed border-purple-300 rounded-2xl p-16 text-center hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 transition-all cursor-pointer group">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-purple-600" />
                      </div>
                      <p className="text-neutral-800 font-semibold text-lg mb-2">Drop your video here</p>
                      <p className="text-sm text-neutral-500 mb-4">or click to browse</p>
                      <div className="inline-flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100 px-4 py-2 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                        Accepts: MP4, MOV, AVI
                      </div>
                    </div>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    {videoPreview && (
                      <div className="rounded-xl overflow-hidden bg-neutral-900">
                        <video 
                          src={videoPreview} 
                          controls 
                          className="w-full max-h-96"
                        />
                      </div>
                    )}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <p className="font-medium text-neutral-800">{videoFile.name}</p>
                          <p className="text-sm text-neutral-600">
                            {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setVideoFile(null)
                            setVideoPreview(null)
                          }}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* CSV Upload - Featured */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Sensor Data</h2>
                    <p className="text-sm text-neutral-600">Upload CSV with CO₂, PM2.5, temperature data</p>
                  </div>
                </div>
                
                {!csvFile ? (
                  <label className="block">
                    <div className="border-2 border-dashed border-primary-300 rounded-2xl p-16 text-center hover:border-primary-500 hover:bg-gradient-to-br hover:from-primary-50/50 hover:to-teal-50/50 transition-all cursor-pointer group">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-primary-600" />
                      </div>
                      <p className="text-neutral-800 font-semibold text-lg mb-2">Drop your CSV file here</p>
                      <p className="text-sm text-neutral-500 mb-4">or click to browse</p>
                      <div className="inline-flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100 px-4 py-2 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                        Accepts: .csv files
                      </div>
                    </div>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleCsvUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-800">{csvFile.name}</p>
                        <p className="text-sm text-neutral-600">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button 
                        onClick={() => setCsvFile(null)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Analysis Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={!videoFile || !csvFile || isProcessing}
              className="w-full shadow-xl hover:shadow-2xl transition-shadow"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{progress.stage || 'Processing...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Air Quality</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
            
            {/* Progress Bar */}
            {isProcessing && progress.percent > 0 && (
              <div className="space-y-3 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 font-medium">{progress.stage}</span>
                  <span className="font-bold text-primary-600">{progress.percent}%</span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 via-teal-500 to-green-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Results/Info Panel */}
          <div className="space-y-6">
            {isProcessing ? (
              <Card className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-primary-50 to-teal-50">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <Brain className="w-12 h-12 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2 mt-6">{progress.stage}</h3>
                <p className="text-neutral-600 text-center max-w-md px-4">
                  Analyzing sensor patterns and generating insights...
                </p>
              </Card>
            ) : analysisResult?.error ? (
              <Card className="bg-red-50 border-2 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Analysis Error</h3>
                    <p className="text-red-700">{analysisResult.error}</p>
                  </div>
                </div>
              </Card>
            ) : analysisResult ? (
              <>
                {/* Score Card */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative text-center py-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-white to-neutral-50 shadow-2xl mb-4">
                      <div className={`text-5xl font-bold bg-gradient-to-br ${getScoreColor(analysisResult.score)} bg-clip-text text-transparent`}>
                        {Math.round(analysisResult.score)}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className={`text-2xl font-bold ${getScoreLabel(analysisResult.score).color}`}>
                        {getScoreLabel(analysisResult.score).text}
                      </span>
                    </div>
                    <p className="text-neutral-600">Air Quality Score</p>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <Wind className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-900">{analysisResult.stats.avgCO2.toFixed(0)}</div>
                        <div className="text-xs text-blue-700">CO₂ ppm</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <Droplets className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-purple-900">{analysisResult.stats.avgPM25.toFixed(1)}</div>
                        <div className="text-xs text-purple-700">PM2.5 µg/m³</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Insights */}
                {analysisResult.insights.map((insight, idx) => (
                  <Card key={idx} className="hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusColors[insight.status]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <insight.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-800 mb-3">{insight.title}</h3>
                        <ul className="space-y-2">
                          {insight.findings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                              <TrendingUp className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                insight.status === 'good' ? 'text-green-500' :
                                insight.status === 'warning' ? 'text-yellow-500' :
                                insight.status === 'danger' ? 'text-red-500' :
                                'text-blue-500'
                              }`} />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {/* Full Data Table */}
                <Card className="mt-6">
                  <h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-600" />
                    Complete Sensor Data
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-neutral-700">Timestamp</th>
                          <th className="px-4 py-3 text-left font-semibold text-neutral-700">CO₂ (ppm)</th>
                          <th className="px-4 py-3 text-left font-semibold text-neutral-700">PM2.5 (µg/m³)</th>
                          <th className="px-4 py-3 text-left font-semibold text-neutral-700">Temp (°C)</th>
                          <th className="px-4 py-3 text-left font-semibold text-neutral-700">Humidity (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {analysisResult.rawData?.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 text-neutral-600">{row.created_at || row.time || `Row ${idx + 1}`}</td>
                            <td className="px-4 py-3 font-medium text-neutral-800">{row.co2 || row.CO2 || '-'}</td>
                            <td className="px-4 py-3 font-medium text-neutral-800">{row.pm25 || row['PM2.5'] || '-'}</td>
                            <td className="px-4 py-3 font-medium text-neutral-800">{row.temperature || row.temp || '-'}</td>
                            <td className="px-4 py-3 font-medium text-neutral-800">{row.humidity || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {analysisResult.rawData && analysisResult.rawData.length > 10 && (
                      <p className="text-center text-sm text-neutral-500 mt-4 py-3 bg-neutral-50 rounded-lg">
                        Showing first 10 of {analysisResult.rawData.length} data points
                      </p>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="bg-gradient-to-br from-primary-50 to-teal-50 border-2 border-primary-100">
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-2">Ready to Analyze</h3>
                  <p className="text-neutral-600 mb-4">Upload your sensor data to get started</p>
                  <div className="space-y-2 text-left max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Instant results - no waiting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>AI-powered insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Actionable recommendations</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
