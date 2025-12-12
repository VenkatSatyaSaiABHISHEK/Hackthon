export default function IconCard({ icon: Icon, title, description, className = '' }) {
  return (
    <div className={`group ${className}`}>
      <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">{title}</h3>
        <p className="text-neutral-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
