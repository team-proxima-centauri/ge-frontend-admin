import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        // Admin theme colors
        'admin-primary': '#3b82f6',
        'admin-secondary': '#10b981',
        'admin-background': '#f9fafb',
        'admin-card': '#ffffff',
        'admin-text': '#1f2937',
        'admin-text-secondary': '#6b7280',

        // Legacy choco colors
        choco: {
          bg: '#FFE9DA',
          card: '#FFD0A1',
          sidebar: '#FFD9CC',
          chocobtn: '#915D26',
          brown: 'rgb(75, 52, 32)',
          brown2: 'rgb(120, 100, 82)',
          selected: '#D9BAAF',
          primary: '#000000',
          redbtn: '#FB4747',
          greenbtn: '#0B7D1C',
        },
        // New chocolate-brown theme
        primary: {
          DEFAULT: '#5D4037',
          dark: '#3E2723',
          light: '#8D6E63',
        },
        secondary: {
          DEFAULT: '#D7CCC8',
          light: '#BCAAA4',
        },
        accent: {
          ivory: '#EFEBE9',
          green: '#4E6151',
        },
        groceryease: {
          bg: '#FFF8F3',
          surface: '#F5E9DF',
          text: '#222222',
          textSecondary: '#555555',
          border: '#A1887F',
        },
        status: {
          success: '#2E7D32',
          warning: '#F9A825',
          error: '#C62828',
          info: '#0277BD',
        },
      },
    },
  },
  plugins: [],
};
export default config;
