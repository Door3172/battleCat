import { SKIN } from '../data/skin.js';
import { BODY_W } from './world.js';

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
  ctx.fillStyle='#e5e7eb'; roundRect(ctx,-28,-74,56,8,4); ctx.fill();
  ctx.fillStyle= hpPct>0.5? SKIN.color.ok : hpPct>0.2? SKIN.color.warn : SKIN.color.danger; roundRect(ctx,-28,-74,56*Math.max(0,Math.min(1,hpPct)),8,4); ctx.fill();
  ctx.restore();
}

export function roundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,Math.abs(w/2),Math.abs(h/2));
  ctx.beginPath(); ctx.moveTo(x+rr,y); ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr); ctx.arcTo(x,y+h,x,y,rr); ctx.arcTo(x,y,x+w,y,rr); ctx.closePath();
}

export function drawUnit(ctx,u){
  ctx.save();
  ctx.translate(u.x,u.y);
  const isCat=u.team===1;
  ctx.fillStyle=u.color; ctx.strokeStyle=SKIN.color.ink; ctx.lineWidth=2;
  roundRect(ctx,-BODY_W/2,-16,BODY_W,24,6); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  if(isCat){ ctx.moveTo(-8,-16); ctx.lineTo(-2,-24); ctx.lineTo(0,-16); ctx.moveTo(8,-16); ctx.lineTo(2,-24); ctx.lineTo(0,-16);} else { ctx.moveTo(-6,-16); ctx.lineTo(0,-22); ctx.lineTo(6,-16);} ctx.stroke();
  const hpPct=Math.max(0,Math.min(1,u.hp/u.maxHp));
  ctx.fillStyle=SKIN.color.ink; ctx.fillRect(-BODY_W/2,12,BODY_W,4);
  ctx.fillStyle= hpPct>0.5?SKIN.color.ok: hpPct>0.2?SKIN.color.warn:SKIN.color.danger; ctx.fillRect(-BODY_W/2,12,BODY_W*hpPct,4);
  ctx.fillStyle = SKIN.color.ink; ctx.font = '11px ui-sans-serif, system-ui'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(isCat?u.name:'敵', 0, -6);
  ctx.restore();
}

export function drawAll(ctx, world, getWorldWidth, getWorldHeight, currentStage, timeScale, zoom){
  const W = getWorldWidth();
  const H = getWorldHeight();
  ctx.save();
  ctx.scale(zoom, zoom);
  const scaleX = (W - 100) / world.cfg.towerDistance;
  const baseX = 50;
  const toScreen = x => baseX + (x - baseX) * scaleX;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,SKIN.color.bgTop); g.addColorStop(1,SKIN.color.bgBottom);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const ground= getWorldHeight()*0.72;
export function drawAll(ctx, world, getCanvasWidth, getCanvasHeight, currentStage, timeScale, zoom = 1, viewX = 0){
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-viewX, 0);
  const W = getCanvasWidth()/zoom, H = getCanvasHeight()/zoom;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,SKIN.color.bgTop); g.addColorStop(1,SKIN.color.bgBottom);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  const ground= H*0.72;
  ctx.fillStyle='#a3b2c6'; ctx.fillRect(0,ground+12,W,H-(ground+12));
  ctx.fillStyle='#d6dee9'; for(let x=0;x<W;x+=18) ctx.fillRect(x, ground+10+((x/18)%2)*2, 14,4);
  drawCatBase(ctx, 50,  ground, true,  world.leftHp / world.leftMaxHp);
  drawCatBase(ctx, 50 + world.cfg.towerDistance, ground, false, world.rightHp / world.rightMaxHp);
  for(const u of world.units){
    drawUnit(ctx,u);
  }
  ctx.restore();
  const screenW=getCanvasWidth(), screenH=getCanvasHeight();
  ctx.fillStyle=SKIN.color.ink; ctx.font='bold 14px ui-sans-serif, system-ui';
  const bossFlag=world.cfg.isBoss?' (BOSS)':'';
  ctx.fillText(`Stage ${currentStage}${bossFlag}  Time ${world.time.toFixed(1)}s  ${timeScale}x`,10,18);
  ctx.fillText(`Units ${world.units.length}`,10,36);
  if(world.state==='win'||world.state==='lose'){
    ctx.save(); ctx.globalAlpha=.75; ctx.fillStyle='#000'; ctx.fillRect(0,0,screenW,screenH); ctx.restore();
    ctx.fillStyle='#fff'; ctx.font='bold 32px ui-sans-serif, system-ui'; ctx.textAlign='center';
    ctx.fillText(world.state==='win'?'勝利！+120 金幣':'戰敗…', screenW/2, screenH/2); ctx.font='14px ui-sans-serif, system-ui'; ctx.fillText('返回大廳中…', screenW/2, screenH/2+26); ctx.textAlign='left';
  }
  ctx.restore();
}
