/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#5B2C6F', light: '#7B3F95', dark: '#4A2359', 50: '#F5F0F7', 100: '#E8DBF0', 200: '#D1B7E1', 300: '#B98FD1', 400: '#9B5FB8', 500: '#5B2C6F', 600: '#4A2359', 700: '#3A1B47', 800: '#2A1335', 900: '#1A0C22' },
        secondary: { DEFAULT: '#D4A843', light: '#E0BE6A', dark: '#B08B2E' },
        accent: { DEFAULT: '#E74C3C', light: '#EE7B6E', dark: '#C0392B' },
        warning: { DEFAULT: '#F39C12', light: '#F5B041', dark: '#D68910' },
        background: { light: '#FBF7F4', dark: '#1A0F1E' },
        card: { light: '#FFFFFF', dark: '#241530' },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-glow': { '0%, 100%': { boxShadow: '0 0 5px rgba(91,44,111,0.3)' }, '50%': { boxShadow: '0 0 20px rgba(91,44,111,0.6)' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
