import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef9f2',
          100: '#d9f2e1',
          200: '#b5e6c5',
          300: '#86d3a0',
          400: '#54bb72',
          500: '#2f9a52',
          600: '#267d43',
          700: '#1f6437',
          800: '#1a4f2d',
          900: '#153f25',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(47, 154, 82, 0.18), 0 20px 45px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 1px 1px, rgba(47,154,82,0.22) 1px, transparent 0)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
