/**
 * Badge Component - Status badges with variants
 * Supports: success, warning, error, info, neutral
 */

import { forwardRef } from 'react'

export const Badge = forwardRef(({
  children,
  variant = 'neutral',    // 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size = 'md',            // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const variantClasses = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
  }

  const baseClasses = `
    inline-flex items-center gap-1.5
    font-bold text-xs uppercase tracking-wider rounded-lg
    transition-all duration-normal
  `.trim()

  return (
    <span
      ref={ref}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.neutral}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge
