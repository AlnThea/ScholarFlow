import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'hsl(var(--surface) / <alpha-value>)',
        panel: 'hsl(var(--panel) / <alpha-value>)',
        line: 'hsl(var(--line) / <alpha-value>)',
        text: 'hsl(var(--text) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        accentSoft: 'hsl(var(--accent-soft) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 24px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
