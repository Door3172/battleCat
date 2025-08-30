// 指定各關卡的敵人生成設定
// key 為關卡數字，value 為物件：
//   {
//     enemyBaseHp: 1000,      // 敵方城堡血量（可省略）
//     towerDistance: 800,     // 兩城距離（可省略）
//     schedule: [             // 出怪排程
//       {
//         type: 'dog',        // 敵人種類（對應 src/data/enemies.js 的 key）
//         time: 5,            // 指定秒數出現一次
//         start: 10,          // 從第幾秒開始生（可選）
//         interval: 8,        // 幾秒生一次（可選）
//         until: 60,          // 到幾秒為止停止生怪（可選）
//         hp: 500,            // 敵方城堡血量降到多少時才開始生（可選）
//         multiplier: 150,    // 敵人倍率（百分比），100 為原始值（可選）
//       },
//       // ...
//     ]
//   }
// - 若僅提供 time，表示單次生成
// - 若提供 interval，則會在 start（預設 0）之後每隔 interval 秒生成，
//   直到 until（若未指定則無限）為止
// - hp 可與 time/start/interval 搭配，需同時滿足條件才會生成
// - multiplier 為敵人生成的數量倍率，未設定時視為 100%
//export const SPAWNS = {
//  1: {
//    enemyBaseHp: 500,
//    towerDistance: 100,
//    schedule: [
// 5、15、30 秒各出一隻狗
//      { time: 5, type: 'dog', multiplier: 100 },
//      { time: 15, type: 'dog', multiplier: 100 },
//      { time: 30, type: 'dog', multiplier: 100 },
// 從 40 秒開始每 7 秒出一隻紅色敵人，直到 80 秒停止
//      { start: 40, interval: 7, until: 80, type: 'dog', multiplier: 100 },
// 敵方城堡 HP ≤ 500 時開始每 6 秒出一隻狗（無限）
//      { hp: 500, interval: 6, type: 'dog', multiplier: 100 },
//    ],
//  },
//};
export const SPAWNS = {
  1: {
    enemyBaseHp: 500,
    towerDistance: 650,
    reward: 120,
    schedule: [
      { start: 10, interval: 15, type: 'dog', multiplier: 100 },
      { start: 30, interval: 40, type: 'dog', multiplier: 100 },
      { time: 31, type: 'dog', multiplier: 150 },
    ],
  },
  2: {
    enemyBaseHp: 600,
    reward: 130,
    schedule: [
      { start: 10, interval: 15, type: 'dog', multiplier: 100 },
      { start: 25, interval: 35, type: 'dog', multiplier: 150 },
      { time: 30, type: 'dog', multiplier: 150 },
      { time: 20, type: 'snake', multiplier: 100 },
      { time: 45, type: 'snake', multiplier: 100 },
      { time: 55, type: 'snake', multiplier: 100 },
    ],
  },
  3: {
    enemyBaseHp: 650,
    reward: 140,
    schedule: [
      { start: 10, interval: 17, type: 'dog', multiplier: 150 },
      { start: 30, interval: 13, type: 'dog', multiplier: 100 },
      { start: 8, interval: 15, type: 'snake', multiplier: 150 },
      { time: 30, type: 'snake', multiplier: 300 },
    ],
  },
  4: {
    enemyBaseHp: 650,
    reward: 160,
    schedule: [
      { start: 11, interval: 18, type: 'dog', multiplier: 150 },
      { start: 30, interval: 12, type: 'dog', multiplier: 150 },
      { start: 7, interval: 15, type: 'snake', multiplier: 150 },
      { time: 15, type: 'red', multiplier: 100 },
      { time: 37, type: 'red', multiplier: 100 },
      { time: 45, type: 'red', multiplier: 150 },
      { time: 32, type: 'snake', multiplier: 300 },
    ],
  },
  5: {
    enemyBaseHp: 1000,
    towerDistance: 800,
    reward: 250,
    schedule: [
      { start: 8, interval: 10, type: 'dog', multiplier: 200 },
      { start: 16, interval: 18, type: 'red', multiplier: 100 },
      { start: 11, interval: 15, type: 'snake', multiplier: 150 },
      { time: 1, type: 'hippo', multiplier: 100 },
      { time: 37, type: 'red', multiplier: 150 },
    ],
  },
  6: {
    enemyBaseHp: 850,
    reward: 240,
    schedule: [
      { start: 8, interval: 12, type: 'dog', multiplier: 200 },
      { start: 22, interval: 13, type: 'dog', multiplier: 150 },
      { start: 16, interval: 23, type: 'red', multiplier: 100 },
      { start: 5, interval: 47, type: 'red', multiplier: 200 },
      { start: 11, interval: 12, type: 'snake', multiplier: 175 },
      { start: 6, interval: 21, type: 'snake', multiplier: 150 },
      { time: 30, type: 'black', multiplier: 100 },
      { time: 130, type: 'black', multiplier: 250 },
    ],
  },
  7: {
    enemyBaseHp: 1050,
    reward: 260,
    schedule: [
      { start: 8, interval: 8, type: 'dog', multiplier: 250 },
      { start: 12, interval: 17, type: 'red', multiplier: 150 },
      { start: 10, interval: 10, type: 'snake', multiplier: 200 },
      { start: 5, interval: 40, type: 'hippo', multiplier: 150 },
      { start: 6, interval: 21, type: 'black', multiplier: 150 },
      { time: 30, type: 'boar', multiplier: 100 },

    ],
  },
  8: {
    enemyBaseHp: 1000,
    reward: 320,
    schedule: [
      { start: 10, interval: 18, type: 'red', multiplier: 200 },
      { start: 10, interval: 10, type: 'snake', multiplier: 300 },
      { start: 10, interval: 15, type: 'black', multiplier: 200 },
      { time: 60, type: 'boar', multiplier: 200 },
      { time: 1, type: 'boar', hp: 600, multiplier: 250 },
      { time: 1, type: 'boar', hp: 500, multiplier: 300 },
    ],
  },
  9: {
    enemyBaseHp: 1200,
    reward: 350,
    schedule: [
      { start: 13, interval: 16, type: 'red', multiplier: 175 },
      { start: 6, interval: 26, type: 'boar', multiplier: 125 },
      { start: 10, interval: 24, type: 'hippo', multiplier: 125 },
      { time: 0, type: 'snail', multiplier: 250 },
      { time: 25, type: 'alien', multiplier: 100 },
      { time: 40, type: 'alien', multiplier: 150 },
      { time: 48, type: 'alien', multiplier: 100 },
      { time: 60, type: 'snail', multiplier: 100 },
      { time: 90, type: 'alien', multiplier: 200 },
    ],
  },
  10: {
    enemyBaseHp: 1500,
    towerDistance: 1000,
    reward: 400,
    boss: { time: 1, key: 'boarKing', hp: 1400 },
    schedule: [
      { time: 6, type: 'black', multiplier: 150 },
      { time: 21, type: 'black', multiplier: 150 },
      { start: 8, interval: 10, type: 'dog', multiplier: 150 },
      { start: 30, interval: 24, type: 'dog', multiplier: 200 },
      { start: 32, interval: 28, type: 'red', multiplier: 150 },
      { start: 12, interval: 30, type: 'alien', multiplier: 125 },
      { start: 12, interval: 35, type: 'hippo', multiplier: 200 },
      { time: 45, type: 'alien', multiplier: 125 },
      { start: 1, interval: 20, type: 'black', hp: 1400, multiplier: 150 },
      { start: 1, interval: 60, type: 'snail', hp: 1499, multiplier: 100 },
      { time: 1, type: 'boar', hp: 1400, multiplier: 200 },
      { time: 1, type: 'boar', hp: 1000, multiplier: 300 },
    ],
  },
  11: {
    enemyBaseHp: 1000,
    towerDistance: 500,
    reward: 360,
    schedule: [
      { time: 1, type: 'bull', multiplier: 100 },
      { start: 10, interval: 10, type: 'dog', multiplier: 350 },
      { start: 10, interval: 12, type: 'snake', multiplier: 300 },
      { start: 60, interval: 35, type: 'dog', multiplier: 650 },
      { time: 60, type: 'bull', multiplier: 100 },
      { time: 65, type: 'bull', multiplier: 100 },
      { time: 70, type: 'bull', multiplier: 125 },
    ],
  },
  12: {
    enemyBaseHp: 1000,
    towerDistance: 800,
    reward: 360,
    schedule: [
      { start: 10, interval: 18, type: 'red', multiplier: 200 },
      { start: 30, interval: 28, type: 'red', multiplier: 275 },
      { start: 40, interval: 35, type: 'red', multiplier: 425 },
      { start: 30, interval: 20, type: 'red', hp: 900, multiplier: 175 },
      { start: 45, interval: 32, type: 'red', hp: 800, multiplier: 175 },
      { start: 90, interval: 21, type: 'red', hp: 300, multiplier: 225 },
      { start: 120, interval: 90, type: 'red', hp: 150, multiplier: 750 },
    ],
  },
  13: {
    enemyBaseHp: 1200,
    towerDistance: 700,
    reward: 400,
    schedule: [
      { start: 10, interval: 15, type: 'dog', multiplier: 250 },
      { start: 10, interval: 28, type: 'dog', multiplier: 400 },
      { start: 10, interval: 40, type: 'hippo', multiplier: 200 },
      { start: 10, interval: 18, type: 'snake', multiplier: 300 },
      { time: 40, type: 'bull', multiplier: 150 },
      { time: 30, type: 'elephant', multiplier: 100 },
    ],
  },
  14: {
    enemyBaseHp: 1200,
    towerDistance: 500,
    reward: 400,
    schedule: [
      { time: 7, type: 'alien', multiplier: 200 },
      { time: 8, type: 'alien', multiplier: 200 },
      { start: 10, interval: 10, type: 'alien', multiplier: 150 },
      { start: 15, interval: 15, type: 'alien', multiplier: 175 },
      { start: 20, interval: 20, type: 'alien', multiplier: 200 },
      { start: 25, interval: 25, type: 'alien', multiplier: 225 },
      { start: 30, interval: 30, type: 'alien', multiplier: 150 },
      { start: 35, interval: 35, type: 'alien', multiplier: 275 },
      { time: 30, type: 'alien', multiplier: 300 },
      { time: 60, type: 'alien', multiplier: 250 },
    ],
  },
  15: {
    enemyBaseHp: 2000,
    towerDistance: 900,
    reward: 660,
    boss: { time: 45, key: 'alienEye' },
    schedule: [
      { time: 5, type: 'black', multiplier: 150 },
      { time: 15, type: 'bull', multiplier: 125 },
      { start: 5, interval: 15, type: 'dog', multiplier: 400 },
      { start: 5, interval: 24, type: 'snake', multiplier: 225 },
      { start: 15, interval: 35, type: 'hippo', multiplier: 200 },
      { start: 10, interval: 40, type: 'bull', multiplier: 125 },
      { start: 0, interval: 45, type: 'snail', multiplier: 150 },
      { start: 20, interval: 30, type: 'alien', multiplier: 150 },
      { time: 45, type: 'alien', multiplier: 225 },
    ],
  },
  16: {
    enemyBaseHp: 1500,
    towerDistance: 900,
    reward: 425,
    schedule: [
      { start: 5, interval: 15, type: 'snake', multiplier: 250 },
      { start: 8, interval: 35, type: 'snake', multiplier: 500 },
      { start: 0, interval: 39, type: 'black', multiplier: 225 },
      { start: 10, interval: 25, type: 'black', multiplier: 400 },
      { start: 24, interval: 9, type: 'black', multiplier: 200 },
      { time: 15, type: 'elephant', multiplier: 125 },
    ],
  },
  17: {
    enemyBaseHp: 1600,
    towerDistance: 750,
    reward: 460,
    schedule: [
      { time: 15, type: 'elephant', multiplier: 125 },
      { time: 17, type: 'elephant', multiplier: 125 },
      { time: 19, type: 'elephant', multiplier: 125 },
      { start: 20, interval: 35, type: 'bull', multiplier: 250 },
    ],
  },
  18: {
    enemyBaseHp: 600,
    towerDistance: 625,
    reward: 600,
    schedule: [
      { time: 5, type: 'bull', multiplier: 250 },
      { start: 20, interval: 17, type: 'bull', multiplier: 100 },
      { start: 35, interval: 29, type: 'bull', multiplier: 125 },
      { start: 60, interval: 37, type: 'bull', multiplier: 175 },
      { start: 75, interval: 39, type: 'bull', multiplier: 125 },
      { start: 65, interval: 70, type: 'bull', multiplier: 200 },
      { time: 15, type: 'bull', multiplier: 175 },
      { time: 150, type: 'bull', multiplier: 500 },
    ],
  },
  19: {
    enemyBaseHp: 2000,
    towerDistance: 800,
    reward: 700,
    boss: { time: 40, key: 'boarKing' },
    schedule: [
      { time: 5, type: 'boar', multiplier: 150 },
      { time: 20, type: 'boar', multiplier: 175 },
      { start: 20, interval: 16, type: 'boar', multiplier: 150 },
      { start: 32, interval: 23, type: 'boar', multiplier: 225 },
      { start: 35, interval: 25, type: 'boar', multiplier: 175 },
      { time: 40, type: 'boar', multiplier: 250 },
    ],
  },
  20: {
    enemyBaseHp: 3000,
    towerDistance: 850,
    reward: 840,
    boss: { time: 3, key: 'mechGolem' },
    schedule: [
      { time: 15, type: 'bull', multiplier: 125 },
      { time: 15, type: 'elephant', multiplier: 150 },
      { start: 7, interval: 15, type: 'dog', multiplier: 500 },
      { start: 11, interval: 23, type: 'dog', multiplier: 300 },
      { start: 7, interval: 24, type: 'snake', multiplier: 325 },
      { start: 15, interval: 31, type: 'black', multiplier: 225 },
      { start: 10, interval: 37, type: 'hippo', multiplier: 225 },
      { start: 0, interval: 45, type: 'snail', multiplier: 250 },
      { start: 10, interval: 22, type: 'alien', multiplier: 175 },
      { start: 1, interval: 20, type: 'black', hp: 2000, multiplier: 200 },
      { start: 1, interval: 20, type: 'boar', hp: 2000, multiplier: 175 },
    ],
  },
};
