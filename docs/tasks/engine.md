# 戰鬥引擎 — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [EG-001] 移除 Battle.jsx 未使用的 SKIN import
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-27，源自 UI-003 回報）
- 依賴：無

**需求**
UI-003 把召喚欄改用 CSS class 後，`src/scenes/Battle.jsx` 第 9 行的 `import { SKIN } from '../data/skin.js';` 已沒有被使用，請刪除。只刪這一行，其他不動。

**完成條件**
- `npm run build` 成功，戰鬥畫面正常。

### 回報（負責角色填寫）
- 修改檔案：`src/scenes/Battle.jsx`（只刪 1 行，`git diff --stat`：1 deletion）
- 做了什麼：刪除第 9 行 `import { SKIN } from '../data/skin.js';`，其他內容未動。
- 如何驗證：刪除前 grep 確認 `SKIN` 在 Battle.jsx 只出現在該 import 行；刪除後 grep `SKIN` 為 0 筆；`npm run build` 成功（✓ built in 1.23s）。刪除未使用的 import 不影響執行期行為，因此沒有另外開瀏覽器預覽。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：commit 只需包含 `src/scenes/Battle.jsx` 與本任務檔 `docs/tasks/engine.md`。第一次嘗試刪除時被自動模式權限擋下，使用者在對話中明確授權後才執行。不影響 PROJECT_MAP / CHANGELOG（行為未改變），未更新這兩份文件。

### 審核（CEO 填寫）
- 2026-09-27 通過。只刪 1 行 import，build 成功。被權限擋下時停下來請使用者授權、沒有繞過，處理方式正確。

## [EG-002] 戰場單位記錄模板 key（供角色圖顯示用）
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27）
- 依賴：無（UI-004 依賴本任務）

**需求**
UI-004 要在戰場 Canvas 用角色圖畫貓咪，`draw.js` 需要知道每個單位是哪一種貓。目前 `makeUnit()` 只複製名稱、數值等欄位，沒有 key。請讓戰場上的每個單位帶有 `key` 欄位：
- 貓：`Battle.jsx` 的 `spawnCat(key)` 產生的單位，`unit.key` = 該貓的 key（例如 `'white'`、`'ninja'`）。
- 敵人 / BOSS：`unit.key` = `ENEMIES` / `BOSSES` 的 key（之後敵人圖也可沿用）。
只新增欄位，不改變任何戰鬥數值與行為。

**完成條件**
- 戰鬥中每個 unit 都有正確的 `key`（回報中說明驗證方式）。
- `npm run build` 成功。
- 更新 `docs/PROJECT_MAP.md` §4.1（unit 欄位說明）。

### 回報（負責角色填寫）
- 修改檔案：`src/game/ai.js`、`src/scenes/Battle.jsx`（1 行）、`docs/PROJECT_MAP.md`（§4.1）、`docs/CHANGELOG.md`（1 行）、本任務檔。
- 做了什麼：
  - `makeUnit(team, x, y, tpl, key)` 新增第 5 參數 `key`，回傳物件多一個 `key` 欄位；其他欄位不變。
  - 貓：`Battle.jsx` `spawnCat(key)` 呼叫 `makeUnit` 時傳入 `key`。
  - 敵人：`spawnEnemy` 的 BOSS 分支與一般敵人分支都傳入 `key`。原本 `ENEMIES[key] || ENEMIES.dog` 改寫成「找不到就把 `key` 設為 `'dog'`」，讓 `unit.key` 與實際使用的模板一致（行為不變，仍是退回小狗）。
  - BOSS：`spawnBossIfNeeded` 原本 `BOSSES[cfg.bossKey] || BOSSES.boarKing` 改寫成先算出 `bossKey`（找不到就 `'boarKing'`），再傳給 `makeUnit`（行為不變）。
  - 沒有改任何數值、生怪流程或戰鬥邏輯。
- 如何驗證：
  - 用 Node 腳本直接匯入真正的 `ai.js` / `enemies.js` / `world.js` / `cats.js` 檢查：20 種 ENEMIES 經 `spawnEnemy` 生成，`key` 與 `name` 皆正確；5 種 BOSSES 分別經 `spawnEnemy` 與 `spawnBossIfNeeded` 生成，`key` 皆正確；不存在的敵人 key（`'小丑魚'`）→ `key='dog'` 且名稱為小狗；不存在的 bossKey → `key='boarKing'`；`buildCatsTpl`（商店貓全解鎖）的 18 隻貓以 `makeUnit(..., key)` 建立，`key` 皆正確。共 0 筆失敗。
  - `npm run build` 成功。
  - 未開瀏覽器：`key` 在畫面上看不到（`draw.js` 還沒用），執行期正確性已由上述腳本對實際函式驗證。
