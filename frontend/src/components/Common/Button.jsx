/**
 * Button Component - Reusable across frontend and admin
 * Supports 4 variants: primary, secondary, danger, ghost
 * Supports 4 sizes: xs, sm, md, lg
 */

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export const Button = forwardRef(({
  children,
  variant = 'primary',      // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',              // 'xs' | 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',    // 'left' | 'right'
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-hover disabled:bg-slate-300 disabled:text-slate-500',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:text-red-100',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent',
  }

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-bold uppercase tracking-wider
    rounded-md
    transition-all duration-normal
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary
    disabled:cursor-not-allowed disabled:opacity-60
    ${fullWidth ? 'w-full' : ''}
  `.trim()

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {Icon && iconPosition === 'left' && !loading && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon size={16} />}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
