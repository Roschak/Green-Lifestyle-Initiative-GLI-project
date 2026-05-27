/**
 * Card Component - Reusable container with variants
 * Supports: default, elevated, interactive, status
 */

import { forwardRef } from 'react'

export const Card = forwardRef(({
  children,
  variant = 'default',      // 'default' | 'elevated' | 'interactive' | 'status'
  status = null,            // 'success' | 'warning' | 'error' | 'info' (for status variant)
  padding = 'lg',           // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  onClick = null,
  ...props
}, ref) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  }

  const variantClasses = {
    default: 'bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-normal hover:shadow-md hover:border-slate-300',
    elevated: 'bg-white rounded-xl shadow-md border border-slate-100 transition-all duration-normal',
    interactive: 'bg-white rounded-lg border border-slate-200 shadow-sm cursor-pointer transition-all duration-normal hover:shadow-md hover:border-slate-300 hover:scale-[1.02]',
    status: 'bg-white rounded-lg border-l-4 border-r border-t border-b border-slate-200 shadow-sm transition-all duration-normal',
  }

  const statusColors = {
    success: 'border-l-green-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  }

  let baseClass = variantClasses[variant] || variantClasses.default

  // Apply status color if variant is status
  if (variant === 'status' && status && statusColors[status]) {
    baseClass = baseClass.replace('border-l-4', statusColors[status])
  }

  return (
    <div
      ref={ref}
      className={`${baseClass} ${paddingClasses[padding] || paddingClasses.lg} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

/**
 * CardHeader - For card titles and descriptions with optional action
 */
export const CardHeader = forwardRef(({ title, description, action, className = '' }, ref) => (
  <div ref={ref} className={`flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100 ${className}`}>
    <div className="flex-1 min-w-0">
      {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
))

CardHeader.displayName = 'CardHeader'

/**
 * CardBody - Main content area
 */
export const CardBody = forwardRef(({ children, className = '' }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
))

CardBody.displayName = 'CardBody'

/**
 * CardFooter - For actions at bottom
 */
export const CardFooter = forwardRef(({ children, className = '' }, ref) => (
  <div ref={ref} className={`flex items-center gap-3 mt-6 pt-6 border-t border-slate-100 ${className}`}>
    {children}
  </div>
))

CardFooter.displayName = 'CardFooter'

export default { Card, CardHeader, CardBody, CardFooter }
