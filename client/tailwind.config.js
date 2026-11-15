/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gen Z & Modern Productivity Palette (Lilac, Charcoal, Cream, Coral, Mint)
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C65C1', // Signature Edvora Muted Lilac
          700: '#6951B4',
          800: '#543D99',
          900: '#3C2775',
          950: '#23144C',
        },
        coral: {
          50: '#FFF5F2',
          100: '#FFE8E2',
          200: '#FFD1C5',
          300: '#FFAFA0',
          400: '#FF8A73',
          500: '#FF6B52', // Warm Gen Z Coral Accent
          600: '#ED5136',
          700: '#C73B22',
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981', // Clean Mint/Sage for Positive States
          600: '#059669',
          700: '#047857',
        },
        charcoal: {
          50: '#F8F8FA',
          100: '#EFEFF3',
          200: '#E0DFE7',
          300: '#C8C6D4',
          400: '#9B98AC',
          500: '#716E85',
          600: '#4E4B61',
          700: '#343144',
          800: '#232135', // Deep Readable Charcoal
          900: '#171624',
          950: '#0E0D17',
        },
        cream: {
          50: '#FCFBF9',
          100: '#FAF9F5', // Warm Creamy Workspace Ground
          200: '#F4F2EC',
          300: '#EAE6DC',
          400: '#D8D3C4',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1E293B',
          900: '#181824',
          950: '#0F0E1A',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        surface: {
          ground: '#FAF9F5', // Warm aesthetic paper ground
          card: '#FFFFFF',
          subtle: '#F4F2EC',
          border: '#EAE7DF',
          hover: '#F7F5EF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        'soft': '0 2px 14px 0 rgba(28, 25, 45, 0.04)',
        'card': '0 4px 20px -2px rgba(28, 25, 45, 0.05), 0 2px 6px -1px rgba(28, 25, 45, 0.03)',
        'elevated': '0 12px 32px -4px rgba(28, 25, 45, 0.08), 0 4px 12px -2px rgba(28, 25, 45, 0.04)',
      }
    },
  },
  plugins: [],
}
