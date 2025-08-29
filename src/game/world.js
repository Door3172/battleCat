import { stageConfig } from '../data/stages.js';
import { BASE_CATS, SHOP_UNLOCKS } from '../data/cats.js';

export function buildCatsTpl(unlocks, catLevels = {}) {
  const base = {
    ...BASE_CATS,
    ...(unlocks.ninja ? { ninja: SHOP_UNLOCKS.ninja.tpl } : {}),
    ...(unlocks.knight ? { knight: SHOP_UNLOCKS.knight.tpl } : {}),
    ...(unlocks.mage ? { mage: SHOP_UNLOCKS.mage.tpl } : {}),
    ...(unlocks.samurai ? { samurai: SHOP_UNLOCKS.samurai.tpl } : {}),
    ...(unlocks.sumo ? { sumo: SHOP_UNLOCKS.sumo.tpl } : {}),
    ...(unlocks.viking ? { viking: SHOP_UNLOCKS.viking.tpl } : {}),
    ...(unlocks.cow ? { cow: SHOP_UNLOCKS.cow.tpl } : {}),
    ...(unlocks.jaycat ? { jaycat: SHOP_UNLOCKS.jaycat.tpl } : {}),
    ...(unlocks.jay ? { jay: SHOP_UNLOCKS.jay.tpl } : {}),
  };
  const out = {};
  for (const k in base) {
    const tpl = base[k];
    const lv = catLevels[k] || 1;
    out[k] = {
      ...tpl,
      hp: tpl.hp + (tpl.hpIncrement || 0) * (lv - 1),
      attack: tpl.attack + (tpl.atkIncrement || 0) * (lv - 1),
    };
  }
  return out;
}

export function createWorld(currentStage, unlocks, catLevels, researchLv = 1, cannonLv = 1, castleLv = 1) {
  const cfg = stageConfig(currentStage);
  const baseHp = 1000 + (castleLv - 1) * 100;
  return {
    w: 50 + cfg.towerDistance + 50, h: 400,
    units: [],
    leftHp: baseHp, rightHp: cfg.enemyBaseHp,
    leftMaxHp: baseHp, rightMaxHp: cfg.enemyBaseHp,
    towerDistance: cfg.towerDistance,
    fish: 150,
    income: 10.0 + 0.6 * (researchLv - 1),
    incomeLv: 1,
    incomeCost: 100,
    researchLv,
    cannonLv,
    castleLv,
    last: 0, time: 0, state: 'ready',
    hudTick: 0, cannonCd: 0,
    enemyClock: cfg.firstDelay,
    nextEnemyIdx: 0,
    cfg, catsTpl: buildCatsTpl(unlocks, catLevels),
    bossSpawned: false, summonCd: {},
  };
}

export const BODY_W = 22;
