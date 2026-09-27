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

export function drawAll(ctx, world, getCanvasWidth, getCanvasHeight, currentStage, timeScale, viewX = 0){
  ctx.save();
  ctx.translate(-viewX, 0);
  const W = getCanvasWidth(), H = getCanvasHeight();
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,SKIN.field.skyTop); g.addColorStop(1,SKIN.field.skyBottom);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const ground= H*0.72;
  ctx.fillStyle=SKIN.field.ground; ctx.fillRect(0,ground+12,W,H-(ground+12));
  ctx.fillStyle=SKIN.field.groundEdge; for(let x=0;x<W;x+=18) ctx.fillRect(x, ground+10+((x/18)%2)*2, 14,4);
  drawCatBase(ctx, 50,  ground, true,  world.leftHp / world.leftMaxHp);
  drawCatBase(ctx, 50 + world.cfg.towerDistance, ground, false, world.rightHp / world.rightMaxHp);
  for(const u of world.units){
    drawUnit(ctx,u,world.time);
  }
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
