# 關卡 — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [LV-001] 修正第二章第 9 關錯誤的敵人 key，並全面檢查出怪設定
- 狀態：已完成
- 優先度：高
- 來自：CEO（2026-09-27）
- 依賴：無

**需求**
1. `src/data/spawns2.js` 第 9 關（約第 103 行）的 `{ time: 2, type: '小丑魚', multiplier: 1000 }`：`type` 用了中文名，程式找不到 key，會改成「小狗 ×1000%」。改成 `type: 'clownfish'`。
2. 檢查 `spawns.js`、`spawns2.js` 所有 `type` 與 `boss.key`，確認都對得到 `src/data/enemies.js` 中 `ENEMIES` / `BOSSES` 的 key。
3. `spawns.js` 開頭註解說 `multiplier` 是「數量倍率」，這是錯的，實際上是 **HP 與攻擊的百分比倍率**。請更正註解，並補上程式有支援但註解沒寫的 `count` 欄位（週期出怪的總次數上限）。

**完成條件**
- 所有 `type` / `boss.key` 都是合法 key（在回報中列出檢查方式）。
- `npm run build` 成功。
- 更新 `docs/PROJECT_MAP.md` 第 5 章（若有需要）。

### 回報（負責角色填寫）
- 修改檔案：`src/data/spawns2.js`、`src/data/spawns.js`（僅註解）、`docs/PROJECT_MAP.md` §5、`docs/CHANGELOG.md`
- 做了什麼：
  1. `spawns2.js` 第 9 關 `type: '小丑魚'` → `type: 'clownfish'`（multiplier 1000 維持不變）。
  2. 全面檢查兩章所有 `schedule[].type` 與 `boss.key`：共 246 筆，全部對得到 `ENEMIES` / `BOSSES` 的 key，除上述一筆外無其他錯誤。
  3. `spawns.js` 開頭註解：`multiplier` 改寫為「HP 與攻擊的百分比倍率（不是數量）」；補上 `count` 欄位說明（有 interval 時預設無限、否則為 1，對應 `Battle.jsx` 第 240 行 `e.count ?? (interval ? Infinity : 1)`）；另註明 type 填錯會被當成 dog。
- 如何驗證：
  - 用 Node 腳本 import `SPAWNS`、`SPAWNS2`、`ENEMIES`、`BOSSES`，逐一檢查每關 `schedule[].type` 與 `boss.key` 是否 `in ENEMIES || in BOSSES` → `checked 246, bad 0`。
  - `npm run build` 成功。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：`src/data/spawns2.js`、`src/data/spawns.js`，以及 `docs/PROJECT_MAP.md` §5、`docs/CHANGELOG.md` 中 LV-001 那一行。工作目錄裡 `App.jsx`、`world.js`、`LevelSelect.jsx`、`HudInfo.jsx` 的改動不是關卡角色改的，不屬於 LV-001。
  - `docs/PROJECT_MAP.md` §11 已知問題表的 #1、#10 修好了，那張表由 CEO 維護，請 CEO 更新。
  - 難度疑慮：見下方備註。
- 備註：2-9 開場 2 秒就出一隻 ×1000% 小丑魚（HP 1350、攻擊 150），修正後難度會與原本的「小狗 ×1000%」（HP 900、攻擊 90）不同，偏難一些。這是原設計意圖所以先保留，若 CEO 認為要調整倍率請再派工。

### 審核（CEO 填寫）
- 2026-09-27 通過。diff 只動到 spawns.js 註解與 spawns2.js 一行，範圍正確；build 成功。2-9 改為小丑魚 ×1000% 後偏難，接受（符合原設計意圖），暫不調整。
- 2026-09-27 補註：LV-001 已完成後補寫「給 CEO 的注意事項」，所列事項（commit 範圍、§11 #1/#10 更新、難度疑慮）皆已於前次審核處理完畢，無需再動作。

## [LV-002] 章節環境機制：關卡資料
- 狀態：已完成
- 優先度：高
- 來自：CEO（2026-09-27，使用者選定新特色「章節環境機制」）
- 依賴：無（可與 EG-003 同時進行）

**設計文件**：`docs/design/chapter-environment.md`（**先完整讀過**；§4 介面是合約，不可自行更改，有問題寫進 `docs/tasks/ceo.md`）

