import { describe, it, expect } from 'vitest';
import { BASE_CATS, SHOP_UNLOCKS, GACHA_UNLOCKS } from '../data/cats.js';
import { CAT_ROLES, ROLE_INFO } from './catRoles.js';
import { catKeyByName } from './catArt.js';

const allCats = () => ({ ...BASE_CATS, ...(GACHA_UNLOCKS || {}), ...SHOP_UNLOCKS });

describe('圖鑑卡片定位（UI-011）', () => {
  it('cats.js 的每一隻貓都有定位，而且定位有對應的樣式資訊', () => {
    for (const key of Object.keys(allCats())) {
      expect(CAT_ROLES[key], `貓咪 ${key} 沒有定位`).toBeTruthy();
      expect(ROLE_INFO[CAT_ROLES[key]], `貓咪 ${key} 的定位 ${CAT_ROLES[key]} 不存在`).toBeTruthy();
    }
  });

  it('圖鑑存的中文名稱都能反查到 key', () => {
    for (const [key, v] of Object.entries(allCats())) {
      const name = v.name ?? v.tpl?.name;
      expect(catKeyByName(name)).toBe(key);
    }
  });
});
