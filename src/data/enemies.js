export const ENEMIES = {
  //dog: { name: '小狗', hp: 90, speed: 20, attack: 9, range: 18, atkRate: 1.5, color: '#e3e5ebff', bounty: 20, aoe: false, abilities: { dodge: { chance: 0.1 } } }, // 閃避 dodge：10% 機率無視傷害
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
  bull: { name: '公牛', hp: 900, speed: 105, attack: 280, range: 20, atkRate: 8, color: '#c25017ff', bounty: 450, aoe: true, aoeRadius: 55, maxTargets: 3 },

  clownfish: { name: '小丑魚', hp: 130, speed: 33, attack: 15, range: 20, atkRate: 2, color: '#f45f03ff', bounty: 27, aoe: false },
  angelfish: { name: '神仙魚', hp: 175, speed: 40, attack: 8, range: 20, atkRate: 1.6, color: '#ffe9dcff', bounty: 35, aoe: false },
  pufferfish: { name: '河豚', hp: 250, speed: 26, attack: 300, range: 20, atkRate: 10, color: '#d3b23dff', bounty: 90, aoe: true, aoeRadius: 50, abilities: { knockback: { chance: 1, distance: 15 } } },
  hermitCrab: { name: '寄居蟹', hp: 750, speed: 15, attack: 90, range: 30, atkRate: 3, color: '#e1ac62ff', bounty: 200, aoe: true, aoeRadius: 30, maxTargets: 3, abilities: { shield: { interval: 45, amount: 500 } } },
  babySquid: { name: '小墨魚', hp: 190, speed: 25, attack: 110, range: 85, atkRate: 2.2, color: '#ba4e55ff', bounty: 80, aoe: true, aoeRadius: 85, maxTargets: 3, abilities: { slow: { chance: 0.4, duration: 0.9, factor: 0.7 } } },
  octopusling: { name: '小章魚', hp: 330, speed: 42, attack: 42, range: 45, atkRate: 1.7, color: '#ce3757ff', bounty: 100, aoe: true, aoeRadius: 45, maxTargets: 5, abilities: { revive: { chance: 0.5, percent: 0.1 } } },
  dolphin: { name: '海豚', hp: 850, speed: 150, attack: 90, range: 45, atkRate: 3.0, color: '#91c4cdc4', bounty: 300, aoe: true, aoeRadius: 85, aoeMinRadius: 10, maxTargets: 3, abilities: { knockback: { chance: 0.6, distance: 15 } } },
  spermWhale: { name: '抹香鯨', hp: 5000, speed: 13, attack: 850, range: 20, atkRate: 7.2, color: '#64e4dcc4', bounty: 2500, aoe: true, aoeRadius: 20, abilities: { slowImmune: true, knockbackImmune: true } },
  colossalLobster: { name: '巨龍蝦', hp: 1350, speed: 18, attack: 175, range: 55, atkRate: 2.7, color: '#fb3f1ac4', bounty: 800, aoe: true, aoeRadius: 55, maxTargets: 2, abilities: { shield: { interval: 120, amount: 300 } } },
};

export const BOSSES = {
  boarKing: { name: '野豬王', hp: 3600, speed: 14, attack: 30, range: 24, atkRate: 0.3, color: '#78350f', bounty: 1200, aoe: true, aoeRadius: 16, maxTargets: 2 },
  alienEye: { name: '星眼巨像', hp: 1800, speed: 50, attack: 480, range: 175, atkRate: 4, color: '#4c1d95', bounty: 1500, aoe: true, aoeRadius: 175, aoeMinRadius: 30, maxTargets: 6 },
  mechGolem: { name: '機甲巨像', hp: 7000, speed: 11, attack: 240, range: 20, atkRate: 1.6, color: '#334155', bounty: 1600, aoe: true, aoeRadius: 70, maxTargets: 3, abilities: { slowImmune: true } },
  octopusKing: { name: '章魚王', hp: 5000, speed: 22, attack: 160, range: 110, atkRate: 1.8, color: '#de2e42ff', bounty: 1600, aoe: true, aoeRadius: 110, maxTargets: 8, abilities: { knockback: { chance: 0.3, distance: 8 } } },
  ghostShark: { name: '幽靈鯊', hp: 3500, speed: 50, attack: 500, range: 40, atkRate: 1.6, color: '#206facff', bounty: 2100, aoe: false, abilities: { lifesteal: { chance: 0.05, percent: 0.03 }, berserk: { threshold: 0.2, attackUp: 1 }, dodge: { chance: 0.2 }, freezeImmune: true, knockbackImmune: true, slowImmune: true } },
};
