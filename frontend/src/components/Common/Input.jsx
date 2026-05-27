/**
 * Input Component - Reusable form input with validation states
 */

import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export const Input = forwardRef(({
  label,
  placeholder = '',
  error = null,
  disabled = false,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className={`
            w-full px-4 py-2.5 rounded-md border-2 transition-all duration-normal
            bg-white text-slate-900 font-normal text-sm
            placeholder:text-slate-400
            focus-visible:outline-none
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error
              ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200'
              : 'border-slate-200 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/10'
            }
            ${className}
          `}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs font-semibold">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

/**
 * Textarea Component - Multi-line input
 */
export const Textarea = forwardRef(({
  label,
  placeholder = '',
  error = null,
  disabled = false,
  value,
  onChange,
  onBlur,
  onFocus,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        rows={rows}
        className={`
          w-full px-4 py-2.5 rounded-md border-2 transition-all duration-normal
          bg-white text-slate-900 font-normal text-sm resize-vertical
          placeholder:text-slate-400
          focus-visible:outline-none
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${error
            ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200'
            : 'border-slate-200 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/10'
          }
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs font-semibold">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

/**
 * Select Component - Dropdown input
 */
export const Select = forwardRef(({
  label,
  placeholder = 'Select an option...',
  error = null,
  disabled = false,
  value,
  onChange,
  onBlur,
  options = [],
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full px-4 py-2.5 rounded-md border-2 transition-all duration-normal
          bg-white text-slate-900 font-normal text-sm appearance-none cursor-pointer
          focus-visible:outline-none
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${error
            ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200'
            : 'border-slate-200 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/10'
          }
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs font-semibold">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
})

Select.displayName = 'Select'

/**
 * Checkbox Component
 */
export const Checkbox = forwardRef(({
  label,
  checked = false,
  disabled = false,
  onChange,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={`
          w-4 h-4 rounded border-2 border-slate-200 bg-white
          text-brand-primary transition-all duration-normal
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary
          cursor-pointer
          ${className}
        `}
        {...props}
      />
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default { Input, Textarea, Select, Checkbox }
