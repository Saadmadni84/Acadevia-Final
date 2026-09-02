/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Human-designed educational palette: Deep Ink Navy, Educational Teal, Warm Coral, Golden XP
        primary: {
          DEFAULT: '#1E3A8A', // Deep Academic Navy
          light: '#2563EB',
          dark: '#0F172A',
          50: '#F0F5FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#6086FA',
          500: '#1E3A8A',
          600: '#172554',
          700: '#0F172A',
          800: '#0B1120',
          900: '#020617'
        },
        secondary: {
          DEFAULT: '#0D9488', // Educational Teal
          light: '#14B8A6',
          dark: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#0D9488',
        },
        accent: {
          DEFAULT: '#F43F5E', // Warm Coral
          light: '#FB7185',
          dark: '#E11D48',
          50: '#FFF1F2',
        },
        reward: {
          DEFAULT: '#F59E0B', // Golden Scholar Yellow
          light: '#FBBF24',
          dark: '#D97706',
          50: '#FFFBEB',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        background: {
          light: '#FAF9F6', // Warm Ivory / Off-White
          dark: '#0B1120', // Refined Deep Midnight
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
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
