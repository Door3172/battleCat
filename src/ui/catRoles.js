// 圖鑑卡片的貓咪定位（只影響顯示）。以貓咪 key 對應，不依賴中文名稱。
// 新增貓咪時請在 CAT_ROLES 補上一行；catRoles.test.js 會檢查 cats.js 的每一隻都有對應。

export const ROLE_INFO = {
  tank: { label: '坦克', icon: '🛡️' },
  warrior: { label: '近戰', icon: '⚔️' },
  archer: { label: '遠程', icon: '🏹' },
  mage: { label: '法術', icon: '🔮' },
  ninja: { label: '速攻', icon: '💨' },
  special: { label: '特殊', icon: '✨' },
};

export const CAT_ROLES = {
  // 預設擁有
  white: 'warrior',
  tank: 'tank',
  archer: 'archer',
  giant: 'warrior',
  bird: 'archer',
  fish: 'tank',
  lizard: 'archer',
  // 商店
  ninja: 'ninja',
  knight: 'warrior',
  mage: 'mage',
  samurai: 'warrior',
  sumo: 'tank',
  viking: 'warrior',
  cow: 'ninja',
  jaycat: 'special',
  jay: 'ninja',
  void: 'mage',
  azurePhantom: 'mage',
};

export function getCatRole(key) {
  return (key && CAT_ROLES[key]) || null;
}
