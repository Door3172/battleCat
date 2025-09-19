import { SKIN } from '../data/skin.js';
import { BODY_W } from './world.js';
import { getCharacterImage, getAnimationFrame, AnimationState } from './images.js';

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

export function drawUnit(ctx, u) {
  ctx.save();
  ctx.translate(u.x, u.y);
  const isCat = u.team === 1;
  const type = u.type || (isCat ? 'white' : 'void');
  const img = getCharacterImage(type);
  const animation = getAnimationFrame(u);
  
  // 如果有圖片，使用圖片繪製
  if (img && img.complete) {
    const scale = 0.5; // 調整圖片大小
    const width = 80 * scale;
    const height = 80 * scale;
    
    // 根據動畫狀態應用效果
    let offsetY = 0;
    let offsetX = 0;
    let scaleX = isCat ? 1 : -1; // 敵人朝向左邊
    
    if (animation.state === AnimationState.APPEAR) {
      // 出場動畫：從上方降落
      offsetY = -20 * (1 - animation.time * 2);
    } else if (animation.state === AnimationState.ATTACK) {
      // 攻擊動畫：前傾
      offsetX = isCat ? 5 : -5;
    } else if (animation.state === AnimationState.MOVE) {
      // 移動動畫：上下輕微彈跳
      offsetY = Math.sin(animation.time * 10) * 2;
    }
    
    // 繪製角色圖片
    ctx.save();
    ctx.scale(scaleX, 1);
    ctx.drawImage(img, offsetX * scaleX, -height + offsetY, width, height);
    ctx.restore();
    
    // 繪製血條
    const hpPct = Math.max(0, Math.min(1, u.hp / u.maxHp));
    ctx.fillStyle = SKIN.color.ink;
    ctx.fillRect(-BODY_W/2, 12, BODY_W, 4);
    ctx.fillStyle = hpPct > 0.5 ? SKIN.color.ok : hpPct > 0.2 ? SKIN.color.warn : SKIN.color.danger;
    ctx.fillRect(-BODY_W/2, 12, BODY_W * hpPct, 4);
    
    // 繪製名稱
    ctx.fillStyle = SKIN.color.ink;
    ctx.font = '11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(isCat ? u.name : '敵', 0, -6);
  } else {
    // 備用繪製方法（如果圖片未加載）
    ctx.fillStyle = u.color;
    ctx.strokeStyle = SKIN.color.ink;
    ctx.lineWidth = 2;
    roundRect(ctx, -BODY_W/2, -16, BODY_W, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    
    if (isCat) {
      ctx.moveTo(-8, -16);
      ctx.lineTo(-2, -24);
      ctx.lineTo(0, -16);
      ctx.moveTo(8, -16);
      ctx.lineTo(2, -24);
      ctx.lineTo(0, -16);
    } else {
      ctx.moveTo(-6, -16);
      ctx.lineTo(0, -22);
      ctx.lineTo(6, -16);
    }
    
    ctx.stroke();
    
    const hpPct = Math.max(0, Math.min(1, u.hp / u.maxHp));
    ctx.fillStyle = SKIN.color.ink;
    ctx.fillRect(-BODY_W/2, 12, BODY_W, 4);
    ctx.fillStyle = hpPct > 0.5 ? SKIN.color.ok : hpPct > 0.2 ? SKIN.color.warn : SKIN.color.danger;
    ctx.fillRect(-BODY_W/2, 12, BODY_W * hpPct, 4);
    
    ctx.fillStyle = SKIN.color.ink;
    ctx.font = '11px ui-sans-serif, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(isCat ? u.name : '敵', 0, -6);
  }
  
  ctx.restore();
}

export function drawAll(ctx, world, getCanvasWidth, getCanvasHeight, currentStage, timeScale, viewX = 0){
  ctx.save();
  ctx.translate(-viewX, 0);
  const W = getCanvasWidth(), H = getCanvasHeight();
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
    const winMsg = `勝利！+${world.cfg.rewardCoins} 金幣`;
    ctx.fillText(world.state==='win'?winMsg:'戰敗…', screenW/2, screenH/2); ctx.font='14px ui-sans-serif, system-ui'; ctx.fillText('返回大廳中…', screenW/2, screenH/2+26); ctx.textAlign='left';
  }
}
