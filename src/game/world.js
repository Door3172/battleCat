import { stageConfig } from '../data/stages.js';
import { BASE_CATS, SHOP_UNLOCKS, GACHA_UNLOCKS } from '../data/cats.js';
import { createEnv } from './environment.js';

export function buildCatsTpl(unlocks, catLevels = {}) {
  const gacha = Object.fromEntries(
    Object.entries(GACHA_UNLOCKS).filter(([k]) => unlocks[k])
  );
  // 已購買的商店貓，依 SHOP_UNLOCKS 宣告順序自動納入
  const shop = Object.fromEntries(
    Object.entries(SHOP_UNLOCKS)
      .filter(([k]) => unlocks[k])
      .map(([k, v]) => [k, v.tpl])
  );
  const base = {
    ...BASE_CATS,
    ...gacha,
    ...shop,
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

export function createWorld(currentStage, unlocks, catLevels, researchLv = 1, cannonLv = 1, castleLv = 1, chapter = 1) {
  const cfg = stageConfig(currentStage, chapter);
  const baseHp = 1000 + (castleLv - 1) * 100;
  return {
    w: 50 + cfg.towerDistance + 50, h: 400,
    units: [],
    leftHp: baseHp, rightHp: cfg.enemyBaseHp,
    leftMaxHp: baseHp, rightMaxHp: cfg.enemyBaseHp,
    towerDistance: cfg.towerDistance,
    fish: 150,
    income: 7.5 + 4.5 * (researchLv - 1),
    incomeLv: 1,
    incomeCost: 100,
    researchLv,
    cannonLv,
    castleLv,
    last: 0, time: 0, state: 'ready',
    hudTick: 0, cannonCd: 0,
    nextEnemyIdx: 0,
    cfg, catsTpl: buildCatsTpl(unlocks, catLevels),
    bossSpawned: false, summonCd: {},
    env: createEnv(cfg.env ?? null), // 章節環境（無環境時為 null），參數在 cfg.env
  };
}

export const BODY_W = 22;
