import { ENEMIES, BOSSES } from '../data/enemies.js';
import { BODY_W } from './world.js';

export function groundY(getCanvasHeight){
  return getCanvasHeight()*0.72;
}

export function makeUnit(team, x, y, tpl){
  return {
    id: Math.random().toString(36).slice(2),
    team, x, y,
    hp: tpl.hp, maxHp: tpl.hp,
    speed: tpl.speed, atk: tpl.attack, range: tpl.range,
    atkRate: tpl.atkRate, atkCd: 0,
    color: tpl.color, name: tpl.name, bounty: tpl.bounty||0,
    aoe: !!tpl.aoe,
    aoeRadius: tpl.aoeRadius ?? undefined,
    maxTargets: tpl.maxTargets ?? undefined,
  };
}

const killBounty = (tpl,cfg)=> Math.round((tpl.bounty||12)*(0.9+Math.random()*0.2)*(0.8+cfg.difficulty*0.1));

function computeScale(cfg, world){
  const stageFactor = 1 + Math.max(0, (cfg.stageIndex||1) - 1) * 0.08; // 每關 +8%
  const timeSec = Math.min(world.time||0, 180);
  const timeFactor = 1 + timeSec * 0.004;                               // 每秒 +0.4%
  const spawnFactor = 1 + Math.min((world.totalSpawns||0) * 0.015, 0.45);// 每隻 +1.5%
  return (cfg.difficulty||1) * stageFactor * timeFactor * spawnFactor;
}

export function spawnEnemy(world, getCanvasWidth, getCanvasHeight, onEnemySeen, forcedKey, statMultiplier = 100, applyScale = true){
  const { cfg } = world;
  const cur = world.units.filter(u=>u.team===-1).length;
  if (cur >= cfg.maxEnemies) return;

  const gy = groundY(getCanvasHeight);
  const leftX = 50;
  const rightX = leftX + world.cfg.towerDistance;

  let key = forcedKey;
  if (!key) {
    if (world.enemyIndex == null) world.enemyIndex = 0;
    const seq = Array.isArray(cfg.sequence) && cfg.sequence.length ? cfg.sequence : null;
    const pool = (!seq && cfg.pool && cfg.pool.length) ? cfg.pool : null;
    key = 'dog';
    if (seq) key = seq[ world.enemyIndex % seq.length ];
    else if (pool) key = pool[ world.enemyIndex % pool.length ];
    world.enemyIndex = (world.enemyIndex || 0) + 1;
  }

  if (applyScale) world.totalSpawns = (world.totalSpawns || 0) + 1;
  if (BOSSES[key]) {
    const base = BOSSES[key];
    const sc = applyScale ? computeScale(cfg, world) : 1;
    const tpl = {
      ...base,
      hp: Math.round(base.hp * sc),
      maxHp: Math.round(base.hp * sc),
      attack: Math.round(base.attack * (1.0 + (sc - 1) * 0.6))
    };
    world.units.push(makeUnit(-1, rightX - 30, gy - 8, tpl));
    world.bossSpawned = true;
    onEnemySeen && onEnemySeen(base.name);
    return;
  }

  const base = ENEMIES[key] || ENEMIES.dog;
  const sc = applyScale ? computeScale(cfg, world) : 1;
  const tpl = {
    ...base,
    hp: Math.round(base.hp * sc * statMultiplier / 100),
    maxHp: Math.round(base.hp * sc * statMultiplier / 100),
    attack: Math.round(base.attack * (applyScale ? (0.9 + (sc - 1) * 0.5) : 1) * statMultiplier / 100) // 無隨機因子
  };

  world.units.push(makeUnit(-1, rightX - 30, gy - 8, tpl));
  onEnemySeen && onEnemySeen(base.name);
}

export function spawnBossIfNeeded(world, getCanvasWidth, getCanvasHeight, onEnemySeen){
  const { cfg } = world;
  if (!(cfg.isBoss && !world.bossSpawned)) return;
  if (typeof cfg.bossAt === 'number' && world.time < cfg.bossAt) return;
  if (typeof cfg.bossHp === 'number' && world.rightHp > cfg.bossHp) return;

  const cur = world.units.filter(u=>u.team===-1).length;
  if (cur >= cfg.maxEnemies) return;

  const gy = groundY(getCanvasHeight);
  const leftX = 50;
  const rightX = leftX + world.cfg.towerDistance;
  const base = BOSSES[cfg.bossKey] || BOSSES.boarKing;
  const sc = computeScale(cfg, world);
  const scaled = {
    ...base,
    hp: Math.round(base.hp * sc),
    maxHp: Math.round(base.hp * sc),
    attack: Math.round(base.attack * (1.0 + (sc - 1) * 0.6))
  };
  world.units.push(makeUnit(-1, rightX - 30, gy - 8, scaled));
  world.bossSpawned = true;
  onEnemySeen && onEnemySeen(scaled.name);
}

export function stepUnits(world, getCanvasWidth, getCanvasHeight, dt){
  const leftX = 50;
  const rightX = leftX + world.cfg.towerDistance;
  let bounty = 0;

  for(let i=0;i<world.units.length;i++){
    const u = world.units[i];
    if(u.hp<=0) continue;

    // 最近目標
    let target=null, best=1e9;
    for(let j=0;j<world.units.length;j++){
      if(i===j) continue;
      const v = world.units[j];
      if(v.hp<=0||v.team===u.team) continue;
      const d=Math.abs(v.x-u.x);
      if(d<best){best=d; target=v;}
    }

    const enemyBaseX = u.team===1? rightX : leftX;
    const distBase = Math.abs(enemyBaseX-u.x);

    u.atkCd -= dt;
    const inRange = target && Math.abs(target.x-u.x) <= u.range + BODY_W*0.4;

    if(u.atkCd<=0){
      if(inRange){
        if(u.aoe){
          const r = (u.aoeRadius ?? u.range) + BODY_W*0.4;
          let hits = 0;
          for(let k=0;k<world.units.length;k++){
            const t = world.units[k];
            if(t.hp<=0 || t.team===u.team) continue;
            const d = Math.abs(t.x - target.x);
            if(d <= r){
              t.hp -= u.atk;
              hits++;
              if(u.maxTargets && hits >= u.maxTargets) break;
            }
          }
          const baseDist = Math.abs(target.x - enemyBaseX);
          if(baseDist <= r){
            if(u.team===1) world.rightHp -= u.atk; else world.leftHp -= u.atk;
          }
          u.atkCd = u.atkRate;
        }else{
          target.hp -= u.atk;
          u.atkCd = u.atkRate;
        }
      }else if(distBase<=u.range+BODY_W*0.4){
        if(u.team===1) world.rightHp -= u.atk; else world.leftHp -= u.atk;
        u.atkCd = u.atkRate;
      }
    }

    // 移動
    let move = u.speed*dt*(u.team===1?1:-1);
    if(target){
      const d=Math.abs(target.x-u.x);
      const stop=d<=u.range*0.98;
      if(stop) move=0;
      if(d<BODY_W*0.9) move=0;
    }
    if((u.team===1&&u.x>=rightX-18)||(u.team===-1&&u.x<=leftX+18)) move=0;
    u.x += move;
  }

  // 清屍 + 賞金（這裡保留原隨機，因為不影響出怪時間/種類）
  const next=[];
  for(const u of world.units){
    if(u.hp>0) next.push(u);
    else if(u.team===-1) bounty+=killBounty(u, world.cfg);
  }
  world.units = next;
  return bounty;
}
