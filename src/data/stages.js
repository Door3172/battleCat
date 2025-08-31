// src/data/stages.js
import { SPAWNS } from './spawns.js';

// 最大關卡數依據 SPAWNS 自動取得
export const MAX_STAGE = Math.max(0, ...Object.keys(SPAWNS).map(Number));
export function stageConfig(stage){
  const stageIndex = Math.max(1, stage|0);
  const stageSpawn = SPAWNS[stageIndex];

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
