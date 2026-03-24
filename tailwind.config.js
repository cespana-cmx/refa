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
        bg1: '#0E0C1E',
        bg2: '#16132A',
        bg3: '#1E1A38',
        purple: {
          DEFAULT: '#534AB7',
          mid: '#AFA9EC',
          light: '#EEEDFE',
          dark: '#3D3589',
          hover: '#6B62CC',
        },
        teal: {
          DEFAULT: '#0F6E56',
          mid: '#5DCAA5',
        },
        amber: {
          DEFAULT: '#BA7517',
          mid: '#EF9F27',
        },
        text: {
          primary: '#E8E6FF',
          secondary: '#9994CC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'purple-glow': 'radial-gradient(circle at 50% 0%, rgba(83, 74, 183, 0.15), transparent 70%)',
      },
      boxShadow: {
        'purple-glow': '0 0 20px rgba(83, 74, 183, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
