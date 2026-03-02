import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3c83f6',
        'primary-dark': '#2563eb',
        'primary-light': '#60a5fa',
        'background-light': '#f5f7f8',
        'surface-light': '#ffffff',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
        'border-light': '#e2e8f0',
      },
    },
  },
  plugins: [],
};

export default config;