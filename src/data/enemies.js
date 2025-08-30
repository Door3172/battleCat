export const ENEMIES = {
  dog: { name: '小狗', hp: 90, speed: 20, attack: 9, range: 18, atkRate: 1.5, color: '#e3e5ebff', bounty: 20, aoe: false },
  snake: { name: '小蛇', hp: 160, speed: 25, attack: 20, range: 20, atkRate: 1.8, color: '#c5cce1ff', bounty: 30, aoe: true, aoeRadius: 20 },
  hippo: { name: '河馬', hp: 600, speed: 16, attack: 60, range: 20, atkRate: 3, color: '#a7a8abff', bounty: 160, aoe: true, aoeRadius: 20, maxTargets: 3 },
  red: { name: '紅色怪', hp: 280, speed: 50, attack: 22, range: 24, atkRate: 1.2, color: '#ef4444', bounty: 65, aoe: false }, //紅兔
  boar: { name: '野豬', hp: 495, speed: 27, attack: 10, range: 18, atkRate: 0.4, color: '#795e47ff', bounty: 95, aoe: false },
  black: { name: '黑影怪', hp: 120, speed: 95, attack: 60, range: 18, atkRate: 2.0, color: '#0f172a', bounty: 200, aoe: false },
  alien: { name: '外星', hp: 200, speed: 56, attack: 30, range: 80, atkRate: 2, color: '#7c3aed', bounty: 85, aoe: true, aoeRadius: 80, maxTargets: 2 },
  metal: { name: '金屬怪', hp: 40, speed: 40, attack: 33, range: 18, atkRate: 2, color: '#64748b', bounty: 100, aoe: false },
  elephant: { name: '大象', hp: 1200, speed: 12, attack: 200, range: 110, atkRate: 4.5, color: '#606469ff', bounty: 500, aoe: true, aoeRadius: 110 },
  snail: { name: '蝸牛', hp: 1600, speed: 7, attack: 15, range: 15, atkRate: 4, color: '#ba917dff', bounty: 160, aoe: true, aoeRadius: 30 },
  bull: { name: '公牛', hp: 900, speed: 30, attack: 280, range: 20, atkRate: 8, color: '#c25017ff', bounty: 450, aoe: true, aoeRadius: 20},
};

export const BOSSES = {
  boarKing: { name: '野豬王', hp: 3600, speed: 14, attack: 30, range: 24, atkRate: 0.3, color: '#78350f', bounty: 1200, aoe: true, aoeRadius: 16, maxTargets: 2 },
  alienEye: { name: '星眼巨像', hp: 1800, speed: 50, attack: 480, range: 175, atkRate: 4, color: '#4c1d95', bounty: 1500, aoe: true, aoeRadius: 175, aoeMinRadius: 30, maxTargets: 6 },
  mechGolem: { name: '機甲巨像', hp: 7000, speed: 11, attack: 240, range: 20, atkRate: 1.6, color: '#334155', bounty: 1600, aoe: true, aoeRadius: 70, maxTargets: 3 },
};
