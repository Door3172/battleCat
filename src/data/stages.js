import { clamp } from '../utils/math.js';

export const MAX_STAGE = 30;

const enemyPoolByStage = (stage)=>{
  const order=['dog','red','boar','black','alien','metal'];
  const unlockIdx = stage>=12?6: stage>=9?5: stage>=7?4: stage>=5?3: stage>=3?2:1;
  return order.slice(0, unlockIdx);
};

export const stageConfig = (stage)=>{
  const baseGrowth = 1 + stage*0.06;
  const easyFactor = Math.max(0.6, 1-(10-stage)*0.035);
  const bossDampen = stage%10===0?0.85:1;
  const allowed = enemyPoolByStage(stage);
  const spawnRate = clamp(8.2-stage*0.25, 3.2, 8.6);
  const firstDelay = clamp(5-stage*0.2, 2, 5);
  const maxEnemies = Math.min(2+Math.floor(stage/2), stage%10===0?7:9);
  const isBoss = stage%10===0;
  const bossKeys = ['boarKing','alienEye','mechGolem'];
  const bossKey = bossKeys[(((stage/10)|0)-1) % bossKeys.length];
  return { difficulty: baseGrowth*easyFactor*bossDampen, pool: allowed, spawnRate, firstDelay, maxEnemies, isBoss, bossKey };
};
