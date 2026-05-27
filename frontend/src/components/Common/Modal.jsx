/**
 * Modal Component - Reusable dialog/modal with consistent sizing and behavior
 */

import { forwardRef, useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = forwardRef(({
  open = false,
  onClose,
  title,
  children,
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl'
  closeButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = '',
}, ref) => {
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEsc) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, closeOnEsc, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'auto'
      }
    }
  }, [open])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-normal"
        onClick={closeOnBackdrop ? onClose : undefined}
        role={closeOnBackdrop ? 'button' : undefined}
        tabIndex={closeOnBackdrop ? 0 : undefined}
        onKeyDown={closeOnBackdrop ? (e) => e.key === 'Enter' && onClose?.() : undefined}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={ref}
          className={`
            bg-white rounded-xl shadow-2xl overflow-hidden
            pointer-events-auto transition-all duration-normal
            animate-slideUp
            w-full ${sizeClasses[size] || sizeClasses.md}
            ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-6 sm:py-8 border-b border-slate-100">
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                {title}
              </h2>
            )}
            <div className="flex-1" />
            {closeButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors duration-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded-md"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-6 sm:py-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
})

Modal.displayName = 'Modal'

/**
 * ModalBody - Wrapper for modal content
 */
export const ModalBody = forwardRef(({ children, className = '' }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
))

ModalBody.displayName = 'ModalBody'

/**
 * ModalFooter - For actions at bottom
 */
export const ModalFooter = forwardRef(({ children, className = '' }, ref) => (
  <div ref={ref} className={`flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100 ${className}`}>
    {children}
  </div>
))

ModalFooter.displayName = 'ModalFooter'

export default { Modal, ModalBody, ModalFooter }
