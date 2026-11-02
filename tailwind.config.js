/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // 與 styles.css 的字型變數一致（Inter / Noto Sans TC 網路字型已移除，UI-014）
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
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
