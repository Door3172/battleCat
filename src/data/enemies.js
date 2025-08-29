export const ENEMIES = {
  dog: { name: '小狗', hp: 90, speed: 20, attack: 9, range: 18, atkRate: 1.5, color: '#e3e5ebff', bounty: 15, aoe: false },
  snake: { name: '小蛇', hp: 160, speed: 25, attack: 20, range: 20, atkRate: 1.8, color: '#c5cce1ff', bounty: 20, aoe: true, aoeRadius: 20 },
  hippo: { name: '河馬', hp: 600, speed: 16, attack: 60, range: 20, atkRate: 3, color: '#a7a8abff', bounty: 60, aoe: true, aoeRadius: 20, maxTargets: 3 },
  red: { name: '紅色怪', hp: 225, speed: 50, attack: 16, range: 24, atkRate: 1.2, color: '#ef4444', bounty: 36, aoe: false },
  boar: { name: '野豬', hp: 330, speed: 27, attack: 7, range: 18, atkRate: 0.4, color: '#795e47ff', bounty: 50, aoe: false },
  black: { name: '黑影怪', hp: 100, speed: 90, attack: 30, range: 18, atkRate: 1.5, color: '#0f172a', bounty: 100, aoe: false },
  alien: { name: '外星', hp: 160, speed: 56, attack: 24, range: 120, atkRate: 2, color: '#7c3aed', bounty: 50, aoe: true, aoeRadius: 60, maxTargets: 2 },
  metal: { name: '金屬怪', hp: 40, speed: 40, attack: 33, range: 18, atkRate: 2, color: '#64748b', bounty: 100, aoe: false },
};

export const BOSSES = {
  boarKing: { name: '野豬王', hp: 1800, speed: 14, attack: 15, range: 24, atkRate: 0.3, color: '#78350f', bounty: 600, aoe: true, aoeRadius: 16, maxTargets: 2 },
  alienEye: { name: '星眼巨像', hp: 900, speed: 50, attack: 240, range: 175, atkRate: 4, color: '#4c1d95', bounty: 680, aoe: true, aoeRadius: 175, maxTargets: 6 },
  mechGolem: { name: '機甲巨像', hp: 3500, speed: 11, attack: 120, range: 20, atkRate: 1.6, color: '#334155', bounty: 760, aoe: true, aoeRadius: 60, maxTargets: 3 },
};
