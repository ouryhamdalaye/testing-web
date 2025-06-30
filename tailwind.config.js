/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      ringColor: {
        DEFAULT: '#e5e7eb', // gray-200
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 