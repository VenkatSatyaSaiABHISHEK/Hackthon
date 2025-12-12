import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages (Authentication removed - now guest/demo mode only)
// Note: LoginPage.jsx and SplashScreen.jsx are no longer used
// Auth flow has been replaced with direct access and demo mode
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import AnalysisResultPage from './pages/AnalysisResultPage'
import Dashboard from './pages/Dashboard'
import ReportPage from './pages/ReportPage'
import ForecastPage from './pages/ForecastPage'
import AssistantPage from './pages/AssistantPage'

/**
 * Main App Component - Guest/Demo Mode
 * 
 * Guest Flow (No Authentication Required):
 * 1. / - Redirects directly to /dashboard
 * 2. /dashboard - Main dashboard with demo ThingSpeak credentials pre-filled
 * 3. /analysis - Analysis page with Demo Mode toggle
 * 
 * Demo Mode Features:
 * - ThingSpeak credentials stored in localStorage (airguard_thingspeak_demo)
 * - Demo video/CSV loaded from backend /demo/* endpoint
 * - Users can switch between demo and real data seamlessly
 * 
 * Routes:
 * - / - Redirects to /dashboard (no splash/login)
 * - /dashboard - Main dashboard (demo credentials pre-filled)
 * - /setup - ThingSpeak setup page
 * - /home - Public homepage
 * - /analysis - Public analysis page
 * - /dashboard - Dashboard (auto-loads saved credentials)
 * - /report - Report page
 * - /forecast - AI forecast page
 * - /assistant - AI chat assistant
 */

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Root redirects directly to home page (no login/splash) */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Main App Routes (With Navbar/Footer) - All publicly accessible */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analysis" element={<AnalysisPage />} />
                  <Route path="/analysis/result/:id" element={<AnalysisResultPage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/forecast" element={<ForecastPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  
                  {/* Catch-all redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
