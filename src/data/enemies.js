export const ENEMIES = {
  dog: { name: '小狗', hp: 90, speed: 20, attack: 9, range: 18, atkRate: 1.5, color: '#e3e5ebff', bounty: 15, aoe: false },
  snake: { name: '小蛇', hp: 160, speed: 25, attack: 20, range: 20, atkRate: 1.8, color: '#c5cce1ff', bounty: 25, aoe: true, aoeRadius: 20 },
  hippo: { name: '河馬', hp: 600, speed: 16, attack: 60, range: 20, atkRate: 3, color: '#a7a8abff', bounty: 75, aoe: true, aoeRadius: 20, maxTargets: 3 },
  red: { name: '紅色怪', hp: 280, speed: 50, attack: 20, range: 24, atkRate: 1.2, color: '#ef4444', bounty: 36, aoe: false }, //紅兔
  boar: { name: '野豬', hp: 495, speed: 27, attack: 10, range: 18, atkRate: 0.4, color: '#795e47ff', bounty: 50, aoe: false },
  black: { name: '黑影怪', hp: 120, speed: 90, attack: 45, range: 18, atkRate: 1.5, color: '#0f172a', bounty: 120, aoe: false },
  alien: { name: '外星', hp: 160, speed: 56, attack: 24, range: 80, atkRate: 2, color: '#7c3aed', bounty: 60, aoe: true, aoeRadius: 50, maxTargets: 2 },
  metal: { name: '金屬怪', hp: 40, speed: 40, attack: 33, range: 18, atkRate: 2, color: '#64748b', bounty: 100, aoe: false },
  elephant: { name: '大象', hp: 1200, speed: 12, attack: 200, range: 100, atkRate: 4.5, color: '#606469ff', bounty: 360, aoe: true, aoeRadius: 100 },
  snail: { name: '蝸牛', hp: 1000, speed: 2, attack: 15, range: 15, atkRate: 4, color: '#ba917dff', bounty: 80, aoe: true, aoeRadius: 15 },
  bull: { name: '公牛', hp: 900, speed: 70, attack: 250, range: 20, atkRate: 8, color: '#c25017ff', bounty: 200, aoe: true, aoeRadius: 50, maxTargets: 3 },
};

export const BOSSES = {
  boarKing: { name: '野豬王', hp: 3600, speed: 14, attack: 30, range: 24, atkRate: 0.3, color: '#78350f', bounty: 750, aoe: true, aoeRadius: 16, maxTargets: 2 },
  alienEye: { name: '星眼巨像', hp: 1800, speed: 50, attack: 480, range: 175, atkRate: 4, color: '#4c1d95', bounty: 800, aoe: true, aoeRadius: 175, maxTargets: 6 },
  mechGolem: { name: '機甲巨像', hp: 7000, speed: 11, attack: 240, range: 20, atkRate: 1.6, color: '#334155', bounty: 900, aoe: true, aoeRadius: 60, maxTargets: 3 },
};
