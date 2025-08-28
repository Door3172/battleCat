// 指定各關卡的敵人生成時間表
// key 為關卡數字，value 為陣列：
//   {
//     type: 'dog',        // 敵人種類（對應 src/data/enemies.js 的 key）
//     time: 5,            // 指定秒數出現一次
//     start: 10,          // 從第幾秒開始生（可選）
//     interval: 8,        // 幾秒生一次（可選）
//     until: 60,          // 到幾秒為止停止生怪（可選）
//     hp: 500,            // 敵方城堡血量降到多少時才開始生（可選）
//   }
// - 若僅提供 time，表示單次生成
// - 若提供 interval，則會在 start（預設 0）之後每隔 interval 秒生成，
//   直到 until（若未指定則無限）為止
// - hp 可與 time/start/interval 搭配，需同時滿足條件才會生成
export const SPAWNS = {
  1: [
    // 5、15、30 秒各出一隻狗
    { time: 5, type: 'dog' },
    { time: 15, type: 'dog' },
    { time: 30, type: 'dog' },
    // 從 40 秒開始每 7 秒出一隻紅色敵人，直到 80 秒停止
    { start: 40, interval: 7, until: 80, type: 'dog' },
    // 敵方城堡 HP ≤ 500 時開始每 6 秒出一隻狗（無限）
    { hp: 500, interval: 6, type: 'dog' },
  ],
};
