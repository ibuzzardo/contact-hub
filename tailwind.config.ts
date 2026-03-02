import type { Config } from 'tailwindcss'

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
        'background-light': '#f5f7f8',
        'surface-light': '#ffffff',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
        'border-light': '#e2e8f0',
        'card-light': '#ffffff',
        'card-dark': '#1e293b',
        // Stage colors for deals pipeline
        'stage-lead': '#94a3b8',
        'stage-qualified': '#3b82f6',
        'stage-proposal': '#facc15',
        'stage-negotiation': '#f97316',
        'stage-won': '#10b981',
        'stage-lost': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config