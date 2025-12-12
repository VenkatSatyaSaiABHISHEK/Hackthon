import { Sparkles } from 'lucide-react'

/**
 * DemoBadge Component
 * 
 * Displays a small badge indicating demo mode is active
 * Used across the app to show when demo data/credentials are being used
 * 
 * @param {string} message - Custom message to display (default: "Demo Mode")
 * @param {string} className - Additional CSS classes
 */
export default function DemoBadge({ message = "Demo Mode", className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-full text-xs font-semibold text-amber-800 ${className}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span>{message}</span>
    </div>
  )
}
