// src/data/stages.js
export const MAX_STAGE = 30;

import { SPAWNS } from './spawns.js';
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

  const enemyBaseHp   = stageSpawn?.enemyBaseHp;
  const towerDistance = stageSpawn?.towerDistance;
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
