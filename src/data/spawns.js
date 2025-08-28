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
//         multiplier: 150,    // 數量倍率（百分比），100 為原始值（可選）
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
    schedule: [
      { start: 10, interval: 15, type: 'dog', multiplier: 100 },
      { start: 30, interval: 40, type: 'dog', multiplier: 100 },
      { time: 30, type: 'dog', multiplier: 150 },
    ],
  },
  2: {
    enemyBaseHp: 600,
    schedule: [
      { start: 10, interval: 15, type: 'dog', multiplier: 100 },
      { start: 25, interval: 35, type: 'dog', multiplier: 110 },
      { time: 30, type: 'dog', multiplier: 150 },
      { time: 20, type: 'snake', multiplier: 100 },
      { time: 45, type: 'snake', multiplier: 100 },
      { time: 55, type: 'snake', multiplier: 100 },
    ],
  },
  3: {
    enemyBaseHp: 650,
    schedule: [
      { start: 10, interval: 17, type: 'dog', multiplier: 100 },
      { start: 30, interval: 13, type: 'dog', multiplier: 100 },
      { start: 8, interval: 15, type: 'snake', multiplier: 100 },
      { time: 30, type: 'snake', multiplier: 140 },
    ],
  },
  4: {
    enemyBaseHp: 650,
    schedule: [
      { start: 11, interval: 18, type: 'dog', multiplier: 100 },
      { start: 30, interval: 12, type: 'dog', multiplier: 110 },
      { start: 7, interval: 15, type: 'snake', multiplier: 100 },
      { time: 15, type: 'red', multiplier: 100 },
      { time: 37, type: 'red', multiplier: 100 },
      { time: 42, type: 'red', multiplier: 100 },
      { time: 32, type: 'snake', multiplier: 150 },
    ],
  },
  5: {
    enemyBaseHp: 1000,
    schedule: [
      { start: 8, interval: 9, type: 'dog', multiplier: 110 },
      { start: 16, interval: 17, type: 'red', multiplier: 100 },
      { start: 11, interval: 14, type: 'snake', multiplier: 100 },
      { time: 1, type: 'hippo', multiplier: 100 },
      { time: 37, type: 'red', multiplier: 110 },
    ],
  },
  6: {
    enemyBaseHp: 850,
    schedule: [
      { start: 8, interval: 9, type: 'dog', multiplier: 110 },
      { start: 22, interval: 11, type: 'dog', multiplier: 100 },
      { start: 16, interval: 20, type: 'red', multiplier: 100 },
      { start: 5, interval: 45, type: 'red', multiplier: 105 },
      { start: 11, interval: 10, type: 'snake', multiplier: 110 },
      { start: 6, interval: 19, type: 'snake', multiplier: 100 },
      { time: 30, type: 'black', multiplier: 100 },
      { time: 30, type: 'black', multiplier: 100 },
      { time: 130, type: 'black', multiplier: 100 },
      { time: 130, type: 'black', multiplier: 100 },
      { time: 130, type: 'black', multiplier: 100 },
    ],
  },
  7: {
    enemyBaseHp: 1050,
    schedule: [
      { start: 8, interval: 8, type: 'dog', multiplier: 100 },
      { start: 12, interval: 17, type: 'red', multiplier: 100 },
      { start: 10, interval: 10, type: 'snake', multiplier: 100 },
      { start: 5, interval: 40, type: 'hippo', multiplier: 100 },
      { start: 6, interval: 21, type: 'black', multiplier: 100 },
      { time: 30, type: 'boar', multiplier: 100 },

    ],
  },
  8: {
    enemyBaseHp: 1000,
    schedule: [
      { start: 10, interval: 18, type: 'red', multiplier: 100 },
      { start: 10, interval: 10, type: 'snake', multiplier: 110 },
      { start: 10, interval: 15, type: 'black', multiplier: 100 },
      { time: 1, type: 'metal', multiplier: 100 },
      { time: 100, type: 'metal', multiplier: 100 },
      { time: 160, type: 'metal', multiplier: 100 },
      { time: 1, type: 'boar', hp: 600, multiplier: 100 },
      { time: 1, type: 'boar', hp: 500, multiplier: 100 },
    ],
  },
  9: {
    enemyBaseHp: 1200,
    schedule: [
      { start: 15, interval: 16, type: 'red', multiplier: 105 },
      { start: 6, interval: 28, type: 'boar', multiplier: 100 },
      { start: 12, interval: 24, type: 'hippo', multiplier: 100 },
      { time: 25, type: 'alien', multiplier: 100 },
      { time: 40, type: 'alien', multiplier: 110 },
      { time: 48, type: 'alien', multiplier: 100 },
    ],
  },
  10: {
    enemyBaseHp: 1500,
    schedule: [
      { start: 8, interval: 10, type: 'dog', multiplier: 100 },
      { start: 30, interval: 23, type: 'dog', multiplier: 100 },
      { start: 32, interval: 28, type: 'red', multiplier: 100 },
      { start: 12, interval: 28, type: 'alien', multiplier: 100 },
      { start: 12, interval: 34, type: 'hippo', multiplier: 100 },
      { time: 45, type: 'alien', multiplier: 105 },
      { time: 1, type: 'boarKing', hp: 1400, multiplier: 100 },
      { time: 1, interval: 20, type: 'black', hp: 1400, multiplier: 100 },
      { time: 1, type: 'boar', hp: 1400, multiplier: 100 },
      { time: 1, type: 'boar', hp: 1000, multiplier: 120 },
    ],
  },
};
