export const ENEMIES = {
  dog:   { name: '小狗', hp: 100, speed: 52, attack: 9,  range: 18,  atkRate: 0.8,  color: '#111827', bounty: 10, aoe: false },
  red:   { name: '紅色怪', hp: 180, speed: 50, attack: 12, range: 18,  atkRate: 0.85, color: '#ef4444', bounty: 14, aoe: false },
  boar:  { name: '野豬', hp: 240, speed: 44, attack: 13, range: 18,  atkRate: 0.9,  color: '#4b5563', bounty: 18, aoe: false },
  black: { name: '黑影怪', hp: 140, speed: 62, attack: 10, range: 18,  atkRate: 0.6,  color: '#0f172a', bounty: 12, aoe: false },
  alien: { name: '外星', hp: 160, speed: 56, attack: 11, range: 120, atkRate: 0.7,  color: '#7c3aed', bounty: 16, aoe: true, aoeRadius: 60 },
  metal: { name: '金屬怪', hp: 80, speed: 40, attack: 4,  range: 18,  atkRate: 0.5,  color: '#64748b', bounty: 8,  aoe: false },
};

export const BOSSES = {
  boarKing: { name: '野豬王', hp: 1200, speed: 38, attack: 22, range: 24,  atkRate: 0.9,  color: '#78350f', bounty: 80, aoe: false },
  alienEye: { name: '星眼巨像', hp: 900, speed: 42, attack: 26, range: 150, atkRate: 0.8,  color: '#4c1d95', bounty: 90, aoe: true, aoeRadius: 140, maxTargets: 6 },
  mechGolem:{ name: '機甲巨像', hp: 1600,speed: 34, attack: 28, range: 26,  atkRate: 0.75, color: '#334155', bounty: 100, aoe: false },
};
