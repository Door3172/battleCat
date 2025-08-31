// src/data/stages.js
import { SPAWNS } from './spawns.js';
import { SPAWNS2 } from './spawns2.js';

// 各章節對應的關卡資料
const SPAWNS_MAP = {
  1: SPAWNS,
  2: SPAWNS2,
};

// 取得指定章節的最大關卡數
export function getMaxStage(chapter = 1) {
  const spawns = SPAWNS_MAP[chapter] || {};
  return Math.max(0, ...Object.keys(spawns).map(Number));
}

export function stageConfig(stage, chapter = 1){
  const spawns = SPAWNS_MAP[chapter] || {};
  const stageIndex = Math.max(1, stage|0);
  const stageSpawn = spawns[stageIndex];

  const rawSchedule = Array.isArray(stageSpawn) ? stageSpawn :
                      stageSpawn?.schedule;
  const schedule = rawSchedule?.map(spawn =>
                      JSON.parse(JSON.stringify(
                        spawn,
                        (k, v) => k.startsWith('_') ? undefined : v
                      )));
  if (Array.isArray(schedule)) {
    schedule.sort((a, b) => {
      const ta = typeof a.time === 'number';
      const tb = typeof b.time === 'number';
      if (ta && tb) return a.time - b.time;
      if (ta) return -1;
      if (tb) return 1;
      return 0;
    });
  }

  // 若未設定 enemyBaseHp，採用預設值避免城堡血量變成 undefined 造成畫面異常
  const enemyBaseHp   = stageSpawn?.enemyBaseHp ?? 1000;
  // 若未設定 towerDistance，採用預設值避免畫面尺寸計算出現 NaN
  const towerDistance = stageSpawn?.towerDistance ?? 750;
  const rewardCoins   = stageSpawn?.reward;

  // BOSS 自訂設定
  const bossCfg = stageSpawn?.boss;
  const isBoss = !!bossCfg;
  const bossKey = bossCfg?.key ?? bossCfg?.type;
  const bossAt = bossCfg?.time;
  const bossHp = bossCfg?.hp;
  const bossMultiplier = bossCfg?.multiplier;

  return {
    stageIndex,
    enemyBaseHp,
    towerDistance,
    schedule,
    isBoss,
    bossKey,
    bossAt,
    bossHp,
    bossMultiplier,
    rewardCoins,
  };
}
