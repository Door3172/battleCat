// 章節環境（docs/design/chapter-environment.md）的顯示文字與圖示
// 只負責「怎麼顯示」，數值與規則以 world.env / stageConfig().env 為準。

export const ENV_TYPES = {
  dayNight: {
    icon: '🌗',
    name: '晝夜',
    summary: '白天、黑夜輪流交替。夜晚敵人更兇，但擊殺賞金更多。',
    tips: [
      '☀️ 白天：沒有特別效果，適合推進。',
      '🌙 夜晚：敵人攻擊力、移動速度提高，擊殺得到的魚變多。',
      '夜晚來臨前幾秒會先預告，趁機守線，或存魚在夜晚大量召喚賺賞金。',
    ],
  },
  tide: {
    icon: '🌊',
    name: '潮汐',
    summary: '每隔一段時間來一波潮水，把所有單位往同一個方向推。',
    tips: [
      '🌊 漲潮 ←：所有單位被推向我方主堡，敵人會被送過來！',
      '🏖️ 退潮 →：所有單位被推向敵方主堡，是把貓咪送上前線的好機會。',
      '潮水來之前會先預告方向；有「擊退免疫」的單位不會被推動。',
    ],
  },
};

export const ENV_PHASES = {
  day: { icon: '☀️', name: '白天' },
  night: { icon: '🌙', name: '夜晚' },
  calm: { icon: '〰️', name: '平靜' },
  flood: { icon: '🌊', name: '漲潮', arrow: '←' },
  ebb: { icon: '🏖️', name: '退潮', arrow: '→' },
};

// 預告文字，例如「🌙 夜晚將在 5 秒後降臨」
export function envWarningText(warning) {
  if (!warning) return '';
  const p = ENV_PHASES[warning.next];
  if (!p) return '';
  const sec = Math.max(0, Math.ceil(warning.in));
  if (warning.next === 'night') return `${p.icon} 夜晚將在 ${sec} 秒後降臨`;
  if (warning.next === 'day') return `${p.icon} 天亮將在 ${sec} 秒後到來`;
  return `${p.icon} ${p.name}將在 ${sec} 秒後來襲 ${p.arrow ?? ''}`.trim();
}

// ---- 首次說明：已看過的環境類型存在 localStorage `envTipsSeen`（陣列） ----
const SEEN_KEY = 'envTipsSeen';

export function hasSeenEnvTip(type) {
  try {
    const arr = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    return Array.isArray(arr) && arr.includes(type);
  } catch {
    return false;
  }
}

export function markEnvTipSeen(type) {
  try {
    const arr = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    const next = Array.isArray(arr) ? arr : [];
    if (!next.includes(type)) next.push(type);
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* localStorage 不可用時略過，最多就是再看一次說明 */
  }
}
