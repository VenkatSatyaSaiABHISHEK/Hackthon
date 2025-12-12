import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, FileJson, FileText, CheckCircle2, AlertCircle, Wind, Eye, Droplets, Thermometer, Activity, Brain, Lightbulb, TrendingUp } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'

export default function AnalysisResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const analysisResult = location.state?.analysisResult
  const [downloading, setDownloading] = useState(false)

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">No Results Found</h2>
          <p className="text-neutral-600 mb-6">Please run an analysis first.</p>
          <Button onClick={() => navigate('/home')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Analysis
          </Button>
        </Card>
      </div>
    )
  }

  const statusColors = {
    good: 'from-green-500 to-teal-500',
    moderate: 'from-yellow-500 to-orange-500',
    warning: 'from-yellow-500 to-orange-500',
    bad: 'from-red-500 to-pink-500',
    danger: 'from-red-500 to-pink-500'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-teal-500'
    if (score >= 60) return 'from-blue-500 to-cyan-500'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { text: 'Good', color: 'text-blue-600' }
    if (score >= 40) return { text: 'Fair', color: 'text-yellow-600' }
    return { text: 'Poor', color: 'text-red-600' }
  }

  const downloadAsJSON = () => {
    setDownloading(true)
    const dataStr = JSON.stringify(analysisResult, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `air-quality-analysis-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    setTimeout(() => setDownloading(false), 1000)
  }

  const downloadAsPDF = async () => {
    setDownloading(true)
    
    // Simple text-based PDF alternative using window.print
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Air Quality Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; }
          h2 { color: #0891b2; margin-top: 30px; }
          .score { font-size: 48px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
          .insight { margin: 15px 0; padding: 15px; border-left: 4px solid #0891b2; background: #f0f9ff; }
          .insight h3 { margin: 0 0 10px 0; color: #0c4a6e; }
          .finding { margin: 5px 0; padding-left: 20px; }
          .recommendation { margin: 10px 0; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; }
          .priority { font-weight: bold; text-transform: uppercase; }
          .high { color: #dc2626; }
          .medium { color: #f59e0b; }
          .low { color: #0891b2; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>🌬️ Air Quality Analysis Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <div class="score">Score: ${Math.round(analysisResult.score)}/100</div>
        <p style="text-align: center; font-size: 18px; color: ${getScoreLabel(analysisResult.score).color}">
          ${getScoreLabel(analysisResult.score).text}
        </p>
        
        <h2>📊 Key Metrics</h2>
        ${analysisResult.stats ? `
          <ul>
            <li><strong>CO₂:</strong> ${analysisResult.stats.avgCO2?.toFixed(0) || 'N/A'} ppm</li>
            <li><strong>PM2.5:</strong> ${analysisResult.stats.avgPM25?.toFixed(1) || 'N/A'} µg/m³</li>
            <li><strong>Temperature:</strong> ${analysisResult.stats.avgTemp?.toFixed(1) || 'N/A'} °C</li>
            <li><strong>Humidity:</strong> ${analysisResult.stats.avgHumidity?.toFixed(0) || 'N/A'} %</li>
          </ul>
        ` : '<p>Metrics not available</p>'}
        
        <h2>🔍 Insights</h2>
        ${analysisResult.insights?.map(insight => `
          <div class="insight">
            <h3>${insight.title}</h3>
            ${insight.findings?.map(finding => `
              <div class="finding">• ${finding}</div>
            `).join('') || ''}
          </div>
        `).join('') || '<p>No insights available</p>'}
        
        ${analysisResult.videoAnalysis ? `
          <h2>🎥 Video Analysis</h2>
          <p><strong>Overall Assessment:</strong> ${analysisResult.videoAnalysis.overall_assessment}</p>
          
          <h3>Visual Findings:</h3>
          ${analysisResult.videoAnalysis.visual_findings?.map(finding => `
            <div class="insight">
              <h3>${finding.title} [${finding.severity.toUpperCase()}]</h3>
              <p>${finding.description}</p>
              <p><em>Location: ${finding.location}</em></p>
            </div>
          `).join('') || ''}
        ` : ''}
        
        ${analysisResult.recommendations || analysisResult.videoAnalysis?.recommendations ? `
          <h2>💡 Recommendations</h2>
          ${(analysisResult.recommendations || analysisResult.videoAnalysis?.recommendations)?.map(rec => `
            <div class="recommendation">
              <div class="priority ${rec.priority}">[${rec.priority?.toUpperCase()}]</div>
              <strong>${rec.action}</strong>
              <p>${rec.reason}</p>
            </div>
          `).join('') || ''}
        ` : ''}
        
        <hr style="margin: 30px 0;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">
          Generated by AirGuard AI - Indoor Air Quality Analysis System
        </p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      setDownloading(false)
    }, 500)
  }

  const shareResults = () => {
    const shareText = `Air Quality Analysis - Score: ${Math.round(analysisResult.score)}/100\n\nGenerated by AirGuard AI`
    
    if (navigator.share) {
      navigator.share({
        title: 'Air Quality Analysis Results',
        text: shareText,
        url: window.location.href
      }).catch(() => {})
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Results link copied to clipboard!')
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Analysis</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Analysis Results</h1>
                <p className="text-xs sm:text-sm text-neutral-600">Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={downloadAsJSON}
                disabled={downloading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 text-sm"
                title="Download as JSON"
              >
                <FileJson className="w-4 h-4" />
                <span className="hidden sm:inline">JSON</span>
              </button>
              
              <button
                onClick={downloadAsPDF}
                disabled={downloading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50 text-sm"
                title="Download/Print PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              
              <button
                onClick={shareResults}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors text-sm"
                title="Share Results"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Score and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Success Banner */}
            <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900">✨ Analysis Complete!</h3>
                  <p className="text-sm text-green-700">
                    {analysisResult.aiPowered ? '🤖 AI-powered insights generated' : 'Results ready'}
                  </p>
                </div>
              </div>
            </Card>

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
                {analysisResult.stats && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <Wind className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-900">
                        {analysisResult.stats.avgCO2 ? analysisResult.stats.avgCO2.toFixed(0) : 'N/A'}
                      </div>
                      <div className="text-xs text-blue-700">CO₂ ppm</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <Droplets className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-purple-900">
                        {analysisResult.stats.avgPM25 ? analysisResult.stats.avgPM25.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-xs text-purple-700">PM2.5 µg/m³</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Insights and Video Analysis */}
          <div className="lg:col-span-3 space-y-6">
            {/* Insights */}
            {analysisResult.insights && analysisResult.insights.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Key Insights
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.insights.map((insight, idx) => (
                  <Card key={idx} className="hover:shadow-xl transition-all hover:scale-[1.02]">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusColors[insight.status] || 'from-neutral-500 to-neutral-600'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <insight.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
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
                              <span className="break-words">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
                </div>
              </>
            )}

            {/* Video Analysis Section */}
            {analysisResult.videoAnalysis && (
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-800">🎥 Video Analysis</h3>
                      <p className="text-sm text-neutral-600">AI-powered visual inspection</p>
                    </div>
                  </div>
                  
                  {/* Overall Assessment */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-purple-200">
                    <div className="flex items-start gap-4">
                      <Brain className="w-8 h-8 text-purple-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-lg text-neutral-800 mb-2">Overall Assessment</h4>
                        <p className="text-neutral-700 leading-relaxed">
                          {analysisResult.videoAnalysis.overall_assessment}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual Findings Grid */}
                  {analysisResult.videoAnalysis.visual_findings && analysisResult.videoAnalysis.visual_findings.length > 0 && (
                    <>
                      <h4 className="font-bold text-lg text-neutral-800 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-600" />
                        Visual Findings
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {analysisResult.videoAnalysis.visual_findings.map((finding, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-2xl p-6 shadow-lg border-2 transition-all hover:scale-105 ${
                              finding.severity === 'good' 
                                ? 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200' 
                                : finding.severity === 'bad'
                                ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                                : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                finding.severity === 'good' 
                                  ? 'bg-green-500' 
                                  : finding.severity === 'bad'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                              }`}>
                                {finding.category === 'ventilation' && <Wind className="w-5 h-5 text-white" />}
                                {finding.category === 'pollutant_source' && <AlertCircle className="w-5 h-5 text-white" />}
                                {finding.category === 'visible_issue' && <Eye className="w-5 h-5 text-white" />}
                                {finding.category === 'room_condition' && <CheckCircle2 className="w-5 h-5 text-white" />}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-neutral-800 mb-1">{finding.title}</h5>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  finding.severity === 'good' 
                                    ? 'bg-green-100 text-green-800' 
                                    : finding.severity === 'bad'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {finding.severity.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-neutral-700 mb-2">{finding.description}</p>
                            <p className="text-xs text-neutral-500">
                              📍 Location: <span className="font-semibold">{finding.location}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Recommendations */}
                  {analysisResult.videoAnalysis.recommendations && analysisResult.videoAnalysis.recommendations.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-6 h-6 text-amber-600" />
                        <h4 className="font-bold text-lg text-neutral-800">💡 Recommended Actions</h4>
                      </div>
                      <div className="space-y-3">
                        {analysisResult.videoAnalysis.recommendations.map((rec, idx) => (
                          <div 
                            key={idx} 
                            className={`rounded-xl p-4 border-l-4 ${
                              rec.priority === 'high' 
                                ? 'bg-red-50 border-red-500' 
                                : rec.priority === 'medium'
                                ? 'bg-yellow-50 border-yellow-500'
                                : 'bg-blue-50 border-blue-500'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                rec.priority === 'high' 
                                  ? 'bg-red-500 text-white' 
                                  : rec.priority === 'medium'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}>
                                {rec.priority.toUpperCase()}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-neutral-800 mb-1">{rec.action}</p>
                                <p className="text-sm text-neutral-600">{rec.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
