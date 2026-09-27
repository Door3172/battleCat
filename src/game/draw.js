import { SKIN } from '../data/skin.js';
import { BODY_W } from './world.js';
import { getCatImage, preloadCatArt } from '../ui/catArt.js';

preloadCatArt();

// 角色圖在戰場上的高度（px），腳底對齊原本色塊底部
const ART_H = 38;
const ART_BOTTOM = 9;

export function drawCatBase(ctx,x,ground,left,hpPct){
  ctx.save();
  ctx.translate(x,ground);
  ctx.fillStyle= left? '#ffe7b3' : '#ffd6d6';
  ctx.strokeStyle='#2b2b2b';
  ctx.lineWidth=2;
  roundRect(ctx,-22,-62,44,62,8); ctx.fill(); ctx.stroke();
  ctx.fillStyle= left? '#d7b38f':'#d1a0a0';
  [[-16,-48,8,8],[10,-40,10,10],[-4,-30,8,8]].forEach(([ax,ay,w,h])=>{ roundRect(ctx,ax,ay,w,h,4); ctx.fill();});
  ctx.fillStyle='#2b2b2b'; roundRect(ctx,-6,-58,12,10,3); ctx.fill();
  ctx.save(); ctx.translate(10,-54); ctx.rotate(-.05); roundRect(ctx,0,-6,28,12,6); ctx.fill(); ctx.restore();
  ctx.fillStyle='#fff'; roundRect(ctx,-16,-42,32,24,10); ctx.fill(); ctx.strokeStyle='#2b2b2b'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-12,-42); ctx.lineTo(-6,-52); ctx.lineTo(-2,-42); ctx.moveTo(12,-42); ctx.lineTo(6,-52); ctx.lineTo(2,-42); ctx.stroke();
  ctx.beginPath(); ctx.arc(-6,-34,2,0,Math.PI*2); ctx.arc(6,-34,2,0,Math.PI*2); ctx.fillStyle='#2b2b2b'; ctx.fill();
  ctx.beginPath(); ctx.arc(0,-30,3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=SKIN.field.hpTrack; roundRect(ctx,-28,-74,56,8,4); ctx.fill();
  ctx.fillStyle= hpPct>0.5? SKIN.color.ok : hpPct>0.2? SKIN.color.warn : SKIN.color.danger; roundRect(ctx,-28,-74,56*Math.max(0,Math.min(1,hpPct)),8,4); ctx.fill();
  ctx.restore();
}

export function roundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,Math.abs(w/2),Math.abs(h/2));
  ctx.beginPath(); ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr); ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr); ctx.closePath();
}

// ---- 我方貓咪動畫（只讀 unit 狀態，不改戰鬥資料）----
// 單位的動畫狀態另存在 WeakMap，單位被移除後自動回收。
// 時間一律用 world.time（遊戲時間）：暫停時動畫停止、2x 時一起加速。
const anim = new WeakMap();
const ATTACK_DUR = 0.3;   // 攻擊動作長度（遊戲秒）
const HURT_DUR = 0.16;    // 受擊閃紅長度
const STEP_LEN = 14;      // 走一步的距離（px），決定彈跳頻率

function catAnimState(u, t) {
  let a = anim.get(u);
  if (!a) {
    a = { x: u.x, atkCd: u.atkCd, hp: u.hp, phase: Math.random() * Math.PI * 2,
          moving: false, atkAt: -99, hurtAt: -99, t, seed: Math.random() * 10 };
    anim.set(u, a);
    return a;
  }
  if (t !== a.t) {                    // 每個遊戲時間點只更新一次（暫停時不變）
    const dx = u.x - a.x;
    // 往前走才算走路；大幅後退是被擊退，不算步伐
    a.moving = dx > 0.001 && dx < 6;
    if (a.moving) a.phase += (dx / STEP_LEN) * Math.PI;
    if (u.atkCd > a.atkCd + 0.01) a.atkAt = t;   // 冷卻被重設 = 剛出手
    if (u.hp < a.hp) a.hurtAt = t;
    a.x = u.x; a.atkCd = u.atkCd; a.hp = u.hp; a.t = t;
  }
  return a;
}

