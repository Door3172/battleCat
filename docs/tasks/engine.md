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