- 新增給其他角色的請求：無。UI-004 現在可以直接用 `unit.key`（敵人也有）。
- 給 CEO 的注意事項：
  - commit 範圍：`src/game/ai.js`、`src/scenes/Battle.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`。工作目錄裡還有其他角色未審核的改動（audio.md、ui.md、ceo.md 等），請不要一起 add。
  - `makeUnit` 的 `key` 是選填參數：以後若有別處呼叫 `makeUnit` 卻沒傳 key，`unit.key` 會是 `undefined`，`draw.js` 應保留「沒有圖就畫色塊」的退路。
  - 已更新 PROJECT_MAP §4.1（unit 欄位與 `key` 說明），並在 CHANGELOG 最上方加了一行。

### 審核（CEO 填寫）
- 2026-09-27 通過。只新增 key 欄位，fallback 改寫行為不變；build、test 通過。

## [EG-003] 章節環境機制：環境引擎
- 狀態：已完成
- 優先度：高
- 來自：CEO（2026-09-27，使用者選定新特色「章節環境機制」）
- 依賴：無（`stageConfig().env` 由 LV-002 提供；在它完成前可自行用假設定測試）

**設計文件**：`docs/design/chapter-environment.md`（**先完整讀過**；§4 介面是合約，不可自行更改，有問題寫進 `docs/tasks/ceo.md`）

**需求**
1. 新檔 `src/game/environment.js`：實作 `createEnv`、`stepEnv`、`getEnvModifiers`，`world.env` 結構**完全照設計文件 §4.2**。
2. `world.js` `createWorld`：依 `cfg.env` 建立 `world.env`。
3. `ai.js` `stepUnits`：敵人攻擊 / 速度乘上環境倍率（與 berserk、slow 疊乘）；擊殺賞金乘上 `bountyMul`。潮汐推力依 §2.2（擊退免疫不受影響、不越過主堡邊界）。
4. `Battle.jsx` 主迴圈：在 `stepUnits` 前呼叫 `stepEnv(w, dt)`；偵測預告開始 / 天亮時呼叫 `audio.playEnvCue?.(kind)`（kind 見設計文件 §4.4）。
5. 不改其他戰鬥數值與行為；無環境的關卡（`world.env === null`）行為與現在完全相同。
6. 注意 PROJECT_MAP §11 #17：UI 的攻擊動畫依賴 `atkCd` 被重設的寫法，不要改動它。

**完成條件**
- 用 Node 腳本模擬：晝夜的階段切換與預告時間正確、夜晚敵人倍率與賞金倍率生效；潮汐的漲 / 退潮方向、推力、擊退免疫、邊界都正確；暫停（dt=0）不推進。在回報中列出結果。
- `npm run build`、`npm test` 通過；更新 `docs/PROJECT_MAP.md` §4。

### 回報（負責角色填寫）
- 修改檔案：
  - 新增 `src/game/environment.js`（環境引擎）、`src/game/environment.test.js`（vitest，13 項測試）
  - `src/game/ai.js`：`stepUnits` 套用環境倍率與賞金倍率（+import）
  - `src/game/world.js`：`createWorld` 新增 `env: createEnv(cfg.env ?? null)`（+import；`buildCatsTpl` 未動）
  - `src/scenes/Battle.jsx`：+import、主迴圈 2 行（`stepEnv`、`pollEnvCues` → `audio.playEnvCue?.(kind)`）
  - `docs/PROJECT_MAP.md`（§4.1 加 `world.env`、§4.2 迴圈加 3.5 步、新增 §4.6 環境引擎）、`docs/CHANGELOG.md`（1 行）、本任務檔
- 做了什麼：
  - `createEnv` / `stepEnv` / `getEnvModifiers` 照設計文件 §4.2 簽名實作；`world.env` 欄位**剛好**是 `type/phase/phaseLeft/phaseProgress/warning/events`（測試有檢查 key 集合）。參數一律從 `world.cfg.env`（`stageConfig().env`）讀，`world.env` 只放狀態。
  - 晝夜：day ⇄ night，只在夜晚前預告（`warning.next = 'night'`）。潮汐：calm → flood → calm → ebb → …，下一波方向由 `events` 推算，潮水前預告並帶方向。
  - 一幀跨越階段邊界時逐段計算，潮汐推力只算落在潮水期間的時間（2x 或卡頓時也精準）。`dt ≤ 0` 直接 return。
  - 潮汐推力：存活、非 `knockbackImmune` 的單位 ±`pushSpeed×dt`；邊界 `[68, 50+towerDistance-18]` 與一般移動相同。**只阻止被推過邊界，原本就在邊界外的單位不會被拉回**（例如被大砲擊退到敵堡後方的敵人，不會因漲潮開始而被瞬移到邊界上）。凍結中的單位也會被推（設計寫「所有存活單位」）。
  - `stepUnits`：在 slow（速度）與 berserk（攻擊）之後，對敵人乘 `enemySpeedMul` / `enemyAtkMul`；賞金 `Math.round(killBounty × bountyMul)`。倍率在 `stepUnits` 開頭取一次。我方不受影響。
  - 音效時機：新增輔助函式 `pollEnvCues(world)`（設計文件 §4.2 以外的**額外匯出**，不改動合約中的三個函式），回傳本幀新出現的 `nightWarn` / `dayStart` / `floodWarn` / `ebbWarn`，每次預告、每次天亮各一次；進度記在 `world.envCueSeen`（在 `world` 頂層，不放進 `world.env`）。`Battle.jsx` 以 `audio.playEnvCue?.(kind)` 呼叫。
  - 沒有動 `atkCd` 的寫法（§11 #17），沒有改其他數值與行為。
