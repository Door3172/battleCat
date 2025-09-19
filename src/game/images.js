// 角色圖片加載和動畫系統
const characterImages = {};
const animationStates = new Map();

// 動畫狀態枚舉
export const AnimationState = {
  IDLE: 'idle',
  MOVE: 'move',
  ATTACK: 'attack',
  APPEAR: 'appear',
  HURT: 'hurt'
};

// 預加載所有角色圖片
export function preloadImages() {
  const characterTypes = [
    'white', 'void', 'archer', 'azurePhantom', 'bird', 'cow', 'fish', 
    'giant', 'knight', 'lizard', 'mage', 'ninja', 'samurai', 'sumo', 
    'tank', 'viking'
  ];
  
  characterTypes.forEach(type => {
    const img = new Image();
    img.src = `/pic/${type}.png`;
    characterImages[type] = img;
  });
}

// 獲取角色圖片
export function getCharacterImage(type) {
  // 如果圖片尚未加載，則加載它
  if (!characterImages[type]) {
    const img = new Image();
    img.src = `/pic/${type}.png`;
    characterImages[type] = img;
  }
  return characterImages[type];
}

// 設置單位的動畫狀態
export function setAnimationState(unitId, state, duration = 0.5) {
  animationStates.set(unitId, {
    state,
    startTime: Date.now(),
    duration: duration * 1000, // 轉換為毫秒
    time: 0
  });
}

// 獲取單位的動畫幀
export function getAnimationFrame(unit) {
  const unitId = unit.id;
  
  // 如果沒有動畫狀態，設置為默認狀態
  if (!animationStates.has(unitId)) {
    setAnimationState(unitId, unit.moving ? AnimationState.MOVE : AnimationState.IDLE);
  }
  
  const animation = animationStates.get(unitId);
  const now = Date.now();
  const elapsed = now - animation.startTime;
  
  // 更新動畫時間
  animation.time = Math.min(1, elapsed / animation.duration);
  
  // 如果動畫完成，根據單位狀態設置新的動畫
  if (animation.time >= 1) {
    if (animation.state === AnimationState.APPEAR) {
      setAnimationState(unitId, unit.moving ? AnimationState.MOVE : AnimationState.IDLE);
    } else if (animation.state === AnimationState.ATTACK) {
      setAnimationState(unitId, unit.moving ? AnimationState.MOVE : AnimationState.IDLE);
    } else if (animation.state === AnimationState.HURT) {
      setAnimationState(unitId, unit.moving ? AnimationState.MOVE : AnimationState.IDLE);
    } else {
      // 更新移動狀態
      if (unit.moving && animation.state !== AnimationState.MOVE) {
        setAnimationState(unitId, AnimationState.MOVE);
      } else if (!unit.moving && animation.state === AnimationState.MOVE) {
        setAnimationState(unitId, AnimationState.IDLE);
      }
    }
  }
  
  return animation;
}

// 當單位攻擊時調用
export function triggerAttackAnimation(unitId) {
  setAnimationState(unitId, AnimationState.ATTACK, 0.3);
}

// 當單位受傷時調用
export function triggerHurtAnimation(unitId) {
  setAnimationState(unitId, AnimationState.HURT, 0.2);
}

// 當單位出場時調用
export function triggerAppearAnimation(unitId) {
  setAnimationState(unitId, AnimationState.APPEAR, 0.5);
}

// 初始化動畫系統
export function initAnimationSystem() {
  preloadImages();
}