/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MasterClass & Cinematic Educational Identity: Dark Charcoal / Electric Blue / Cyan / Gold / Orange
        primary: {
          DEFAULT: '#3B82F6', // Electric Royal Blue
          light: '#60A5FA',
          dark: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#06B6D4', // Vibrant Cyan / Educational Teal
          light: '#22D3EE',
          dark: '#0891B2',
          50: '#ECFEFF',
          100: '#CFFAFE',
          500: '#06B6D4',
        },
        accent: {
          DEFAULT: '#F43F5E', // Warm Coral
          light: '#FB7185',
          dark: '#E11D48',
          50: '#FFF1F2',
        },
        reward: {
          DEFAULT: '#F5B942', // Cinematic Golden Scholar
          light: '#FCD34D',
          dark: '#D97706',
          50: '#FFFBEB',
        },
        streak: {
          DEFAULT: '#FF8A1F', // Energetic Orange
          light: '#FB923C',
          dark: '#EA580C',
        },
        dark: {
          bg: '#080B10', // Deepest Obsidian Dark
          surface: '#0E141E', // Dark Card Surface
          elevated: '#151E2B', // Elevated Card Surface
          border: '#1E293B', // Subtle Charcoal Border
          muted: '#64748B',
          text: '#F8FAFC',
          subtext: '#94A3B8',
        },
        background: {
          light: '#080B10', // Default dark cinematic background
          dark: '#080B10',
        },
        card: {
          light: '#0E141E',
          dark: '#0E141E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        float: 'float 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
