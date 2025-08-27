export const ENEMIES = {
  dog: { name: '小狗', hp: 85, speed: 52, attack: 9, range: 18, atkRate: 1.2, color: '#e3e5ebff', bounty: 16, aoe: false },
  red: { name: '紅色怪', hp: 180, speed: 50, attack: 16, range: 18, atkRate: 1.2, color: '#ef4444', bounty: 36, aoe: false },
  boar: { name: '野豬', hp: 240, speed: 44, attack: 8, range: 18, atkRate: 0.7, color: '#795e47ff', bounty: 36, aoe: false },
  black: { name: '黑影怪', hp: 100, speed: 84, attack: 30, range: 18, atkRate: 1.5, color: '#0f172a', bounty: 80, aoe: false },
  alien: { name: '外星', hp: 130, speed: 56, attack: 16, range: 120, atkRate: 2, color: '#7c3aed', bounty: 30, aoe: true, aoeRadius: 60, maxTargets: 2 },
  metal: { name: '金屬怪', hp: 40, speed: 40, attack: 12, range: 18, atkRate: 2, color: '#64748b', bounty: 40, aoe: false },
};

export const BOSSES = {
  boarKing: { name: '野豬王', hp: 1200, speed: 20, attack: 15, range: 24, atkRate: 0.4, color: '#78350f', bounty: 480, aoe: true, aoeRadius: 16, maxTargets: 2 },
  alienEye: { name: '星眼巨像', hp: 900, speed: 50, attack: 180, range: 175, atkRate: 4, color: '#4c1d95', bounty: 600, aoe: true, aoeRadius: 175, maxTargets: 6 },
  mechGolem: { name: '機甲巨像', hp: 2100, speed: 15, attack: 64, range: 20, atkRate: 1.6, color: '#334155', bounty: 720, aoe: true, aoeRadius: 60, maxTargets: 3 },
};