- 如何驗證：
  - `npm test`：14 項全過（新增的 `environment.test.js` 13 項 + 原有 App 測試 1 項）。測試直接跑真正的 `environment.js` 與 `ai.js` 的 `stepUnits`、`makeUnit`，參數用設計文件 §3 的初版數值：
    - 晝夜：t=39.9 無預告；t=40.1 `warning={next:'night', in≈4.9}`、`phaseProgress≈40.1/45`；t=45.1 `night`、events=1；t=70.1 天亮、events=2、白天前不預告。150 秒內的音效提示依序為 `nightWarn, dayStart, nightWarn, dayStart`。
    - 夜晚倍率：`getEnvModifiers` 白天全 1、夜晚 1.2/1.15/1.5；敵人 berserk(×2)＋夜晚 → atk=10×2×1.2；slow(×0.5)＋夜晚 → speed=10×0.5×1.15；我方 atk/speed 不變。賞金：白天 18 → 夜晚 27（=round(18×1.5)），無環境與白天相同。
    - 潮汐：100 秒內階段依序 calm, flood, calm, ebb, calm, flood, calm；t=20.1 預告 flood；t=50.1 預告 ebb、`in≈3.9`；125 秒內音效提示 `floodWarn, ebbWarn, floodWarn, ebbWarn`。
    - 推力：漲潮 1 秒 → 貓 400→368、敵 500→468；擊退免疫（抹香鯨型）與死亡單位不動；平靜期不動；再經整段漲潮＋平靜＋退潮 1 秒 → 240 / 340。一幀 1 秒跨越「平靜 0.5 + 漲潮 0.5」→ 只推 16px。
    - 邊界：x=75 的貓漲潮後停在 68；x=800（邊界外）的敵人漲潮往左推回場內（→608）；x=60（左邊界外）的敵人漲潮時不動、退潮時往右推；x=770 的貓退潮停在 782。
    - 暫停：dt=0 呼叫 100 次，`world.env` 與單位位置完全不變。2x（dt=0.1）與 1x 跑同樣遊戲時間，結果一致。
    - 無環境：`world.env === null` 時 `stepEnv` 無作用、倍率全 1、無音效提示。
  - 與 LV-002 的資料接起來測試（LV-002 的改動尚未 commit，用目前工作目錄的版本）：`createWorld` 對 1-1、2-1 產生 `env=null`；1-4、1-10 產生 dayNight（phase=day、phaseLeft=45）；2-2 產生 tide（phase=calm、phaseLeft=24）。
  - `npm run build` 成功（含其他角色目前在工作目錄中的改動）。
  - 未做瀏覽器實測：另一個對話的 dev server 占用 5173，我這邊的瀏覽器連不到；另開伺服器需要改共用的 `.claude/launch.json`（不在我的範圍），所以沒有開。已關閉自己開的瀏覽器分頁。
- 新增給其他角色的請求：無。
  - 給 UI-007 / AU-005 參考（已寫在 PROJECT_MAP §4.6）：`world.env.warning.in` 就是 `phaseLeft`；判斷「剛切換」用 `events` 變化；音效由引擎呼叫 `audio.playEnvCue?.(kind)`，音效角色不必改 `Battle.jsx`。
- 給 CEO 的注意事項：
  - **commit 範圍**：`src/game/environment.js`、`src/game/environment.test.js`、`src/game/ai.js`、`src/game/world.js`、`src/scenes/Battle.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`。
  - **`Battle.jsx` 同時有 UI-007 的改動**：`import EnvIndicator` 與 JSX 中 `<EnvIndicator … />` 兩行不是我改的。我的只有 `import { stepEnv, pollEnvCues }` 與主迴圈兩行。審核時請跟 UI-007 一起處理（或用 `git add -p` 拆開）。`PROJECT_MAP.md`、`CHANGELOG.md` 也有其他角色的改動。
  - **合約以外的新增**：`pollEnvCues` 匯出與 `world.envCueSeen` 欄位。沒有改動 §4.2 的三個函式簽名，也沒有改 `world.env` 的結構。若 CEO 認為要寫進設計文件，請更新 §4.4。
  - **新增測試檔**：`src/game/environment.test.js` 是我這個模組的測試，放在 `src/game/`。若 CEO 認為測試檔歸屬要另外規定，請告知。
  - **沒有依賴 LV-002 的完成**：若環境設定缺少某個參數，`environment.js` 有 fallback（設計文件 §3 初版值），但正常情況下應由 `stageConfig().env` 提供完整設定。

