import { createPreset } from 'fumadocs-ui/tailwind-plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  presets: [createPreset({
    preset: {
      light: {
        background: '0 0% 98%',
        foreground: '220 14% 20%',
        muted: '220 13% 94%',
        'muted-foreground': '220 9% 46%',
        popover: '0 0% 100%',
        'popover-foreground': '220 14% 20%',
        card: '220 14% 96%',
        'card-foreground': '220 14% 20%',
        border: '220 13% 88%',
        primary: '215 70% 45%',
        'primary-foreground': '0 0% 100%',
        secondary: '220 13% 94%',
        'secondary-foreground': '220 14% 20%',
        accent: '220 13% 91%',
        'accent-foreground': '220 14% 20%',
        ring: '215 70% 45%',
      },
      dark: {
        background: '225 10% 11%',
        foreground: '220 13% 85%',
        muted: '225 10% 15%',
        'muted-foreground': '220 9% 55%',
        popover: '225 10% 9%',
        'popover-foreground': '220 13% 85%',
        card: '225 10% 13%',
        'card-foreground': '220 13% 85%',
        border: '225 8% 20%',
        primary: '210 60% 65%',
        'primary-foreground': '225 10% 9%',
        secondary: '225 10% 17%',
        'secondary-foreground': '220 13% 85%',
        accent: '225 8% 20%',
        'accent-foreground': '220 13% 85%',
        ring: '210 60% 65%',
      },
      css: {
        '.dark #nd-sidebar': {
          backgroundColor: 'hsl(225 10% 9.5%)',
        },
      },
    },
  })],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
};
