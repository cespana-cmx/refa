/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // All colors use CSS variables so they respond to theme changes
        bg1: 'var(--bg1)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        border: 'var(--border)',
        purple: {
          DEFAULT: 'var(--purple)',
          mid: 'var(--purple-mid)',
          light: 'var(--purple-light)',
          dark: 'var(--purple-dark)',
          hover: 'var(--purple)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
          mid: 'var(--teal-mid)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          mid: 'var(--amber-mid)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'purple-glow': 'var(--shadow-glow)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
