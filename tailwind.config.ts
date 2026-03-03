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
        primary: '#E64626',
        'primary-dark': '#A83420',
        'primary-light': '#D85038',
        'background-light': '#f5f7f8',
        'surface-light': '#ffffff',
        'text-main': '#2C2C2C',
        'text-muted': '#888888',
        'border-light': '#E0D6CC',
        'card-light': '#ffffff',
        'card-dark': '#1e293b',
        'sandstone': '#FBEEE2',
        'ochre-dark': '#A83420',
        'ochre-med': '#C63E24',
        'stage-lead': '#94a3b8',
        'stage-qualified': '#3b82f6',
        'stage-proposal': '#facc15',
        'stage-negotiation': '#f97316',
        'stage-won': '#10b981',
        'stage-lost': '#ef4444',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;