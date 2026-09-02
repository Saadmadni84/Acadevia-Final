/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Acadevia Refined Color System: Refined Purple, Warm Cream Background, Educational Subject Accents
        primary: {
          DEFAULT: '#5B2C6F', // Acadevia Signature Refined Purple
          light: '#7B3F95',
          dark: '#3A1B47',
          soft: '#F0E8F4',
          hover: '#4A2359',
          50: '#F9F6FA',
          100: '#F0E8F4',
          200: '#DDBFE8',
          300: '#C393D7',
          400: '#9C5DBB',
          500: '#5B2C6F',
          600: '#4A2359',
          700: '#3A1B47',
          800: '#281132',
          900: '#190920'
        },
        secondary: {
          DEFAULT: '#159A8C', // Educational Teal (Science)
          light: '#2DD4BF',
          dark: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#159A8C',
        },
        accent: {
          DEFAULT: '#E85D75', // Warm Coral (English & Alerts)
          light: '#FB7185',
          dark: '#C73852',
          50: '#FFF1F2',
        },
        reward: {
          DEFAULT: '#D4A843', // Achievement Gold
          light: '#E5A11A',
          dark: '#B8860B',
          50: '#FFFBEB',
        },
        streak: {
          DEFAULT: '#F28C28', // Flame Streak Orange
          light: '#FB923C',
          dark: '#EA580C',
        },
        success: {
          DEFAULT: '#2E9D69', // Completed Green
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#E5A11A',
          light: '#FBBF24',
          dark: '#D97706',
        },
        background: {
          light: '#F8F5EF', // Warm Cream / Ivory Background (Reference B)
          dark: '#140D1A',  // Midnight Dark Mode
        },
        card: {
          light: '#FFFFFF', // Clean White Cards Contrasting with Cream
          dark: '#22152B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        float: 'float 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
