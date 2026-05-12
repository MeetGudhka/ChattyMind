/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        glass: 'rgba(255, 255, 255, 0.08)',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
        textPrimary: '#f0f4ff',
        textSecondary: '#8ea8c3',
        active: '#00ffaa',
        danger: '#ff4f7b',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(0, 207, 255, 0.5)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        bounceDelay: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease-out forwards',
        slideDown: 'slideDown 0.4s ease-out forwards',
        slideInLeft: 'slideInLeft 0.4s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        bounceDelay: 'bounceDelay 1.4s infinite ease-in-out both',
        shimmer: 'shimmer 2s infinite',
      }
    },
  },
  plugins: [],
}
