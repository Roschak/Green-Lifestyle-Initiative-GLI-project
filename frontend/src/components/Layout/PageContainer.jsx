/**
 * PageContainer Component
 * Wraps main page content with consistent padding, max-width, and background
 */
export function PageContainer({ children, maxWidth = '6xl', className = '' }) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }

  return (
    <div className={`w-full bg-slate-50 min-h-screen ${className}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${maxWidthClasses[maxWidth] || 'max-w-6xl'}`}>
        {children}
      </div>
    </div>
  )
}

/**
 * SectionContainer Component
 * For individual sections within pages
 */
export function SectionContainer({ children, title, description, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm ${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-2">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * GridContainer Component
 * Responsive grid wrapper for cards/items
 */
export function GridContainer({ children, cols = 3, gap = 'lg', className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    6: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }

  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-6 sm:gap-8',
  }

  return (
    <div className={`grid grid-cols-1 ${colClasses[cols] || colClasses[3]} ${gapClasses[gap] || gapClasses.lg} ${className}`}>
      {children}
    </div>
  )
}

export default { PageContainer, SectionContainer, GridContainer }
