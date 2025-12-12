export default function Card({ 
  children, 
  variant = 'default', 
  className = '',
  ...props 
}) {
  const variants = {
    default: 'bg-white shadow-card hover:shadow-premium',
    glass: 'glass-card',
    gradient: 'bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-100',
  }
  
  return (
    <div 
      className={`rounded-2xl p-6 transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
