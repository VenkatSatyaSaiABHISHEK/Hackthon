// Report Storage - Save and manage analysis reports
import { getCurrentUser } from './config';

const REPORTS_KEY = 'airguard_reports';

/**
 * Save a new analysis report
 */
export function saveReport(analysisData) {
  try {
    const user = getCurrentUser();
    const reports = getAllReports();
    
    const newReport = {
      id: analysisData.reportId || `RPT-${Date.now()}`,
      userId: user?.uid || 'guest',
      timestamp: new Date().toISOString(),
      data: analysisData,
    };
    
    reports.unshift(newReport); // Add to beginning
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    
    // Also save as last analysis for backward compatibility
    localStorage.setItem('airguard_last_analysis', JSON.stringify(analysisData));
    
    return newReport;
  } catch (error) {
    console.error('Failed to save report:', error);
    return null;
  }
}

/**
 * Get all saved reports
 */
export function getAllReports() {
  try {
    const stored = localStorage.getItem(REPORTS_KEY);
    if (!stored) return [];
    
    const reports = JSON.parse(stored);
    const user = getCurrentUser();
    
    // Filter by current user or show guest reports
    return reports.filter(r => r.userId === (user?.uid || 'guest'));
  } catch (error) {
    console.error('Failed to load reports:', error);
    return [];
  }
}

/**
 * Get a specific report by ID
 */
export function getReportById(reportId) {
  const reports = getAllReports();
  return reports.find(r => r.id === reportId);
}

/**
 * Delete a report
 */
export function deleteReport(reportId) {
  try {
    const reports = getAllReports();
    const allReports = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
    
    // Remove from all reports
    const updated = allReports.filter(r => r.id !== reportId);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    
    // If it was the last analysis, clear it
    const lastAnalysis = localStorage.getItem('airguard_last_analysis');
    if (lastAnalysis) {
      const parsed = JSON.parse(lastAnalysis);
      if (parsed.reportId === reportId) {
        localStorage.removeItem('airguard_last_analysis');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete report:', error);
    return false;
  }
}

/**
 * Load a report as current analysis
 */
export function loadReport(reportId) {
  const report = getReportById(reportId);
  if (report) {
    localStorage.setItem('airguard_last_analysis', JSON.stringify(report.data));
    return report.data;
  }
  return null;
}

/**
 * Clear all reports (for testing/cleanup)
 */
export function clearAllReports() {
  localStorage.removeItem(REPORTS_KEY);
  localStorage.removeItem('airguard_last_analysis');
}
