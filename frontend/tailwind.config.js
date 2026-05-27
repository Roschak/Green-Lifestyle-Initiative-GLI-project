/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // FONT FAMILIES
      // ============================================
      fontFamily: {
        inter: ['Inter', 'Geist', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'Geist', 'Poppins', 'sans-serif'],
      },

      // ============================================
      // COLOR PALETTE
      // ============================================
      colors: {
        // Primary Green (Brand)
        'brand': {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          primary: '#2D8F5D',
          hover: '#1E6B47',
          dark: '#0F4C2E',
        },

        // Extended Grays
        'slate': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // Semantic Colors
        'success': '#2D8F5D',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },

      // ============================================
      // SPACING (4px base unit)
      // ============================================
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },

      // ============================================
      // SHADOWS
      // ============================================
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        none: 'none',
      },

      // ============================================
      // TRANSITIONS & ANIMATIONS
      // ============================================
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },

      animation: {
        'fadeIn': 'fadeIn 200ms ease-out',
        'slideUp': 'slideUp 300ms ease-out',
        'slideDown': 'slideDown 300ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // ============================================
      // TYPOGRAPHY
      // ============================================
      fontSize: {
        xs: ['11px', { lineHeight: '1.2', fontWeight: '500' }],
        sm: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        base: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        lg: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        xl: ['18px', { lineHeight: '1.6', fontWeight: '700' }],
        '2xl': ['20px', { lineHeight: '1.6', fontWeight: '700' }],
        '3xl': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        '4xl': ['36px', { lineHeight: '1.2', fontWeight: '900' }],
      },

      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      // ============================================
      // Z-INDEX SCALE
      // ============================================
      zIndex: {
        hide: '-1',
        auto: 'auto',
        0: '0',
        base: '1',
        dropdown: '20',
        sticky: '30',
        fixed: '40',
        backdrop: '40',
        modal: '50',
        popover: '60',
        toast: '70',
      },

      // ============================================
      // WIDTH & HEIGHT (for consistent sizing)
      // ============================================
      width: {
        sidebar: '256px',
        'content-max': '1152px',
      },

      // ============================================
      // CONTAINER QUERIES
      // ============================================
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1280px',
        },
      },
    },
  },

  plugins: [],
}