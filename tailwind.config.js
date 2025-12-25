/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background layers
        'bg-base': '#0D0F12',
        'bg-sidebar': '#0A0C0F',
        'bg-surface': '#141820',
        'bg-elevated': '#1A1F28',

        // Legacy mappings
        'terminal-bg': '#0D0F12',
        'terminal-fg': '#94A3B8',
        'sidebar-bg': '#0A0C0F',
        'sidebar-hover': '#141820',

        // Accent - Electric Cyan
        'accent': '#00D9FF',
        'accent-hover': '#33E1FF',
        'accent-muted': '#0891B2',

        // Semantic
        'danger': '#EF4444',
        'success': '#10B981',
        'warning': '#F59E0B',

        // Text
        'text-primary': '#F0F4F8',
        'text-secondary': '#94A3B8',
        'text-muted': '#475569',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'slide-in-bounce': 'slide-in-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'scale-in-bounce': 'scale-in-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-up-bounce': 'fade-up-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring-snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 217, 255, 0.15)',
        'glow': '0 0 20px rgba(0, 217, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 217, 255, 0.25)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.2)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
}
