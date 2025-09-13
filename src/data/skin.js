const cssVar = (name) => {
  const el = document.body || document.documentElement;
  return getComputedStyle(el).getPropertyValue(name).trim();
};

export const SKIN = {
  color: {
    get primary() { return cssVar('--color-primary'); },
    get primaryHover() { return cssVar('--color-primary-hover'); },
    get secondary() { return cssVar('--color-secondary'); },
    get secondaryHover() { return cssVar('--color-secondary-hover'); },
    get ink() { return cssVar('--color-ink'); },
    get inkSub() { return cssVar('--color-ink-sub'); },
    get mute() { return cssVar('--color-mute'); },
    get line() { return cssVar('--color-line'); },
    get bgTop() { return cssVar('--color-bg-top'); },
    get bgBottom() { return cssVar('--color-bg-bottom'); },
    get cardTop() { return cssVar('--color-card-top'); },
    get cardBottom() { return cssVar('--color-card-bottom'); },
    get accentA() { return cssVar('--color-accent-a'); },
    get accentB() { return cssVar('--color-accent-b'); },
    get ok() { return cssVar('--color-ok'); },
    get warn() { return cssVar('--color-warn'); },
    get danger() { return cssVar('--color-danger'); },
    get white() { return cssVar('--color-white'); },
    get black() { return cssVar('--color-black'); },
  },
  font: {
    get sans() { return cssVar('--font-sans'); },
    get display() { return cssVar('--font-display'); },
  },
  size: { touch: 44, gapSm: 8, gapMd: 16, gapLg: 24, gapXl: 32, padSm: 8, padMd: 16, padLg: 24 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    get soft() { return cssVar('--shadow-soft') || '0 6px 16px rgba(2,6,23,.06), 0 2px 6px rgba(2,6,23,.06)'; },
    get card() { return cssVar('--shadow-card') || '0 14px 36px rgba(2,6,23,.10), 0 4px 14px rgba(2,6,23,.06)'; },
    get lift() { return cssVar('--shadow-lift') || '0 10px 18px rgba(2,6,23,.08)'; },
  },
  grad: {
    hero: (a,b)=>`linear-gradient(180deg, ${a} 0%, ${b} 62%, #ffd87a 100%)`,
    card: (a,b)=>`linear-gradient(180deg, ${a}, ${b})`,
  },
};
