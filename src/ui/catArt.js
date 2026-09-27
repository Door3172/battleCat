// 貓咪角色圖（public/pic/<key>.webp）
// - DOM 用 catArtUrl() / <CatAvatar>
// - Canvas 用 getCatImage()：未載入完成或沒有圖時回傳 null，由呼叫端退回色塊畫法
import { BASE_CATS, SHOP_UNLOCKS, GACHA_UNLOCKS } from '../data/cats.js';

// 有圖的貓（新增圖片時把 key 加進來，檔案放 public/pic/<key>.webp，最長邊 256px）
export const CAT_ART_KEYS = new Set([
  'white', 'tank', 'archer', 'giant', 'bird', 'fish', 'lizard',
  'ninja', 'knight', 'mage', 'samurai', 'sumo', 'viking', 'cow',
  'void', 'azurePhantom',
]);

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';

export function catArtUrl(key) {
  return key && CAT_ART_KEYS.has(key) ? `${BASE}pic/${key}.webp` : null;
}

// 中文名稱 → key（圖鑑存的是名稱）
let nameMap = null;
export function catKeyByName(name) {
  if (!nameMap) {
    nameMap = new Map();
    for (const [k, v] of Object.entries(BASE_CATS)) nameMap.set(v.name, k);
    for (const [k, v] of Object.entries(GACHA_UNLOCKS || {})) nameMap.set(v.name ?? v.tpl?.name, k);
    for (const [k, v] of Object.entries(SHOP_UNLOCKS)) {
      nameMap.set(v.name, k);
      if (v.tpl?.name) nameMap.set(v.tpl.name, k);
    }
  }
  return nameMap.get(name) ?? null;
}

// Canvas 用的預載快取
const images = new Map();
export function preloadCatArt() {
  if (typeof Image === 'undefined') return;
  for (const key of CAT_ART_KEYS) {
    if (images.has(key)) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = catArtUrl(key);
    images.set(key, img);
  }
}

export function getCatImage(key) {
  const img = key && images.get(key);
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}
