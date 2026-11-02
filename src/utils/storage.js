// localStorage 讀寫工具：讀取失敗（資料損毀、私密模式禁止存取）時一律退回預設值，不讓畫面白屏。
// 各 parse 函式回傳 null 代表「這筆資料不合法」，readSaved 會改用預設值。

export const parseNumber = (raw) => {
  const n = Number(raw);
  return raw !== '' && Number.isFinite(n) ? n : null;
};

export const parseObject = (raw) => {
  const v = JSON.parse(raw);
  return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
};

export const parseArray = (raw) => {
  const v = JSON.parse(raw);
  return Array.isArray(v) ? v : null;
};

export const parseString = (raw) => raw;

export function readSaved(key, fallback, parse = JSON.parse) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const v = parse(raw);
    return v === null || v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

export function writeSaved(key, value, serialize = JSON.stringify) {
  try {
    localStorage.setItem(key, serialize(value));
  } catch {
    // 私密模式或容量已滿：存不了就算了，遊戲照常進行
  }
}