// 回傳相對腳底的變形：位移、旋轉、縮放，以及特效參數
function catPose(a, t) {
  let ox = 0, oy = 0, rot = 0, sx = 1, sy = 1;
  const atkP = (t - a.atkAt) / ATTACK_DUR;
  if (atkP >= 0 && atkP < 1) {
    // 攻擊：先微微後縮蓄力，再往前撲、放大，最後回位
    const wind = atkP < 0.25 ? atkP / 0.25 : 0;
    const strike = atkP >= 0.25 ? Math.sin(((atkP - 0.25) / 0.75) * Math.PI) : 0;
    ox = -3 * wind + 9 * strike;
    rot = 0.08 * wind - 0.18 * strike;
    sx = 1 + 0.14 * strike - 0.05 * wind;
    sy = 1 + 0.08 * strike + 0.06 * wind;
  } else if (a.moving) {
    // 走路：彈跳 + 左右搖擺 + 落地壓扁
    const s = Math.sin(a.phase);
    const hop = Math.abs(s);
    oy = -4 * hop;
    rot = 0.09 * Math.sin(a.phase + Math.PI / 2) * 0.8;
    const land = 1 - hop;                     // 越接近地面越扁
    sx = 1 + 0.07 * land;
    sy = 1 - 0.07 * land;
  } else {
    // 待機：緩慢呼吸
    const b = Math.sin(t * 3 + a.seed);
    sx = 1 - 0.015 * b;
    sy = 1 + 0.03 * b;
  }
  const hurt = (t - a.hurtAt) >= 0 && (t - a.hurtAt) < HURT_DUR ? 1 - (t - a.hurtAt) / HURT_DUR : 0;
  ox -= 2.5 * hurt;                           // 受擊：往後一震
  return { ox, oy, rot, sx, sy, atkP, hurt };
}

// 揮擊特效：身體前方一道弧線
function drawSlash(ctx, atkP, top) {
  if (atkP < 0.3 || atkP > 0.85) return;
  const p = (atkP - 0.3) / 0.55;
  ctx.save();
  ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
  ctx.strokeStyle = SKIN.color.warn || '#f59e0b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const cx = 12, cy = top * 0.55, r = 14;
  const a0 = -1.2 + p * 0.6, a1 = a0 + 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.globalAlpha *= 0.6;
  ctx.beginPath(); ctx.arc(cx - 2, cy, r - 5, a0 + 0.2, a1 - 0.2); ctx.stroke();
  ctx.restore();
}

export function drawUnit(ctx,u,t=0){
  ctx.save();
  ctx.translate(u.x,u.y);
  const isCat=u.team===1;
  const img = isCat ? getCatImage(u.key) : null;
  let labelY = -6;

  const pose = isCat ? catPose(catAnimState(u, t), t) : null;
  ctx.save();
  if (pose) {
    // 以腳底為支點做變形
    ctx.translate(pose.ox, ART_BOTTOM + pose.oy);
    ctx.rotate(pose.rot);
    ctx.scale(pose.sx, pose.sy);
    ctx.translate(0, -ART_BOTTOM);
  }
  const drawBody = () => {
    if (img) {
      // 有角色圖：畫圖取代色塊（沒圖或未載入完成時走色塊畫法）
      const h = ART_H, w = h * img.naturalWidth / img.naturalHeight;
      ctx.drawImage(img, -w/2, ART_BOTTOM - h, w, h);
    } else {
      ctx.fillStyle=u.color; ctx.strokeStyle=SKIN.field.stroke; ctx.lineWidth=2;
      roundRect(ctx,-BODY_W/2,-16,BODY_W,24,6); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      if(isCat){ ctx.moveTo(-8,-16); ctx.lineTo(-2,-24); ctx.lineTo(0,-16); ctx.moveTo(8,-16); ctx.lineTo(2,-24); ctx.lineTo(0,-16);} else { ctx.moveTo(-6,-16); ctx.lineTo(0,-22); ctx.lineTo(6,-16);} ctx.stroke();
    }
  };
  if (pose && pose.hurt > 0 && 'filter' in ctx) {
    // 受擊閃紅（貓多半是白色，閃白看不出來）
    ctx.filter = `sepia(${pose.hurt}) saturate(${1 + 12 * pose.hurt}) hue-rotate(${-65 * pose.hurt}deg) brightness(${1 - 0.15 * pose.hurt})`;
    drawBody();
    ctx.filter = 'none';
  } else {
    drawBody();
  }
  if (pose) drawSlash(ctx, pose.atkP, img ? ART_BOTTOM - ART_H : -24);
  ctx.restore();

  if (img) labelY = ART_BOTTOM - ART_H - 5;   // 名字、血條不跟著動，保持好讀
  const hpPct=Math.max(0,Math.min(1,u.hp/u.maxHp));
  ctx.fillStyle=SKIN.field.hpTrack; ctx.fillRect(-BODY_W/2,12,BODY_W,4);
  ctx.fillStyle= hpPct>0.5?SKIN.color.ok: hpPct>0.2?SKIN.color.warn:SKIN.color.danger; ctx.fillRect(-BODY_W/2,12,BODY_W*hpPct,4);
  ctx.fillStyle = SKIN.field.text; ctx.font = '600 11px ui-sans-serif, system-ui'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(isCat?u.name:'敵', 0, labelY);
  ctx.restore();
}

