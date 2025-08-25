import { ENEMIES, BOSSES } from '../data/enemies.js';
import { BODY_W } from './world.js';
import { clamp, rand } from '../utils/math.js';

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
    color: tpl.color, name: tpl.name, bounty: tpl.bounty||0
  };
}

const killBounty = (tpl,cfg)=> Math.round((tpl.bounty||12)*(0.9+Math.random()*0.2)*(0.8+cfg.difficulty*0.1));

export function spawnEnemy(world, getCanvasWidth, getCanvasHeight, onEnemySeen){
  const { cfg } = world;
  const cur = world.units.filter(u=>u.team===-1).length;
  if(cur>=cfg.maxEnemies) return;

  const gy = groundY(getCanvasHeight);

  if(cfg.isBoss && !world.bossSpawned && (world.rightHp<=600 || world.time>=40)){
    const base = BOSSES[cfg.bossKey] || BOSSES.boarKing;
    const scaled = { ...base, hp:Math.round(base.hp*cfg.difficulty), maxHp:Math.round(base.hp*cfg.difficulty), attack:Math.round(base.attack*(1.0+(cfg.difficulty-1)*0.6)) };
    const cw = getCanvasWidth();
    world.units.push(makeUnit(-1, cw-100, gy-8+rand(-4,4), scaled));
    world.bossSpawned = true;
    onEnemySeen && onEnemySeen(scaled.name);
    return;
  }

  const key = cfg.pool[Math.floor(Math.random()*cfg.pool.length)] || 'dog';
  const base = ENEMIES[key];
  const tpl = { ...base, hp:Math.round(base.hp*cfg.difficulty), maxHp:Math.round(base.hp*cfg.difficulty), attack:Math.round(base.attack*(0.9+Math.random()*0.2)*cfg.difficulty) };
  const cw = getCanvasWidth();
  world.units.push(makeUnit(-1, cw-80+rand(-6,6), gy-8+rand(-4,4), tpl));
  onEnemySeen && onEnemySeen(base.name);
}

export function stepUnits(world, getCanvasWidth, getCanvasHeight, dt){
  const leftX = 50, rightX = getCanvasWidth()-50;
  let bounty = 0;

  for(let i=0;i<world.units.length;i++){
    const u = world.units[i];
    if(u.hp<=0) continue;

    // find nearest target
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
      if(inRange){ target.hp-=u.atk; u.atkCd=u.atkRate; }
      else if(distBase<=u.range+BODY_W*0.4){
        if(u.team===1) world.rightHp -= u.atk; else world.leftHp -= u.atk; u.atkCd=u.atkRate;
      }
    }

    let move = u.speed*dt*(u.team===1?1:-1);
    if(target){
      const d=Math.abs(target.x-u.x);
      const stop=d<=u.range*0.98;
      if(stop) move=0;
      if(d<BODY_W*0.9) move=(u.team===1?-8:8)*dt;
    }
    if((u.team===1&&u.x>=rightX-18)||(u.team===-1&&u.x<=leftX+18)) move=0;
    u.x += move;
  }

  const next=[];
  for(const u of world.units){
    if(u.hp>0) next.push(u);
    else if(u.team===-1) bounty+=killBounty(u, world.cfg);
  }
  world.units = next;
  return bounty;
}
