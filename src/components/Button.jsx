import { Link } from 'react-router-dom'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  to, 
  href,
  className = '',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'text-white bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    secondary: 'text-primary-700 bg-white border-2 border-primary-200 hover:border-primary-400 shadow-md hover:shadow-lg',
    outline: 'text-primary-600 border-2 border-primary-600 hover:bg-primary-50',
    ghost: 'text-neutral-700 hover:bg-neutral-100',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