// ---- 章節環境（晝夜 / 潮汐）畫面 ----
// 只讀 world.env（docs/design/chapter-environment.md §4.2）。
// 過場用的平滑數值存在 WeakMap（以 world 為 key），用 world.time 推進：暫停時不變、2x 加速。
const envFx = new WeakMap();

function approach(v, target, dt, tau) {
  return v + (target - v) * Math.min(1, dt / tau);
}

function envState(world) {
  const env = world.env;
  let st = envFx.get(world);
  if (!st || world.time < st.t) {
    st = { t: world.time, night: 0, water: 0, flow: 0, wave: 0 };
    if (env?.phase === 'night') st.night = 1;
    envFx.set(world, st);
  }
  const dt = Math.max(0, world.time - st.t);
  st.t = world.time;
  if (!env) return st;
  const warn = env.warning;
  if (env.type === 'dayNight') {
    let target = env.phase === 'night' ? 1 : 0;
    if (warn?.next === 'night') target = 0.18;          // 預告：天色開始轉暗
    if (warn?.next === 'day') target = 0.8;             // 預告：天快亮
    st.night = approach(st.night, target, dt, 1.2);
  } else if (env.type === 'tide') {
    const surge = env.phase === 'flood' || env.phase === 'ebb';
    let wTarget = surge ? 1 : 0;
    let fTarget = env.phase === 'flood' ? -1 : env.phase === 'ebb' ? 1 : 0;
    if (!surge && warn) { wTarget = 0.2; fTarget = warn.next === 'flood' ? -0.4 : 0.4; }
    st.water = approach(st.water, wTarget, dt, 0.9);
    st.flow = approach(st.flow, fTarget, dt, 0.6);
    st.wave += dt * (0.6 + 2.4 * Math.abs(st.flow)) * (st.flow < 0 ? -1 : 1);
  }
  return st;
}

// 固定位置的星星（避免每幀亂跳）
const STARS = Array.from({ length: 40 }, (_, i) => {
  const r = (n) => { const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1), y: r(2), s: 0.6 + r(3) * 1.4, tw: r(4) * 6.28 };
});

