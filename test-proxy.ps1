# AirGuard - Quick Test Script
# Run this to verify proxy server is working

$proxyUrl = "http://localhost:3001"

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  AirGuard Proxy Server Test Script       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$proxyUrl/api/health" -Method Get
    Write-Host "✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Has API Key: $($health.hasApiKey)" -ForegroundColor Green
    Write-Host "✅ Timestamp: $($health.timestamp)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure proxy server is running: node server/proxy.js" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Analyze Endpoint
Write-Host "Test 2: Analyze Endpoint..." -ForegroundColor Yellow

$payload = @{
    payload = @{
        sensorSummary = @{
            pm25 = @{ min = 12; max = 125; avg = 82; unit = "µg/m³" }
            pm10 = @{ min = 18; max = 180; avg = 110; unit = "µg/m³" }
            temperature = @{ min = 22; max = 26; avg = 24; unit = "°C" }
            humidity = @{ min = 45; max = 78; avg = 62; unit = "%" }
        }
        timeSeries = @(
            @{ timestamp = "2025-12-11T10:00:00Z"; pm25 = 82; pm10 = 110 }
            @{ timestamp = "2025-12-11T11:00:00Z"; pm25 = 78; pm10 = 105 }
        )
        frames = @()
        features = @("forecast", "pollution_source", "health_risk_groups", "ventilation_tips", "layout_suggestions")
        options = @{
            forecastHours = 24
            outdoorPM25 = 45
            exposureDuration = 8
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$proxyUrl/api/gemini/analyze" -Method Post -Body $payload -ContentType "application/json"
    
    Write-Host "✅ Analysis successful!" -ForegroundColor Green
    Write-Host "✅ Has forecast: $($null -ne $response.data.forecast)" -ForegroundColor Green
    Write-Host "✅ Has pollution source: $($null -ne $response.data.pollution_source)" -ForegroundColor Green
    Write-Host "✅ Has health risks: $($null -ne $response.data.health_risk_groups)" -ForegroundColor Green
    Write-Host "✅ Has ventilation tips: $($null -ne $response.data.ventilation_tips)" -ForegroundColor Green
    Write-Host "✅ Has layout suggestions: $($null -ne $response.data.layout_suggestions)" -ForegroundColor Green
    
    if ($response.metadata.fallback) {
        Write-Host "⚠️  Using dummy data (no API key configured)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Using real Gemini API" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ All Tests Passed!                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start frontend: npm run dev" -ForegroundColor White
Write-Host "2. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "3. Navigate to /forecast or /assistant" -ForegroundColor White
