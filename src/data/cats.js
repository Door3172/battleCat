export const BASE_CATS = {
  white: { name: '白喵', cost: 50, hp: 150, speed: 10, attack: 12, range: 20, atkRate: 1.23, color: '#ffffff', cd: 4.3, aoe: false },
  tank: { name: '坦喵', cost: 100, hp: 600, speed: 8, attack: 3, range: 24, atkRate: 2.23, color: '#d9f99d', cd: 7.3, aoe: true, aoeRadius: 24, maxTargets: 5 },
  archer: { name: '射喵', cost: 130, hp: 105, speed: 48, attack: 7, range: 105, atkRate: 0.42, color: '#bae6fd', cd: 4.0, aoe: false },
  giant: { name: '巨人喵', cost: 750, hp: 1725, speed: 20, attack: 81, range: 38, atkRate: 1.7, color: '#ddd6fe', cd: 20.0, aoe: true, aoeRadius: 38, maxTargets: 3 },
  bird: { name: '鳥喵', cost: 200, hp: 150, speed: 75, attack: 28, range: 75, atkRate: 0.72, color: '#fef9c3', cd: 3.6, aoe: true, aoeRadius: 75, maxTargets: 2 },
  fish: { name: '魚喵', cost: 210, hp: 400, speed: 36, attack: 33, range: 24, atkRate: 1.1, color: '#a7f3d0', cd: 5.4, aoe: false },
  lizard: { name: '蜥蜴喵', cost: 350, hp: 300, speed: 32, attack: 84, range: 240, atkRate: 2, color: '#fca5a5', cd: 16.0, aoe: false },
};

export const SHOP_UNLOCKS = {
  ninja: { name: '忍者喵', price: 120, tpl: { name: '忍者喵', cost: 150, hp: 175, speed: 90, attack: 9, range: 50, atkRate: 0.4, color: '#fde68a', cd: 2.0, aoe: false } },
  knight: { name: '騎士喵', price: 360, tpl: { name: '騎士喵', cost: 200, hp: 650, speed: 60, attack: 20, range: 35, atkRate: 1.2, color: '#fda4af', cd: 4.8, aoe: false } },
  mage: { name: '法師喵', price: 450, tpl: { name: '法師喵', cost: 210, hp: 80, speed: 44, attack: 50, range: 140, atkRate: 1.6, color: '#c4b5fd', cd: 5.0, aoe: true, aoeRadius: 120 } },
  samurai: { name: '武士喵', price: 360, tpl: { name: '武士喵', cost: 240, hp: 480, speed: 40, attack: 28, range: 26, atkRate: 0.7, color: '#94a3b8', cd: 5.4, aoe: false } },
  sumo: { name: '相撲喵', price: 300, tpl: { name: '相撲喵', cost: 175, hp: 800, speed: 30, attack: 5, range: 20, atkRate: 0.6, color: '#fecaca', cd: 3.0, aoe: false } },
  viking: { name: '維京喵', price: 400, tpl: { name: '維京喵', cost: 275, hp: 360, speed: 35, attack: 60, range: 24, atkRate: 1.0, color: '#bfdbfe', cd: 6.0, aoe: true, aoeRadius: 24, maxTargets: 3 } },
  cow: { name: '牛喵', price: 240, tpl: { name: '牛喵', cost: 140, hp: 220, speed: 110, attack: 8, range: 18, atkRate: 0.3, color: '#fef3c7', cd: 3.0, aoe: true, aoeRadius: 18, maxTargets: 2 } },
  jaycat: { name: '禁節貓娘', price: 520, tpl: { name: '禁節貓娘', cost: 10, hp: 1, speed: 30, attack: 1, range: 20, atkRate: 0.5, color: '#eb52c7ff', cd: 15.0, aoe: true, aoeRadius: 20 } },
  jay: { name: '禁節喵', price: 520, tpl: { name: '禁節喵', cost: 500, hp: 1, speed: 50, attack: 999, range: 20, atkRate: 10, color: '#f094e9ff', cd: 35.0, aoe: false } },
};
