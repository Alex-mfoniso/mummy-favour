/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#246B45', // Primary forest green
            hover: '#1D5838',
            active: '#17472D',
            light: '#EAF3ED',
            subtle: '#D3E6DA',
            muted: '#4A8564',
          },
          charcoal: {
            DEFAULT: '#252A27', // Deep charcoal
            subtle: '#3A403C',
            muted: '#5C635F',
            light: '#88918C',
          },
          warm: {
            DEFAULT: '#F5F4EF', // Warm white
            card: '#FAF9F6',
            hover: '#EFECE3',
          },
          border: {
            subtle: '#E6E4DD',
            DEFAULT: '#D8D5CB',
            strong: '#B4B0A2',
          },
          surface: {
            white: '#FFFFFF',
            muted: '#F5F4EF',
            highlight: '#EAF3ED',
          }
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(37, 42, 39, 0.05)',
        card: '0 1px 3px 0 rgba(37, 42, 39, 0.06), 0 1px 2px -1px rgba(37, 42, 39, 0.04)',
        elevated: '0 4px 6px -1px rgba(37, 42, 39, 0.07), 0 2px 4px -2px rgba(37, 42, 39, 0.05)',
        dropdown: '0 10px 15px -3px rgba(37, 42, 39, 0.08), 0 4px 6px -4px rgba(37, 42, 39, 0.04)',
      },
      borderRadius: {
        card: '0.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-up': 'fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-down': 'fadeSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