### 審核（CEO 填寫）
- 2026-09-27 通過。三個合約函式與 `world.env` 結構照設計；倍率每幀由 base 值重算不會累乘；13 項單元測試涵蓋階段、倍率、推力、邊界、暫停、2x，做得很紮實。
- 合約外新增的 `pollEnvCues` / `world.envCueSeen` 接受，CEO 已補進設計文件 §4.4。測試檔放在模組旁、由模組負責角色維護，CEO 已寫進 CLAUDE.md。


## [EG-004] 單次出怪（`time`）被重複生成
- 狀態：待處理
- 優先度：中
- 來自：經濟（2026-09-27，EC-001 模擬時發現）
- 依賴：無

**問題**
`src/scenes/Battle.jsx` 主迴圈的生怪有兩段：`while`（第 219~236 行，依 `nextEnemyIdx` 處理有 `time` 的單次出怪）與 `for`（第 238~256 行）。
- 排程依 `time` 排序後，若前面有「`time` + `hp`」的條目（例如 1-10 的 `{ time: 1, type: 'boar', hp: 1400 }`），`while` 會卡在那一筆直到敵堡 HP 降下來。
- 卡住期間，後面的單次條目（例如 1-10 的 `{ time: 6, type: 'black' }`、`{ time: 21, type: 'black' }`、`{ time: 45, type: 'alien' }`）被 `for` 迴圈照時間生成（`_spawned = 1`）。
- 等 HP 條件滿足後，`while` 繼續往下走，**不檢查 `_spawned`**，把這些條目**再生成一次**。

**重現（模擬記錄，1-10、無環境）**
```
黑影怪@6.0/hp2500
黑影怪@21.0/hp2500
野豬@94.5/hp878      ← hp ≤ 1000 條件成立，while 解除卡住
黑影怪@94.5/hp878    ← time:6 的黑影怪 ×150 第二次出現
黑影怪@94.5/hp878    ← time:21 的黑影怪 ×150 第二次出現
```
受影響的關卡：排程裡有「`time` + `hp`」單次條目、而且後面還有其他單次 `time` 條目的關卡（至少 1-8、1-10；2-8 的 `{ time: 1, hp: 200 }` 也是同型）。

**需求**
- 讓每個單次條目最多生成一次（例如 `while` 生成前檢查 `entry._spawned`，已生成就直接 `nextEnemyIdx += 1`；或整併成只由一段邏輯處理）。
- 修正後關卡難度會略降（少了重複的怪），不需要同時改關卡資料；經濟角色之後會再評估。

**完成條件**
- 1-10 的 `time: 6` / `time: 21` 黑影怪整場各只出現一次；其他關卡的出怪次數不變（`interval` 週期出怪不受影響）。
- `npm test` 通過（建議加一個測試覆蓋這個情況）。

### 回報（負責角色填寫）
- 修改檔案：
- 做了什麼：
- 如何驗證：
- 新增給其他角色的請求：
- 收尾：
- 給 CEO 的注意事項：

### 審核（CEO 填寫）

## [EG-005] 戰場左上角倍速一直顯示「1x」
- 狀態：待處理
- 優先度：低
- 來自：經濟（2026-09-27，EC-001 實機試玩時發現）
- 依賴：無

**問題**
按 X 切到 2x 後，遊戲確實以 2 倍速進行（2-2 實測：真實約 25 秒，Time 走到 57.6s），但 Canvas 左上角資訊仍顯示「1x」。
原因推測：`Battle.jsx` 的 `draw()`（第 299~303 行）把 state `timeScale` 傳給 `drawAll`，但 `loop` 是在 `startGame` 當下那次 render 的閉包裡用 `requestAnimationFrame` 一直重排，拿到的是舊的 `timeScale`（1）。

**需求**
- `draw()` 改用 `timeScaleRef.current`（或其他方式）讓畫面顯示實際倍速。這是 `Battle.jsx` 的邏輯部分；若 CEO 判斷屬於 UI，請轉交。

**完成條件**
- 切 2x 後 Canvas 左上角顯示「2x」，切回顯示「1x」。

### 回報（負責角色填寫）
- 修改檔案：
- 做了什麼：
- 如何驗證：
- 新增給其他角色的請求：
- 收尾：
- 給 CEO 的注意事項：

### 審核（CEO 填寫）
