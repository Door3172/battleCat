export const BASE_CATS = {
  white: { name: '白喵', cost: 50, hp: 100, speed: 21, attack: 12, range: 20, atkRate: 1.25, color: '#ffffff', cd: 2.0, aoe: false },
  tank: { name: '坦喵', cost: 100, hp: 600, speed: 10, attack: 4, range: 24, atkRate: 2.2, color: '#d9f99d', cd: 2.7, aoe: true, aoeRadius: 24, maxTargets: 5 },
  archer: { name: '射喵', cost: 130, hp: 120, speed: 50, attack: 9, range: 90, atkRate: 0.4, color: '#bae6fd', cd: 4.0, aoe: false },
  giant: { name: '巨人喵', cost: 750, hp: 2500, speed: 13, attack: 111, range: 35, atkRate: 1.7, color: '#ddd6fe', cd: 20.0, aoe: true, aoeRadius: 35, maxTargets: 3 },
  bird: { name: '鳥喵', cost: 200, hp: 150, speed: 80, attack: 56, range: 75, atkRate: 1.4, color: '#fef9c3', cd: 3.6, aoe: true, aoeRadius: 75, maxTargets: 2 },
  fish: { name: '魚喵', cost: 230, hp: 775, speed: 24, attack: 42, range: 24, atkRate: 1.5, color: '#a7f3d0', cd: 6.8, aoe: false },
  lizard: { name: '蜥蜴喵', cost: 350, hp: 300, speed: 18, attack: 130, range: 240, atkRate: 2.5, color: '#fca5a5', cd: 16.0, aoe: false },
};

export const SHOP_UNLOCKS = {
  ninja: { name: '忍者喵', price: 120, tpl: { name: '忍者喵', cost: 130, hp: 275, speed: 90, attack: 9, range: 30, atkRate: 0.4, color: '#fde68a', cd: 2.7, aoe: false } },
  knight: { name: '騎士喵', price: 300, tpl: { name: '騎士喵', cost: 210, hp: 960, speed: 65, attack: 100, range: 40, atkRate: 5, color: '#fda4af', cd: 4.8, aoe: false } },
  mage: { name: '法師喵', price: 390, tpl: { name: '法師喵', cost: 210, hp: 80, speed: 45, attack: 105, range: 140, atkRate: 2.4, color: '#c4b5fd', cd: 5.0, aoe: true, aoeRadius: 140 } },
  samurai: { name: '武士喵', price: 360, tpl: { name: '武士喵', cost: 240, hp: 540, speed: 25, attack: 30, range: 26, atkRate: 0.65, color: '#94a3b8', cd: 5.4, aoe: false } },
  sumo: { name: '相撲喵', price: 300, tpl: { name: '相撲喵', cost: 175, hp: 1250, speed: 36, attack: 2, range: 20, atkRate: 0.1, color: '#fecaca', cd: 3.0, aoe: true, aoeRadius: 20, maxTargets: 2 } },
  viking: { name: '維京喵', price: 400, tpl: { name: '維京喵', cost: 275, hp: 360, speed: 45, attack: 130, range: 24, atkRate: 1.0, color: '#bfdbfe', cd: 6.0, aoe: true, aoeRadius: 24, maxTargets: 3 } },
  cow: { name: '牛喵', price: 200, tpl: { name: '牛喵', cost: 150, hp: 400, speed: 110, attack: 8, range: 18, atkRate: 0.25, color: '#fef3c7', cd: 3.0, aoe: true, aoeRadius: 18, maxTargets: 2 } },
  jaycat: { name: '禁節貓娘', price: 520, tpl: { name: '禁節貓娘', cost: 10, hp: 1, speed: 30, attack: 1, range: 30, atkRate: 0.01, color: '#eb52c7ff', cd: 15.0, aoe: true, aoeRadius: 30 } },
  jay: { name: '禁節喵', price: 520, tpl: { name: '禁節喵', cost: 500, hp: 1, speed: 75, attack: 999, range: 20, atkRate: 10, color: '#f094e9ff', cd: 35.0, aoe: false } },
};
