export const BASE_CATS = {
  white: { name: '白喵', cost: 55, hp: 120, speed: 52, attack: 9, range: 22, atkRate: 0.8, color: '#ffffff', cd: 2.2 },
  tank:  { name: '坦喵', cost: 110, hp: 480, speed: 30, attack: 10, range: 20, atkRate: 0.9, color: '#d9f99d', cd: 2.7 },
  archer:{ name: '射喵', cost: 130, hp: 110, speed: 48, attack: 10, range: 120, atkRate: 0.58, color: '#bae6fd', cd: 2.5 },
  giant: { name: '巨人喵', cost: 480, hp: 1300, speed: 22, attack: 52, range: 38, atkRate: 1.1, color: '#ddd6fe', cd: 3.8 },
  bird:  { name: '鳥喵', cost: 180, hp: 170, speed: 72, attack: 14, range: 90, atkRate: 0.65, color: '#fef9c3', cd: 2.3 },
  fish:  { name: '魚喵', cost: 160, hp: 330, speed: 48, attack: 17, range: 24, atkRate: 0.62, color: '#a7f3d0', cd: 2.4 },
  lizard:{ name: '蜥蜴喵', cost: 380, hp: 360, speed: 34, attack: 30, range: 230, atkRate: 0.95, color: '#fca5a5', cd: 3.4 },
};

export const SHOP_UNLOCKS = {
  ninja:  { name: '忍者喵', price: 300, tpl: { name: '忍者喵', cost: 150, hp: 160, speed: 86, attack: 10, range: 48, atkRate: 0.42, color: '#fde68a', cd: 2.1 } },
  knight: { name: '騎士喵', price: 400, tpl: { name: '騎士喵', cost: 190, hp: 560, speed: 36, attack: 17, range: 24, atkRate: 0.75, color: '#fda4af', cd: 2.8 } },
  mage:   { name: '法師喵', price: 450, tpl: { name: '法師喵', cost: 210, hp: 190, speed: 44, attack: 14, range: 180, atkRate: 0.65, color: '#c4b5fd', cd: 3.0 } },
  samurai:{ name: '武士喵', price: 420, tpl: { name: '武士喵', cost: 200, hp: 520, speed: 40, attack: 20, range: 26, atkRate: 0.7, color: '#94a3b8', cd: 2.6 } },
  sumo:   { name: '相撲喵', price: 380, tpl: { name: '相撲喵', cost: 170, hp: 700, speed: 28, attack: 16, range: 20, atkRate: 0.8, color: '#fecaca', cd: 2.8 } },
  viking: { name: '維京喵', price: 460, tpl: { name: '維京喵', cost: 230, hp: 480, speed: 38, attack: 24, range: 30, atkRate: 0.75, color: '#bfdbfe', cd: 2.9 } },
  cow:    { name: '牛喵',   price: 350, tpl: { name: '牛喵',   cost: 140, hp: 220, speed: 110, attack: 10, range: 18, atkRate: 0.45, color: '#fef3c7', cd: 2.0 } },
};
