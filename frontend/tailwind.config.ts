import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FBFAF7',
        surface: '#FFFFFF',
        ink: '#17160F',
        muted: '#6F6D62',
        border: '#E7E4DA',
        accent: '#2F3B2C',
        error: '#B3432C',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;