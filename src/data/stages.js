// src/data/stages.js
export const MAX_STAGE = 30;

import { SPAWNS } from './spawns.js';

const ALL_TYPES = ['dog','red','boar','black','alien','metal'];

// 這裡決定每關解鎖到哪種敵人（同你的原本邏輯）
function enemyPoolByStage(stage){
  const unlockIdx =
    stage >= 12 ? 6 :
    stage >= 9  ? 5 :
    stage >= 7  ? 4 :
    stage >= 5  ? 3 :
    stage >= 3  ? 2 : 1;
  return ALL_TYPES.slice(0, unlockIdx);
}

// 依關卡產生固定序列（無隨機）：越後面種類更多、密度稍微提升
function buildSequence(stage){
  const pool = enemyPoolByStage(stage);
  // 一輪序列的長度：前期較短，後期較長
  const len = Math.min(60, 24 + Math.floor(stage * 1.6));

  // 權重：前期以低階怪為主，後期提高進階怪比重，但仍保有低階清雜
  // ex: stage 1: [dog] 為主；stage 6: [dog, red, boar]；stage 10+: 加入 black/alien...
  const baseWeights = pool.map((_, i) => {
    // 低階怪（i 小）基礎權重高；越後面關卡進階怪權重逐步加強
    const lowBias   = Math.max(1, 6 - i);            // dog 最大
    const stageLift = 1 + Math.max(0, stage - 1) * (0.10 + i*0.02);
    return Math.round(lowBias * stageLift);
  });

  // 正規化權重到指定總長度
  const totalW = baseWeights.reduce((a,b)=>a+b,0);
  let counts = baseWeights.map(w => Math.max(1, Math.round(w / totalW * len)));

  // 以「輪詢」方式產生序列（不會連續卡同一種太久）
  const seq = [];
  while (seq.length < len) {
    for (let i=0; i<pool.length && seq.length < len; i++) {
      if (counts[i] > 0) { seq.push(pool[i]); counts[i]--; }
    }
    // 若某一輪全部用完但還沒達到長度，重新分配剩餘長度給全部（理論上很少發生）
    if (counts.every(c=>c===0) && seq.length < len) {
      counts = baseWeights.map(_=>1);
    }
  }
  return seq;
}

function bossKeyByStage(stage){
  if (stage % 30 === 0) return 'boarKing';
  if (stage % 20 === 0) return 'mechGolem';
  if (stage % 10 === 0) return 'alienEye';
  return 'boarKing'; // fallback
}

export function stageConfig(stage){
  // 基礎難度與生怪節奏（整體固定，沒有 jitter）
  const stageIndex  = Math.max(1, stage|0);
  const difficulty  = 1 + (stageIndex - 1) * 0.08;                  // 每關 +8%
  const spawnRate   = Math.max(3.6, 5.4 - (stageIndex - 1) * 0.08); // 越後面越快（下限 3.6s）
  const firstDelay  = Math.max(1.2, 2.2 - (stageIndex - 1) * 0.05); // 起手延遲略縮短
  const maxEnemies  = Math.min(50, 12 + Math.floor(stageIndex * 1.2));

  // 固定序列（無隨機）
  const sequence = buildSequence(stageIndex);

  // BOSS 與固定時間（只有 10/20/30… 才有）
  const isBoss = stageIndex % 10 === 0;
  const bossKey = isBoss ? bossKeyByStage(stageIndex) : undefined;
  // 固定出現秒數：越後面稍晚或稍早都可調，這裡先給固定 40s
  const bossAt = isBoss ? 40 : undefined;

  return {
    stageIndex,
    difficulty,
    spawnRate,
    firstDelay,
    maxEnemies,
    sequence,      // 👈 固定出怪種類序列（依此循環）
<<<<<<< ours
    schedule: SPAWNS[stageIndex], // 👈 自訂時間表
=======
    schedule: SPAWNS[stageIndex] ? SPAWNS[stageIndex].map(e => ({ ...e })) : undefined, // 👈 自訂時間表（複製避免汙染原資料）
>>>>>>> theirs
    // 下列字段保留給現有程式用
    pool: enemyPoolByStage(stageIndex), // 仍提供 pool（舊碼可能會用）
    isBoss,
    bossKey,
    bossAt,        // 👈 固定出場時間（秒）
  };
}
