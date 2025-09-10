/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Noto Sans TC', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        ink: 'var(--color-ink)',
        bg: 'var(--color-bg)',
        ok: 'var(--color-ok)',
        warn: 'var(--color-warn)',
        danger: 'var(--color-danger)',
      },
      boxShadow: {
        soft: "0 6px 16px rgba(2,6,23,.06), 0 2px 6px rgba(2,6,23,.06)",
        card: "0 14px 36px rgba(2,6,23,.10), 0 4px 14px rgba(2,6,23,.06)",
        lift: "0 10px 18px rgba(2,6,23,.08)"
      }
    },
  },
  plugins: [],
};
