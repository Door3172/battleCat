import { stageConfig } from '../data/stages.js';
import { BASE_CATS, SHOP_UNLOCKS } from '../data/cats.js';

export function buildCatsTpl(unlocks) {
  return {
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
}

export function createWorld(currentStage, unlocks) {
  const cfg = stageConfig(currentStage);
  return {
    w: 900, h: 400,
    units: [],
    leftHp: 1000, rightHp: 1000,
    fish: 150, income: 10.0, incomeLv: 1, incomeCost: 100,
    last: 0, time: 0, state: 'ready',
    hudTick: 0, cannonCd: 0,
    enemyClock: cfg.firstDelay,
    cfg, catsTpl: buildCatsTpl(unlocks),
    bossSpawned: false, summonCd: {},
  };
}

export const BODY_W = 22;
