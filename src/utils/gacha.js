import { GACHA_PRICE, REFUND_RATES, RARITY_RATES } from '../data/gachaRates.js';
import { GACHA_CHARACTERS } from '../data/gachaPool.js';
import { rand } from './math.js';

function rollRarity() {
  const r = Math.random();
  let acc = 0;
  for (const [rarity, rate] of Object.entries(RARITY_RATES)) {
    acc += rate;
    if (r < acc) return Number(rarity);
  }
  return Number(Object.keys(RARITY_RATES).pop());
}

export function drawGacha(ownedKeys, coins) {
  if (coins < GACHA_PRICE) return { success: false, coins };
  coins -= GACHA_PRICE;
  const rarity = rollRarity();
  const pool = GACHA_CHARACTERS.filter(c => c.rarity === rarity);
  const pick = pool[Math.floor(rand(0, pool.length))];
  const duplicate = ownedKeys.includes(pick.key);
  let refund = 0;
  if (duplicate) {
    const rate = REFUND_RATES[rarity] ?? 0;
    refund = Math.floor(GACHA_PRICE * rate);
    coins += refund;
  }
  return {
    success: true,
    coins,
    catKey: pick.key,
    rarity,
    duplicate,
    refund,
  };
}

export { GACHA_PRICE };
