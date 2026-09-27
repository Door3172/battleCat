// 章節環境機制（設計：docs/design/chapter-environment.md）
// dayNight 晝夜：day ⇄ night，夜晚前預告；夜晚敵人攻擊/速度與擊殺賞金加成
// tide 潮汐：calm → flood → calm → ebb → calm …，潮水前預告；潮水期間推動所有非擊退免疫單位
//
// world.env 是給 UI / 音效唯讀的狀態（結構見設計文件 §4.2）；參數一律從 world.cfg.env 讀取。

const LEFT_X = 50;
const EDGE = 18; // 與 stepUnits 一般移動的主堡邊界相同
const MIN_LEN = 0.1; // 防呆：避免階段長度 ≤ 0 造成無窮迴圈

const NO_MODS = Object.freeze({ enemyAtkMul: 1, enemySpeedMul: 1, bountyMul: 1 });

function phaseLength(cfg, phase) {
  let len;
  if (phase === 'day') len = cfg.dayLength ?? 45;
  else if (phase === 'night') len = cfg.nightLength ?? 25;
  else if (phase === 'calm') len = cfg.calmLength ?? 24;
  else len = cfg.surgeLength ?? 6; // flood / ebb
  return Math.max(MIN_LEN, len);
}

// 下一個階段。潮汐：平靜之後依已發生的潮水次數交替 flood / ebb（第一次是 flood）
function nextPhase(env) {
  if (env.type === 'dayNight') return env.phase === 'day' ? 'night' : 'day';
  if (env.phase !== 'calm') return 'calm';
  const surges = Math.floor(env.events / 2); // calm 與潮水交替，每兩次切換一波潮水
  return surges % 2 === 0 ? 'flood' : 'ebb';
}

// 需要預告的階段：夜晚、漲潮、退潮
const WARNED = { night: true, flood: true, ebb: true };

function refresh(env, cfg) {
  const len = phaseLength(cfg, env.phase);
  env.phaseProgress = Math.min(1, Math.max(0, 1 - env.phaseLeft / len));
  const next = nextPhase(env);
  const warnTime = cfg.warnTime ?? (env.type === 'tide' ? 4 : 5);
  env.warning = WARNED[next] && env.phaseLeft <= warnTime ? { next, in: env.phaseLeft } : null;
}

export function createEnv(envCfg) {
  if (!envCfg || (envCfg.type !== 'dayNight' && envCfg.type !== 'tide')) return null;
  const phase = envCfg.type === 'dayNight' ? (envCfg.startPhase === 'night' ? 'night' : 'day') : 'calm';
  const env = {
    type: envCfg.type,
    phase,
    phaseLeft: phaseLength(envCfg, phase),
    phaseProgress: 0,
    warning: null,
    events: 0,
  };
  refresh(env, envCfg);
  return env;
}

export function stepEnv(world, dt) {
  const env = world.env;
  const cfg = world.cfg?.env;
  if (!env || !cfg || !(dt > 0)) return;

  // 推進時間；一幀跨越多個階段時逐段計算，潮水推力只算在潮水期間的那段時間
  let remain = dt;
  let push = 0; // 本幀淨推移時間（正 = 往右）
  while (remain > 0) {
    const step = Math.min(remain, env.phaseLeft);
    if (env.phase === 'flood') push -= step;
    else if (env.phase === 'ebb') push += step;
    env.phaseLeft -= step;
    remain -= step;
    if (env.phaseLeft <= 0) {
      env.phase = nextPhase(env);
      env.phaseLeft = phaseLength(cfg, env.phase);
      env.events += 1;
    }
  }
  refresh(env, cfg);

  if (env.type === 'tide' && push !== 0) {
    const d = push * (cfg.pushSpeed ?? 32);
    const lo = LEFT_X + EDGE;
    const hi = LEFT_X + world.cfg.towerDistance - EDGE;
    for (const u of world.units) {
      if (u.hp <= 0 || u.abilities?.knockbackImmune) continue;
      // 只阻止被推過邊界；原本就在邊界外（例如被大砲擊退）的單位不會被拉回
      if (d < 0) { if (u.x > lo) u.x = Math.max(lo, u.x + d); }
      else if (u.x < hi) u.x = Math.min(hi, u.x + d);
    }
  }
}

export function getEnvModifiers(world) {
  const env = world.env;
  const cfg = world.cfg?.env;
  if (!env || !cfg || env.type !== 'dayNight' || env.phase !== 'night') return NO_MODS;
  return {
    enemyAtkMul: cfg.enemyAtkMul ?? 1,
    enemySpeedMul: cfg.enemySpeedMul ?? 1,
    bountyMul: cfg.bountyMul ?? 1,
  };
}

// 音效提示時機（設計文件 §4.4）：回傳本幀新出現的 kind 陣列，由 Battle.jsx 呼叫 audio.playEnvCue?.(kind)
// 進度記在 world.envCueSeen，不放進 world.env，保持 §4.2 結構不變
const WARN_CUE = { night: 'nightWarn', flood: 'floodWarn', ebb: 'ebbWarn' };
export function pollEnvCues(world) {
  const env = world.env;
  if (!env) return [];
  const seen = world.envCueSeen || (world.envCueSeen = { warn: -1, phase: 0 });
  const out = [];
  if (env.events !== seen.phase) {
    seen.phase = env.events;
    if (env.phase === 'day') out.push('dayStart');
  }
  if (env.warning && seen.warn !== env.events) {
    seen.warn = env.events;
    out.push(WARN_CUE[env.warning.next]);
  }
  return out;
}