**需求**
1. `src/data/stages.js`：新增並匯出 `CHAPTER_ENV`（內容照設計文件 §4.1）；`stageConfig()` 回傳值新增 `env`（章節預設與關卡 `env` 合併後的物件；`env: false` 或該章無預設時為 `null`）。
2. `spawns.js` / `spawns2.js`：依設計文件 §3 的建議設定每關 `env`（第一章 1~3 關、第二章第 1 關 `env: false`），BOSS 關可視情況調整參數。每個調整在回報中說明理由。
3. 目前**先不要**為了環境大改出怪排程；等 EC-001 試玩後再平衡。

**完成條件**
- 用 Node 列出兩章每關的 `stageConfig(n, ch).env`，貼在回報中。
- `npm run build`、`npm test` 通過；更新 `docs/PROJECT_MAP.md` §5。

### 回報（負責角色填寫）
- 修改檔案：`src/data/stages.js`、`src/data/spawns.js`、`src/data/spawns2.js`、`docs/PROJECT_MAP.md` §5、`docs/CHANGELOG.md`
- 做了什麼：
  1. `stages.js`：新增並匯出 `CHAPTER_ENV`（內容與設計文件 §4.1 完全相同）；新增內部函式 `resolveEnv(chapter, stageEnv)`；`stageConfig()` 回傳值新增 `env`。規則：該章沒有預設或關卡 `env === false` → `null`；關卡 `env` 為物件 → `{ ...章節預設, ...關卡 env }`；省略 → 章節預設的副本。每次都回傳新物件，引擎改它不會影響 `CHAPTER_ENV`。
  2. `spawns.js` / `spawns2.js`：只在需要的關卡加 `env`，其他沿用章節預設。**出怪排程、HP、獎勵都沒動**。
     - 1-1、1-2、1-3：`env: false`，照設計文件 §3，留給新手熟悉基本操作。
     - 1-10（第一隻 BOSS 野豬王）：沿用預設。這是玩家第一次打 BOSS，不額外加難度。
     - 1-15：`nightLength: 30`。星眼巨像在第 45 秒出場，剛好是第一次夜晚開始的時間（白天 45 秒），玩家會在預告中看到 BOSS 和夜晚一起來；夜晚拉長 5 秒，讓這個「BOSS 夜襲」更有壓力，賞金 ×1.5 的時間也多一點。
     - 1-19：`nightLength: 35`。野豬王在第 40 秒出場，第 45 秒入夜，BOSS 到前線時正好是夜晚；夜晚拉長讓這關成為「撐過長夜」的關卡。
     - 1-20（章末）：`dayLength: 40, nightLength: 35`。章末關夜晚佔比提高（約 47%，預設約 36%），並讓夜晚更早來。
     - 2-1：`env: false`，照設計文件 §3。
     - 2-10（章魚王）：沿用預設。
     - 2-15、2-17：`pushSpeed: 20`。這兩關兩堡距離只有 350px，預設推力 32 × 6 秒 = 192px，超過整張地圖一半，一次漲潮幾乎就能把敵人送到我方主堡前；降到 20（一波 120px，約 1/3 張地圖）。
     - 2-20（章末，幽靈鯊）：`calmLength: 20`，潮水更頻繁。幽靈鯊有擊退免疫、不會被潮水推，潮汐只會推動雙方小兵和我方貓，BOSS 關特別考驗看潮水的時機。
  3. `spawns.js` 開頭的格式註解補上 `env` 欄位說明。
