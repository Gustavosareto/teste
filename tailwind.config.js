/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        success: {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success-text)',
        },
        error: {
          bg: 'var(--color-error-bg)',
          text: 'var(--color-error-text)',
        },
        warning: {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning-text)',
        },
      },
    },
  },
  plugins: [],
}
