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
        // You can define admin-specific colors here if needed
        'admin-primary': '#3b82f6', // Example blue
        'admin-secondary': '#10b981', // Example green
        'admin-background': '#f9fafb', // Light gray background
        'admin-card': '#ffffff',
        'admin-text': '#1f2937',
        'admin-text-secondary': '#6b7280',
      },
    },
  },
  plugins: [],
};
export default config;