// 背景層（在主堡、單位之前）：太陽
function drawEnvBack(ctx, world, st, W, H) {
  if (world.env?.type !== 'dayNight') return;
  const a = 1 - st.night;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  const x = W * 0.82, y = H * 0.16 + st.night * H * 0.2, r = Math.max(12, H * 0.055);
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
  glow.addColorStop(0, 'rgba(255,214,102,0.55)'); glow.addColorStop(1, 'rgba(255,214,102,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// 前景層（在單位之後）：夜色、星月、潮水
function drawEnvFront(ctx, world, st, W, H, ground) {
  const env = world.env;
  if (!env) return;
  const t = world.time;
  if (env.type === 'dayNight' && st.night > 0.01) {
    const n = st.night;
    ctx.save();
    ctx.fillStyle = `rgba(16, 28, 96, ${0.48 * n})`;
    ctx.fillRect(0, 0, W, H);
    // 星星（只在天空）
    for (const s of STARS) {
      const tw = 0.55 + 0.45 * Math.sin(t * 2 + s.tw);
      ctx.globalAlpha = n * tw;
      ctx.fillStyle = '#fff8dc';
      ctx.beginPath(); ctx.arc(s.x * W, s.y * (ground - 90) + 10, s.s, 0, Math.PI * 2); ctx.fill();
    }
    // 月亮
    const mx = W * 0.8, my = H * 0.14 + (1 - n) * H * 0.2, mr = Math.max(10, H * 0.045);
    ctx.globalAlpha = n;
    const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3);
    glow.addColorStop(0, 'rgba(226,232,255,0.45)'); glow.addColorStop(1, 'rgba(226,232,255,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(mx, my, mr * 3, 0, Math.PI * 2); ctx.fill();
    // 月牙：左半外圓 + 內側橢圓圍出的區域
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(mx, my, mr, Math.PI / 2, Math.PI * 1.5, false);
    ctx.ellipse(mx, my, mr * 0.4, mr, 0, Math.PI * 1.5, Math.PI / 2, true);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (env.type === 'tide') {
    const level = 5 + 26 * st.water;              // 水深（px）
    const base = ground + 12;
    const top = base - level;
    const amp = 1.5 + 3 * st.water;
    const waveY = (x, k, ph) => top + Math.sin(x * k + ph) * amp;
    ctx.save();
    // 水體
    const g = ctx.createLinearGradient(0, top - amp, 0, base + 20);
    g.addColorStop(0, `rgba(56, 189, 248, ${0.35 + 0.2 * st.water})`);
    g.addColorStop(1, `rgba(14, 116, 144, ${0.45 + 0.2 * st.water})`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, base + 20);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, waveY(x, 0.045, -st.wave * 3));
    ctx.lineTo(W, base + 20); ctx.closePath(); ctx.fill();
    // 浪花線
    ctx.strokeStyle = 'rgba(240, 253, 255, 0.85)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) { const y = waveY(x, 0.045, -st.wave * 3); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // 流向箭頭（潮水期間）
    const f = st.flow;
    if (Math.abs(f) > 0.25) {
      const dir = f < 0 ? -1 : 1;
      const gap = 90, off = ((st.wave * 40) % gap + gap) % gap;
      ctx.globalAlpha = Math.min(1, (Math.abs(f) - 0.25) / 0.5);
      ctx.strokeStyle = '#f0fdff'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const y = top + level * 0.5 + 2, sz = 5 + 3 * st.water;
      for (let x = off - gap; x < W + gap; x += gap) {
        for (const d of [0, 10]) {
          const cx = x + d * dir;
          ctx.beginPath(); ctx.moveTo(cx - sz * dir, y - sz); ctx.lineTo(cx, y); ctx.lineTo(cx - sz * dir, y + sz); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
}

export function drawAll(ctx, world, getCanvasWidth, getCanvasHeight, currentStage, timeScale, viewX = 0){
  ctx.save();
  ctx.translate(-viewX, 0);
  const W = getCanvasWidth(), H = getCanvasHeight();
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,SKIN.field.skyTop); g.addColorStop(1,SKIN.field.skyBottom);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const ground= H*0.72;
  const envSt = envState(world);
  drawEnvBack(ctx, world, envSt, W, H);
  ctx.fillStyle=SKIN.field.ground; ctx.fillRect(0,ground+12,W,H-(ground+12));
  ctx.fillStyle=SKIN.field.groundEdge; for(let x=0;x<W;x+=18) ctx.fillRect(x, ground+10+((x/18)%2)*2, 14,4);
  drawCatBase(ctx, 50,  ground, true,  world.leftHp / world.leftMaxHp);
  drawCatBase(ctx, 50 + world.cfg.towerDistance, ground, false, world.rightHp / world.rightMaxHp);
  for(const u of world.units){
    drawUnit(ctx,u,world.time);
  }
  drawEnvFront(ctx, world, envSt, W, H, ground);
  ctx.restore();
  const screenW=getCanvasWidth(), screenH=getCanvasHeight();
  ctx.fillStyle=SKIN.field.text; ctx.font='bold 14px ui-sans-serif, system-ui';
  const bossFlag=world.cfg.isBoss?' (BOSS)':'';
  ctx.fillText(`Stage ${currentStage}${bossFlag}  Time ${world.time.toFixed(1)}s  ${timeScale}x`,10,18);
  ctx.fillText(`Units ${world.units.length}`,10,36);
  if(world.state==='win'||world.state==='lose'){
    ctx.save(); ctx.globalAlpha=.75; ctx.fillStyle='#000'; ctx.fillRect(0,0,screenW,screenH); ctx.restore();
    ctx.fillStyle='#fff'; ctx.font='bold 32px ui-sans-serif, system-ui'; ctx.textAlign='center';
    const winMsg = `勝利！+${world.cfg.rewardCoins} 金幣`;
    ctx.fillText(world.state==='win'?winMsg:'戰敗…', screenW/2, screenH/2); ctx.font='14px ui-sans-serif, system-ui'; ctx.fillText('返回大廳中…', screenW/2, screenH/2+26); ctx.textAlign='left';
  }
}
