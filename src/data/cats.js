export const BASE_CATS = {
  white:  { name: '白喵', cost: 50,  hp: 75,  speed: 52, attack: 7,  range: 20,  atkRate: 0.8,  color: '#ffffff', cd: 1.9, aoe: false },
  tank:   { name: '坦喵', cost: 110, hp: 500,  speed: 30, attack: 10, range: 24,  atkRate: 1.5,  color: '#d9f99d', cd: 2.4, aoe: true, aoeRadius: 24, maxTargets: 3  },
  archer: { name: '射喵', cost: 130, hp: 105,  speed: 48, attack: 8,  range: 105, atkRate: 0.5, color: '#bae6fd', cd: 3.6, aoe: false },
  giant:  { name: '巨人喵', cost: 690, hp: 1675, speed: 22, attack: 60, range: 38,  atkRate: 1.3,  color: '#ddd6fe', cd: 19.0, aoe: true, aoeRadius: 38, maxTargets: 3 },
  bird:   { name: '鳥喵', cost: 200, hp: 150,  speed: 72, attack: 24, range: 75,  atkRate: 0.65, color: '#fef9c3', cd: 4.0, aoe: true, aoeRadius: 75, maxTargets: 2 },
  fish:   { name: '魚喵', cost: 180, hp: 380,  speed: 40, attack: 23, range: 24,  atkRate: 0.8, color: '#a7f3d0', cd: 4.9, aoe: false },
  lizard: { name: '蜥蜴喵', cost: 320, hp: 280,  speed: 34, attack: 36, range: 240, atkRate: 0.95, color: '#fca5a5', cd: 7.0, aoe: false },
};

export const SHOP_UNLOCKS = {
  ninja:   { name: '忍者喵', price: 300, tpl: { name: '忍者喵', cost: 150, hp: 160, speed: 86, attack: 9,  range: 50, atkRate: 0.45, color: '#fde68a', cd: 2.7, aoe: false } },
  knight:  { name: '騎士喵', price: 400, tpl: { name: '騎士喵', cost: 200, hp: 575, speed: 50, attack: 16, range: 24, atkRate: 0.8, color: '#fda4af', cd: 4.0, aoe: false } },
  mage:    { name: '法師喵', price: 450, tpl: { name: '法師喵', cost: 210, hp: 80,  speed: 44, attack: 50, range: 140, atkRate: 1.6, color: '#c4b5fd', cd: 4.0, aoe: true, aoeRadius: 120 } },
  samurai: { name: '武士喵', price: 420, tpl: { name: '武士喵', cost: 225, hp: 480, speed: 40, attack: 25, range: 26, atkRate: 0.7, color: '#94a3b8', cd: 4.4, aoe: false } },
  sumo:    { name: '相撲喵', price: 380, tpl: { name: '相撲喵', cost: 175, hp: 800, speed: 30, attack: 5,  range: 20, atkRate: 0.6, color: '#fecaca', cd: 3.0, aoe: false } },
  viking:  { name: '維京喵', price: 460, tpl: { name: '維京喵', cost: 250, hp: 390, speed: 38, attack: 30, range: 24, atkRate: 0.75, color: '#bfdbfe', cd: 4.0, aoe: true, aoeRadius: 24, maxTargets: 2 } },
  cow:     { name: '牛喵',   price: 350, tpl: { name: '牛喵',   cost: 140, hp: 220, speed: 110, attack: 8,  range: 18, atkRate: 0.3,  color: '#fef3c7', cd: 3.0, aoe: false } },
};
