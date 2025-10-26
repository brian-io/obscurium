import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        // Muted color palette
        colors: {
          charcoal: {
            50:  '#f5f5f3',
            100: '#e0dfdd',
            200: '#c6c5c3',
            300: '#a9a8a4',
            400: '#83827e',
            500: '#5f5e5b',  // neutral midtone
            600: '#4a4946',
            700: '#3b3a37',
            800: '#30302e',  // base
            900: '#1e1e1c',
          },
        }
        
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
      slideIn: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideOut: {
        '0%': { transform: 'translateX(0)', opacity: '1' },
        '100%': { transform: 'translateX(100%)', opacity: '0' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
    },
    transitionProperty: {
      'height': 'height',
      'spacing': 'margin, padding',
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
