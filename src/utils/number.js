// 數字加千分位。HUD 每 0.12 秒更新一次，共用同一個 formatter，不必每次重建
const formatter = new Intl.NumberFormat();

export function fmt(value) {
  return formatter.format(value);
}
