export default function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  trend,
  status = 'normal',
  className = '' 
}) {
  const statusColors = {
    good: 'from-green-500 to-emerald-500',
    normal: 'from-primary-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    danger: 'from-red-500 to-rose-500',
  }
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusColors[status]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-neutral-800">{value}</span>
        {unit && <span className="text-lg text-neutral-500">{unit}</span>}
      </div>
    </div>
  )
}
