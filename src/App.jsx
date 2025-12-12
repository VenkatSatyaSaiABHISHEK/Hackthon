import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import AnalysisResultPage from './pages/AnalysisResultPage'
import AnalysisResultsPage from './pages/AnalysisResultsPage'
import Dashboard from './pages/Dashboard'
import ReportPage from './pages/ReportPage'
import ForecastPage from './pages/ForecastPage'
import AssistantPage from './pages/AssistantPage'

/**
 * Layout wrapper that conditionally shows footer
 * Reads window.__AIRGUARD_HIDE_FOOTER flag set by specific pages
 */
function AppLayout({ children }) {
  const [hideFooter, setHideFooter] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Option 1: Check global flag (set by AssistantPage)
    const checkFooterVisibility = () => {
      setHideFooter(!!window.__AIRGUARD_HIDE_FOOTER);
    };

    // Check immediately
    checkFooterVisibility();

    // Option 2: Also check on route change
    // Some routes like /assistant should hide footer
    const shouldHideFooter = location.pathname === '/assistant';
    if (shouldHideFooter !== hideFooter) {
      setHideFooter(shouldHideFooter);
    }

    // Poll for flag changes (in case page sets it after mount)
    const interval = setInterval(checkFooterVisibility, 100);
    return () => clearInterval(interval);
  }, [location, hideFooter]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}

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
 * - /assistant - AI chat assistant (FOOTER HIDDEN)
 */

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Root redirects directly to home page (no login/splash) */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Login Route (No Navbar/Footer) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Main App Routes (With Navbar/Conditional Footer) - All publicly accessible */}
          <Route path="/*" element={
            <AppLayout>
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/analysis/result/:id" element={<AnalysisResultPage />} />
                <Route path="/analysis/results" element={<AnalysisResultsPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/forecast" element={<ForecastPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                
                {/* Catch-all redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
