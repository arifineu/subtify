import type { Config } from 'tailwindcss'

const config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'subtify-bg': '#0f0f0f',
        'subtify-surface': '#1a1a1a',
        'subtify-accent': '#ff0000',
        'subtify-text': '#f1f1f1',
        'subtify-muted': '#aaaaaa',
      },
      borderRadius: {
        input: '4px',
        card: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
} satisfies Config

export default config