- 如何驗證：
  - `npm run build` 成功；`npm test` 通過（1 passed）。
  - 用 Node 腳本 import `stageConfig` / `getMaxStage`，列出兩章每關的 `stageConfig(n, ch).env`（下方）。另外確認：修改回傳的 env 不會影響其他關（`mutation-safe: true`）；不存在的第 3 章回傳 `null`；LV-001 的敵人 key 檢查重跑仍是 `checked 246, bad 0`。
  ```
  1-1 ~ 1-3: null
  1-4 ~ 1-14, 1-16 ~ 1-18: dayNight dayLength=45 nightLength=25 warnTime=5 enemyAtkMul=1.2 enemySpeedMul=1.15 bountyMul=1.5 startPhase=day
  1-15: dayNight dayLength=45 nightLength=30 warnTime=5 enemyAtkMul=1.2 enemySpeedMul=1.15 bountyMul=1.5 startPhase=day
  1-19: dayNight dayLength=45 nightLength=35 warnTime=5 enemyAtkMul=1.2 enemySpeedMul=1.15 bountyMul=1.5 startPhase=day
  1-20: dayNight dayLength=40 nightLength=35 warnTime=5 enemyAtkMul=1.2 enemySpeedMul=1.15 bountyMul=1.5 startPhase=day
  2-1: null
  2-2 ~ 2-14, 2-16, 2-18, 2-19: tide calmLength=24 surgeLength=6 warnTime=4 pushSpeed=32
  2-15: tide calmLength=24 surgeLength=6 warnTime=4 pushSpeed=20
  2-17: tide calmLength=24 surgeLength=6 warnTime=4 pushSpeed=20
  2-20: tide calmLength=20 surgeLength=6 warnTime=4 pushSpeed=32
  ```
  （原始輸出是逐關 40 行，內容相同，這裡把相同的連續關卡合併列出。）
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：`src/data/stages.js`、`src/data/spawns.js`、`src/data/spawns2.js`，以及 `docs/PROJECT_MAP.md` §5 新增的「章節環境機制」小節、`docs/CHANGELOG.md` 的 LV-002 那一行。
  - 沒有更動 §4 介面合約。`env` 物件會多帶一個 `type` 欄位，也是照 §4.1 的 `CHAPTER_ENV` 原樣。
  - EG-003 的 `createEnv(envCfg)` 會直接收到 `stageConfig().env`，關卡不啟用時是 `null`。
  - 引擎還沒完成，這些環境參數只驗證過資料正確，還沒實際試玩。1-15/1-19/1-20 的夜晚長度和 2-15/2-17 的推力都要等 EC-001 試玩後確認。
  - 除了 env 之外，出怪排程完全沒改（依需求第 3 點）。

### 審核（CEO 填寫）
- 2026-09-27 通過。CHAPTER_ENV 與合約一致；各關調整都有理由（2-15、2-17 小地圖降低推力的判斷很好）；build、test 通過。實際手感交由 EC-001 試玩。


## [LV-003] 章節環境數值調整（EC-001 試玩結果）
- 狀態：待處理
- 優先度：中
- 來自：經濟（2026-09-27）
- 依賴：EC-001（**CEO 已於 2026-09-27 核准數值，可以開工**）

**需求**
EC-001 用模擬（重用真實引擎，比較同一玩家強度下「有環境 / 無環境」的勝率）發現：第一章夜晚在「剛好打得過」的戰力下讓勝率大幅下降，而夜晚多給的魚不足以補回。請依下列數字修改（詳細數據見 `docs/tasks/economy.md` EC-001 回報）：

1. `src/data/stages.js` 的 `CHAPTER_ENV[1]`（其他欄位不動）：
   - `enemyAtkMul`：1.2 → **1.15**
   - `enemySpeedMul`：1.15 → **1.1**
   - `bountyMul`：1.5 → **1.75**
2. `src/data/spawns.js` 第 4 關（第一個有夜晚的關卡）加上 `env: { dayLength: 70 }`：
   - 原因：預設第一個夜晚在 45~70 秒，剛好壓在本關最重的一波（32 秒小蛇 ×300、37/45 秒紅色怪）上。第一次白天拉長到 70 秒，玩家先處理完開場再見識夜晚。
3. 第二章潮汐：`CHAPTER_ENV[2]` 與各關覆寫**維持不變**。
   - 注意：2-5 在**沒有潮汐時是僵局**（寄居蟹 ×500 擋住，打不到敵堡），是靠退潮才打得過。之後若要把 2-5 改成 `env: false` 或降低推力，要一起重新調整出怪。
4. 各關 `reward` **不需要調整**（見 EC-001 回報）。

**完成條件**
- `stageConfig(n, 1).env` 反映上述新值，1-4 的 `dayLength` 為 70，其他關的覆寫（1-15、1-19、1-20）照舊。
- `npm run build`、`npm test` 通過（`environment.test.js` 用的是測試內自己的參數，不應受影響；若有失敗請回報）。
- 同步更新 `docs/PROJECT_MAP.md` §5 的逐關 env 表。

### 回報（負責角色填寫）
- 修改檔案：
- 做了什麼：
- 如何驗證：
- 新增給其他角色的請求：
- 收尾：
- 給 CEO 的注意事項：

### 審核（CEO 填寫）
