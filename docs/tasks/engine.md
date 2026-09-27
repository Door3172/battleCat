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
- 狀態：已完成
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
- 修改檔案：`src/game/ai.js`（新增 `stepSchedule`）、`src/scenes/Battle.jsx`（生怪區塊改呼叫 `stepSchedule`、import）、新增 `src/game/ai.test.js`、`docs/PROJECT_MAP.md`（§4.2 第 3 步）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  - 把 `Battle.jsx` 主迴圈的排程生怪（`while` + `for` 兩段）**原封不動**移到 `ai.js` 的 `stepSchedule(world, spawn)`，`spawn(type, multiplier)` 由 `Battle.jsx` 傳入（內部仍是 `spawnEnemy(..., false)`）。沒有 `schedule` 時回傳 `false`，`Battle.jsx` 照舊走 `enemyClock` 固定頻率路徑。移出來是為了能寫單元測試。
  - 修正：`while` 處理每筆單次條目前，先檢查 `entry._spawned > 0`；已被 `for` 生成過就直接 `nextEnemyIdx += 1` 跳過。其餘邏輯（hp 卡住、`_next`、`interval`/`until`/`count`）完全不變。
  - 已確認所有關卡資料沒有「`time` + `interval`」的條目（條目型態只有 `time`、`time+hp`、`start+interval`、`start+interval+hp`、`interval+hp`、`start+interval+until`），所以 `while` 只會碰到單次條目。
- 如何驗證：
  - **全關卡前後比對**：把修正前的邏輯逐字複製成模擬腳本，與修正後的 `stepSchedule` 對 40 關各跑 240 秒（1/60 秒一步，敵堡 HP 在 200 秒內線性降到 0），比對每一次生成的（種類, 倍率, 時間）：
    - 37 關完全相同（逐筆一致）。
    - 只有 3 關不同，而且**只有減少、沒有新增**，減少的剛好是 hp 門檻解除那一刻的重複生成：1-8 少 1 隻（`boar×200`）、1-10 少 3 隻（`black×150` ×2、`alien×125`）、2-8 少 2 隻（`hermitCrab×200`、`dolphin×150`）。
  - **新增 `src/game/ai.test.js`（3 項）**：(1) 假排程：hp 條目卡住 `while` 期間，後面的單次條目各只生成 1 次、時間正確，週期出怪次數不變（10 次）；(2) 實際 1-10 設定、照 EC-001 的情境（94.5 秒前敵堡 HP 未達門檻，之後 878）：所有單次條目 `_spawned` 都是 1；(3) 沒有 schedule 回傳 `false`。
  - `npm test` 17 項全過（3 個檔案），`npm run build` 成功。
  - 瀏覽器實測 1-1 戰鬥可正常開始、console 無錯誤（與 EG-005 同一次驗證）。
- 新增給其他角色的請求：無（任務說明提到經濟角色之後會再評估難度，影響關卡：1-8、1-10、2-8）。
- 收尾：與 EG-005 同一次驗證。自己用 `preview_start` 開的 dev server（5173）已 `preview_stop`，瀏覽器分頁 `seed` 已 `tabs_close`；另外把 EG-003 時沒停掉的 `Browser` 類型預覽程序（`browser-preview-1790522166410-3`，當時 `preview_stop` 帶錯 id 失敗）也一併 `preview_stop` 了。最後 `preview_list` 回傳 `[]`、`tabs_context` 回傳 `tabs: []`（browserOpen: false），確認都是空的。沒有其他背景程序。
- 給 CEO 的注意事項：
  - commit 範圍：`src/game/ai.js`、`src/game/ai.test.js`、`src/scenes/Battle.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`（與 EG-005 共用 `Battle.jsx`、`CHANGELOG.md`，建議一起審核、一起 commit）。
  - `Battle.jsx` 的改動比「加一個判斷」大：生怪區塊約 40 行移到 `ai.js`，行為不變（已用全關卡比對證明）。
  - `PROJECT_MAP.md` §5（關卡角色的章節）寫著 `count`「實作在 `Battle.jsx` 生怪迴圈」，現在應改成 `ai.js` 的 `stepSchedule`。那不是我的章節，所以我沒改，請 CEO 或關卡角色更新。
  - 關於 EG-003 的收尾：當時沒有停掉 `Browser` 類型的預覽程序，這次發現後已補停。

### 審核（CEO 填寫）
- 2026-09-27 通過。把生怪移到 `ai.js` 的 `stepSchedule` 雖超出「加一個判斷」，但為了可測試、且用 40 關逐筆比對證明只少掉重複生成，接受。新增 3 項測試。PROJECT_MAP §5 的 `count` 說明已由 CEO 更新。1-8、1-10、2-8 難度略降，已開 EC-002 請經濟重跑。


## [EG-005] 戰場左上角倍速一直顯示「1x」
- 狀態：已完成
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
- 修改檔案：`src/scenes/Battle.jsx`（`draw()` 1 行）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：`draw()` 傳給 `drawAll` 的倍速從 state `timeScale` 改成 `timeScaleRef.current`。原因與任務推測相同：`loop` 用 `requestAnimationFrame` 在舊的 render 閉包裡重排，裡面的 `draw` 看到的 `timeScale` 永遠是 1；ref 永遠是最新值，而遊戲實際的 `dt` 本來就是讀這個 ref。其他地方沒動（`Toolbar` 的 `speedLabel` 仍用 state，它本來就正確）。
- 如何驗證：用自己開的 dev server 在瀏覽器進入 1-1 戰鬥：一開始左上角顯示「Stage 1 Time 0.1s 1x」；按 X 後顯示「Time 0.4s 2x」；再按 X 顯示「Time 0.7s 1x」。console 沒有錯誤。`npm run build` 成功、`npm test` 17 項通過。
- 新增給其他角色的請求：無
- 收尾：與 EG-004 同一次驗證，詳見 EG-004 收尾：dev server 已 `preview_stop`，分頁已 `tabs_close`，`preview_list` 為 `[]`、`tabs_context` 為 `tabs: []`。
- 給 CEO 的注意事項：commit 範圍與 EG-004 共用 `src/scenes/Battle.jsx`、`docs/CHANGELOG.md`，建議兩個任務一起 commit。任務提到「若 CEO 判斷屬於 UI 請轉交」：這行只是改傳入的資料來源（邏輯部分），`draw.js` 沒動。

### 審核（CEO 填寫）
- 2026-09-27 通過。改用 `timeScaleRef.current`，有實機確認 1x/2x 切換顯示正確。


## [EG-006] 貓咪砲要套用護盾、閃避、擊退免疫
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-28，PROJECT_MAP §11 #9）
- 依賴：無

**需求**
`src/scenes/Battle.jsx` 的 `fireCannon`（約第 200 行）目前直接 `u.hp -= dmg; u.x += knock;`，完全跳過能力系統。CEO 決定規則如下：
1. **護盾**：`shieldHp` 先吸收砲擊傷害，吸不完的才扣 HP（和 `ai.js` 一般攻擊的算法一樣）。
2. **閃避**：有 `dodge` 的敵人照機率閃掉砲擊（和一般攻擊一致）。
3. **擊退免疫**：有 `knockbackImmune` 的敵人不被砲擊推開，但照常受傷。
4. 砲擊推開的位移要限制在主堡邊界內（和一般移動／潮汐推力的邊界相同），目前沒有限制。
- 建議做法：把 `ai.js` 裡「閃避 → 護盾 → 扣血」這段抽成一個匯出函式（例如 `applyDamage(target, dmg)`），`stepUnits` 和 `fireCannon` 共用，避免兩邊規則再次分岔。擊退可以視情況一起抽。
- 傷害公式（含 `w.cfg.difficulty` 倍率）、冷卻 20 秒、推開距離 60 **維持不變**。
- 擊殺賞金、死亡處理照原本流程，不要重複計算。

**授權範圍**：`src/game/ai.js`、`src/scenes/Battle.jsx` 的 `fireCannon`；可新增測試（例如 `src/game/ai.test.js`）。

**完成條件**
- 對有護盾的敵人開砲：先扣護盾；對擊退免疫的敵人開砲：位置不變、HP 有扣。
- 一般攻擊的行為沒有改變（現有測試通過）。
- 有單元測試涵蓋護盾吸收、擊退免疫不被推、推開不超過邊界。
- `npm run build`、`npm test` 通過；更新 PROJECT_MAP 自己領域的章節與 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：`src/game/ai.js`、`src/scenes/Battle.jsx`（`fireCannon` 1 行＋import）、`src/game/ai.test.js`（新增 10 項）、`docs/PROJECT_MAP.md`（§4.3 貓咪砲）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  - `ai.js` 新增 4 個匯出函式：
    - `rollDodge(target)`：閃避判定。
    - `absorbDamage(target, dmg)`：護盾先吸收、吸不完扣 HP，回傳實際扣血量。
    - `pushWithinBounds(world, u, dx)`：推動並限制在主堡邊界 `[68, 50+towerDistance-18]`；只阻止被推過邊界，原本在邊界外的不會被拉回（與潮汐相同）。
    - `applyCannon(world, dmg, knock)`：貓咪砲本體。對每個存活敵人：閃避擲中 → 跳過（不扣血、不推）；否則 `absorbDamage`；非擊退免疫才 `pushWithinBounds`。
  - `stepUnits` 的 `dealAttack` 改用 `rollDodge` + `absorbDamage`。這是機械式抽出，判斷順序與 `Math.random` 呼叫次數都和原本相同，一般攻擊行為不變。
  - `Battle.jsx` `fireCannon`：`w.units.forEach(u => { u.hp -= dmg; u.x += knock; })` 改成 `applyCannon(w, dmg, knock)`。傷害公式（含 `difficulty`）、CD 20 秒、推開 60 都沒改。
  - 死亡、復活、擊殺賞金沒有另外處理，照舊由下一幀 `stepUnits` 的清屍流程處理，不會重複計算。`applyCannon` 會跳過 `hp ≤ 0` 的單位（實際上砲擊發生在兩幀之間，場上不會有未清的屍體）。
- 如何驗證：
  - `npm test`：27 項全過（`ai.test.js` 從 3 項增加到 13 項）。新增的 10 項：
    - absorbDamage：護盾 100 吃 80 → 護盾 20、HP 不變；護盾 50 吃 80 → 護盾 0、HP −30。
    - applyCannon：一般敵人 HP −60、x +60，我方與死亡單位不受影響；護盾 500 → 440、HP 不變、仍被推 60；護盾 20 → 0、HP −40；擊退免疫 HP −60、x 不變；閃避擲中 → HP、x 都不變，沒擲中 → 照常；x=760 被推到右邊界 782、x=800（邊界外）不動、兩者傷害照常；往左推停在 68。
    - 一般攻擊（`stepUnits`）：打護盾 30 的敵人（攻擊 50）→ 護盾 0、HP −20；閃避擲中 → HP 不變。
  - 原有 17 項（含潮汐推力、EG-004 排程）全部照舊通過。`npm run build` 成功。
  - 瀏覽器：連到另一個對話開的 dev server（5173），進入 1-1 按 Space，大砲冷卻從 OK 變成 19.0s，console 沒有錯誤。當時場上沒有敵人，所以命中敵人的各種情況是由上述單元測試驗證。
- 新增給其他角色的請求：無
- 收尾：5173 的 dev server 是別的對話開的，沒有去關，直接連它的網址。自己開的 `Browser` 類型預覽程序（`browser-preview-1790539760814-4`）已 `preview_stop`，分頁 `seed` 已 `tabs_close`。最後 `preview_list` 回傳 `[]`、`tabs_context` 回傳 `tabs: []`（browserOpen: false），確認都是空的。沒有背景程序。
- 給 CEO 的注意事項：
  - **需要 CEO 確認的規則**：護盾把砲擊**完全吸收**時，敵人**仍會被推開**。我照任務字面實作：CEO 只把閃避和擊退免疫列為不被推的條件。但一般攻擊的 `knockback` 能力要 `dealt > 0`（真的扣到血）才會觸發，兩者不同。影響：寄居蟹護盾 500、巨龍蝦 300，砲擊 60~150，前幾發會打在護盾上。若 CEO 希望「護盾吸完就不推」，只要在 `applyCannon` 加一個條件，請開任務給我。
  - 一般攻擊的 `knockback` 能力推開目前**沒有**邊界限制（原行為，這次依「一般攻擊行為不變」沒動）。若要統一，可改用 `pushWithinBounds`，需要另外開任務。
  - commit 範圍：`src/game/ai.js`、`src/game/ai.test.js`、`src/scenes/Battle.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`。
  - 工作目錄中 `src/App.jsx`、`src/scenes/LevelSelect.jsx` 的改動（按鈕音效、關卡按鈕 onClick）**不是我改的**，應屬其他角色（UI／音效），請勿併入本任務的 commit。
  - 請 CEO 更新 PROJECT_MAP §11 #9（CEO 維護的表），標為已修（EG-006）。

### 審核（CEO 填寫）
- 2026-09-28 通過。傷害規則抽成 `rollDodge` / `absorbDamage` 共用，一般攻擊判斷順序不變；新增 10 項測試，build、test（27 項）通過，範圍正確。CEO 決定：**護盾完全吸收時仍會被推開**維持現狀（砲擊是爆風，和一般攻擊的擊退能力分開看）；一般攻擊擊退沒有邊界限制目前不處理。

## [EG-007] 貓咪砲被護盾完全擋下時不推開
- 狀態：已完成
- 優先度：低
- 來自：使用者（2026-09-28，經 CEO 派工；EG-006 後續）
- 依賴：EG-006（已完成）

**需求**
EG-006 的 `applyCannon` 目前在護盾完全吸收砲擊時仍會推開敵人。使用者決定改成：**這發砲擊完全被護盾擋下（實際扣血 0）→ 不推開**；只要有扣到 HP 就照常推開。規則與一般攻擊的 `knockback`（`dealt > 0` 才觸發）一致。
- 閃避、擊退免疫、主堡邊界的規則不變；傷害、CD、推開距離不變。
- 可直接用 `absorbDamage` 的回傳值判斷。

**授權範圍**：`src/game/ai.js`（`applyCannon`）、`src/game/ai.test.js`。

**完成條件**
- 單元測試：護盾吸得完 → 位置不變；護盾吸不完（有扣 HP）→ 照常推開。修改 EG-006 裡「仍被推開」那項測試的預期。
- `npm run build`、`npm test` 通過；更新 PROJECT_MAP §4.3 貓咪砲說明與 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：`src/game/ai.js`（`applyCannon` 2 行＋註解）、`src/game/ai.test.js`（改 1 項測試）、`docs/PROJECT_MAP.md`（§4.3 貓咪砲的護盾說明）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：`applyCannon` 改用 `absorbDamage` 的回傳值：`const dealt = absorbDamage(u, dmg); if (dealt > 0 && !knockbackImmune) pushWithinBounds(...)`。護盾完全擋下（扣血 0）→ 不推；有扣到 HP → 照常推 60。閃避（完全無效）、擊退免疫（受傷不推）、主堡邊界、傷害、CD、推開距離都沒變。
- 如何驗證：
  - 修改 EG-006 的護盾測試（原預期「仍被推開」x=460 改成 x=400），並多加一個邊界情況，共三段：護盾 500 吃 60 → 護盾 440、HP 不變、x 不變（400）；護盾剛好 60 吃 60（扣血 0）→ 護盾 0、x 不變；護盾 20 吃 60 → HP −40、x 推到 460。
  - `npm test` 27 項全過（其他砲擊測試：一般敵人推開、擊退免疫、閃避、邊界都照舊通過）；`npm run build` 成功。
- 新增給其他角色的請求：無
- 收尾：未使用瀏覽器（行為已由單元測試完整覆蓋），沒有開 dev server 或背景程序。
- 給 CEO 的注意事項：
  - commit 範圍：`src/game/ai.js`、`src/game/ai.test.js`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`。
  - 「剛好吸完」（護盾 = 砲擊傷害）視為完全擋下、不推，因為實際扣血為 0。

### 審核（CEO 填寫）
- 2026-09-28 通過。改用 `absorbDamage` 回傳值判斷，剛好吸完也不推；測試已改並多一個邊界情況，build、test（27 項）通過，範圍正確。

## [EG-008] 移除舊的生怪路徑與未定義的設定欄位
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-28，PROJECT_MAP §11 #8）
- 依賴：無（與 EG-009 同樣改 `ai.js`，建議依序做，先做 EG-008）

**需求**
所有關卡都用 `schedule` 生怪，下列舊路徑與欄位從來沒被定義，屬於死碼：
- `Battle.jsx` 主迴圈 `if (!stepSchedule(...)) { w.enemyClock ... w.cfg.spawnRate ... }` 的舊固定頻率分支；`world.js` 的 `enemyClock: cfg.firstDelay`。
- `spawnEnemy` 沒有 `forcedKey` 時用 `cfg.sequence` / `cfg.pool` 選怪的分支（`enemyIndex`）。
- `spawnEnemy`、`spawnBossIfNeeded` 的 `if (cur >= cfg.maxEnemies) return;`（`maxEnemies` 未定義，比較永遠是 false）。
- `cfg.difficulty || 1`（`killBounty`、`computeScale`、`Battle.jsx` `fireCannon` 的傷害）：`difficulty` 從未定義，恆為 1。

CEO 決定：
1. **遊戲行為與數值必須完全不變**：場上敵人數量維持不設上限（目前實際就是無上限），賞金、BOSS 縮放、砲擊傷害公式結果不變。
2. 刪除上述死碼；`spawnEnemy` / `stepSchedule` 的參數可以順勢精簡，但呼叫端要一起改。
3. 刪之前先確認：**第一、二章每一關的 `stageConfig()` 都有非空的 `schedule`**。請寫成單元測試保留下來；若有任何關卡沒有 schedule，先不要刪舊路徑，在回報裡列出關卡。
4. 其他在 `stageConfig()` 找不到定義、但程式有讀的欄位，也一併列在回報（先不刪，由 CEO 決定）。

**授權範圍**：`src/game/ai.js`、`src/game/world.js`、`src/scenes/Battle.jsx` 的邏輯部分；可新增或修改測試。

**完成條件**
- 上述死碼移除，`grep` 不到 `firstDelay`、`spawnRate`、`maxEnemies`、`cfg.sequence`、`cfg.pool`、`cfg.difficulty`。
- 新增「每關都有 schedule」的測試；原有測試全部通過；`npm run build` 成功。
- 實際進 1-1 與一個 BOSS 關打一下，確認出怪與 BOSS 正常。
- 更新 PROJECT_MAP 自己領域的章節（生怪流程、貓咪砲公式）與 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：`src/game/ai.js`、`src/game/world.js`（刪 1 行）、`src/scenes/Battle.jsx`（主迴圈生怪、`fireCannon` 傷害）、`src/game/ai.test.js`、`docs/PROJECT_MAP.md`（§4.2 第 3 步、§4.3 貓咪砲公式）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  - **先確認**：第一、二章共 40 關的 `stageConfig().schedule` 都是非空陣列（也都有 `reward`），所以可以刪舊路徑。已寫成測試保留。
  - `Battle.jsx`：刪掉 `if (!stepSchedule(...)) { enemyClock / spawnRate }` 舊分支，改成直接 `stepSchedule(w, (type, mult) => spawnEnemy(w, getWorldHeight, addEnemyName, type, mult))`；`fireCannon` 傷害改為 `60 + (cannonLv - 1) * 10`（拿掉 `× (w.cfg.difficulty || 1)`）。
  - `world.js`：刪 `enemyClock: cfg.firstDelay`。
  - `ai.js`：
    - `spawnEnemy(world, getCanvasHeight, onEnemySeen, key, statMultiplier = 100)`：刪 `maxEnemies` 檢查、`sequence`/`pool`/`enemyIndex` 選怪分支、`applyScale` 參數與其 `computeScale` / `totalSpawns` 分支（所有呼叫端本來就傳 `false`），也拿掉沒用到的 `getCanvasWidth` 參數。
    - `spawnBossIfNeeded(world, getCanvasHeight, onEnemySeen)`：刪 `maxEnemies` 檢查、拿掉沒用到的 `getCanvasWidth` 參數。
    - `killBounty`：`(0.8 + (cfg.difficulty || 1) * 0.1)` → 常數 `0.9`（JS 中 `0.8 + 0.1 === 0.9` 為 true，數值完全相同），不再需要 `cfg` 參數。
    - `computeScale`：拿掉 `(cfg.difficulty || 1) *`。
    - `stepSchedule`：沒有 schedule 時直接 return（不再回傳 true/false）。
  - `grep -rnE "firstDelay|spawnRate|maxEnemies|cfg\.sequence|cfg\.pool|cfg\.difficulty|enemyClock|enemyIndex|applyScale" src` → 0 筆。
- 如何驗證：
  - **行為完全不變（黃金比對）**：刪之前先寫模擬腳本，把 `Math.random` 換成固定種子的亂數，用真正的 `createWorld`/`stepSchedule`/`spawnEnemy`/`spawnBossIfNeeded`/`stepEnv`/`stepUnits`/`applyCannon` 跑 40 關各 120 秒（每 3 秒召喚貓、每 20 秒開砲、含 BOSS 與章節環境），輸出最終狀態（每個單位的 key/位置/HP/攻擊/速度/護盾、雙方主堡 HP、賞金總和、BOSS 是否出現）。修改前後輸出**逐位元組相同**（31,198 bytes；共 847 個單位、6 隻 BOSS、賞金 72,180）。
  - 測試：`ai.test.js` 新增「第 1 章 / 第 2 章每關都有非空 schedule」2 項，「沒有 schedule 回傳 false」改為「沒有 schedule 什麼都不做」。`npm test` 29 項全過；`npm run build` 成功。
  - 瀏覽器實玩（自己開的 dev server）：
    - 1-1：10 秒後第一隻小狗出現，34 秒時場上 3 個單位；召喚白喵、開砲（冷卻開始倒數）正常，console 無錯誤。
    - 1-20（BOSS 關）：暫停在 17.5 秒讀取 `world`：`bossSpawned: true`，機甲巨像 HP 17,852（= 基礎 7,000 × 關卡 2.52 × 時間約 1.012，符合 BOSS 縮放），15 秒的公牛、大象等排程怪都有出現，`world` 已沒有 `enemyClock` 欄位。
    - 註：瀏覽器面板被隱藏時 `requestAnimationFrame` 幾乎不跑，所以測試時在分頁中暫時把 `requestAnimationFrame` 換成 MessageChannel 版本（只存在該分頁記憶體，不是程式修改，重新載入即消失），分頁最後已關閉。讀 `world` 是透過 React fiber 唯讀查看。
- 新增給其他角色的請求：無
- 收尾：自己開的 dev server（`147654d2-…`，5173）與 `Browser` 類型預覽程序（`browser-preview-1790540699444-5`）都已 `preview_stop`；分頁 `seed` 已 `tabs_close`。最後 `preview_list` 回傳 `[]`、`tabs_context` 回傳 `tabs: []`（browserOpen: false），確認都是空的。沒有背景程序。沒有改動瀏覽器的 localStorage（`highestUnlocked` 原本就是全解鎖）。
- 給 CEO 的注意事項：
  - **需求 4：程式有讀、但 `stageConfig()` 找不到定義的欄位**：除了這次刪掉的 6 個之外，**沒有其他**（其餘讀取的 `stageIndex`、`enemyBaseHp`、`towerDistance`、`schedule`、`isBoss`、`bossKey`、`bossAt`、`bossHp`、`bossMultiplier`、`rewardCoins`、`env` 都有定義；40 關的 `rewardCoins` 也都有值）。
  - **發現：BOSS 的「每已出怪 +1.5%」從來沒生效**。`computeScale` 的 `spawnFactor` 讀 `world.totalSpawns`，但這個值只在舊路徑（`applyScale = true`）才會增加；排程出怪一直是 `applyScale = false`，所以 `totalSpawns` 恆為 0、`spawnFactor` 恆為 1。這次為了行為不變，`computeScale` 裡的 `spawnFactor` 算式**保留沒刪**（現在沒有任何地方會寫入 `world.totalSpawns`，但結果和以前一樣是 1）。PROJECT_MAP §5（關卡章節）寫的「每已出怪 +1.5%（上限 +45%）」與實際不符。請 CEO 決定：(a) 刪掉這一項並修正 §5 的說明（行為不變）；或 (b) 讓排程出怪計入，使它真的生效（BOSS 會變強，需經濟評估）。
  - commit 範圍：`src/game/ai.js`、`src/game/ai.test.js`、`src/game/world.js`、`src/scenes/Battle.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`。EG-009 也會改 `ai.js`、`ai.test.js`、PROJECT_MAP、CHANGELOG，建議兩個任務一起 commit。
  - 請 CEO 更新 PROJECT_MAP §11 #8（CEO 維護的表），標為已修（EG-008）。

### 審核（CEO 填寫）
- 2026-09-28 通過。死碼全部移除，用固定亂數跑 40 關比對修改前後結果完全相同；新增每關都有 schedule 的測試；build、test（35 項）通過，範圍正確。CEO 決定：BOSS 的「每已出怪 +1.5%」採 (a) 刪除（行為不變，使用者目前的遊戲體驗就是沒有這項），另開 EG-010；§5 說明已由 CEO 修正。

## [EG-009] 單位出手時記錄攻擊事件（給攻擊動畫用）
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-28，PROJECT_MAP §11 #17）
- 依賴：建議在 EG-008 之後做（同樣改 `ai.js`）；完成後 UI-010 才能接上

**需求**
`draw.js` 的攻擊動畫目前靠「`atkCd` 突然變大」推算單位剛出手，引擎一改冷卻寫法動畫就會壞。改成由引擎明確記錄：
- `makeUnit` 新增欄位 **`atkSeq: 0`**；`stepUnits` 中單位**每次真的出手**時 `u.atkSeq += 1`（包含打主堡、AOE 有命中；AOE 沒打到任何東西、冷卻沒重設的情況不算）。
- 這是給 UI **唯讀**使用的介面合約：數字只增不減，UI 以「比上一幀大」判斷剛出手。請在 `ai.js` 開頭能力說明附近或 `makeUnit` 旁加註解，並寫進 PROJECT_MAP §4 的單位欄位說明。
- 不要改 `draw.js`（UI-010 負責）。

**授權範圍**：`src/game/ai.js`、`src/game/ai.test.js`。

**完成條件**
- 單元測試：單位攻擊一次 `atkSeq` +1；冷卻中不增加。
- 原有測試通過、`npm run build` 成功；更新 PROJECT_MAP、CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：`src/game/ai.js`、`src/game/ai.test.js`（新增 4 項）、`docs/PROJECT_MAP.md`（§4.1 單位欄位）、`docs/CHANGELOG.md`、本任務檔
- 做了什麼：
  - `makeUnit` 新增 `atkSeq: 0`。
  - `stepUnits` 出手時 `u.atkSeq += 1`，加在**冷卻被重設的同一個地方**：非 AOE（打單位或打主堡）每次出手都加；AOE 只有 `hits > 0`（命中單位或主堡）才加，與 `atkCd` 是否重設完全一致。
  - `ai.js` 開頭能力說明後面加了 `atkSeq` 的合約說明（只增不減、UI 以「比上一幀大」判斷），`makeUnit` 那行也有註解。
  - 沒有改 `atkCd` 的寫法，也沒有動 `draw.js`（UI-010 負責）。
- 如何驗證：
  - 新增 4 項測試：初始為 0；攻擊一次 +1（目標 HP −10），冷卻中（0.5 秒）不變，冷卻結束再出手變 2；打主堡也 +1（敵堡 HP −10）；AOE 有命中 +1，AOE 範圍內沒有目標時（射程 50 觸發但半徑 5 打不到）維持 0，而且 `atkCd` 沒被重設。
  - `npm test` 33 項全過；`npm run build` 成功。
  - EG-008 的黃金比對（固定亂數 40 關）在加上 `atkSeq` 後重跑，輸出仍與最初的基準逐位元組相同，戰鬥行為沒有改變。
- 新增給其他角色的請求：無（UI-010 已由 CEO 派工，可以直接用 `unit.atkSeq`）
- 收尾：未使用瀏覽器（行為由單元測試覆蓋），沒有開 dev server 或背景程序。
- 給 CEO 的注意事項：
  - commit 範圍：`src/game/ai.js`、`src/game/ai.test.js`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/engine.md`，與 EG-008 大量重疊，建議兩個任務一起 commit。
  - 凍結中的單位整幀跳過，不會出手，`atkSeq` 也不會增加。
  - UI-010 完成後，PROJECT_MAP §11 #17（動畫依賴 `atkCd`）即可結案。

### 審核（CEO 填寫）
- 2026-09-28 通過。`atkSeq` 與冷卻重設同一處遞增，AOE 沒命中不加；新增 4 項測試，比對結果仍相同。UI-010 可開工。
## [EG-010] 移除 BOSS 縮放中從未生效的 `spawnFactor`
- 狀態：待處理
- 優先度：低
- 來自：CEO（2026-09-28，EG-008 回報的發現）
- 依賴：無

**需求**
`ai.js` `computeScale` 的 `spawnFactor`（讀 `world.totalSpawns`，每已出怪 +1.5%）從來沒生效：排程出怪不累加 `totalSpawns`，所以恆為 1。CEO 決定刪除這一項，**行為不變**。
- 刪 `spawnFactor` 算式與所有 `totalSpawns` 的殘留讀寫。
- 更新 PROJECT_MAP §5 第「排程出的敵人不套用難度成長」那行，改成實際的縮放：每關 +8%、每秒 +0.4%（上限 180 秒），並拿掉「從未生效」的註記。**授權本任務修改 PROJECT_MAP §5 這一行。**

**授權範圍**：`src/game/ai.js`、`src/game/ai.test.js`、PROJECT_MAP §5 上述那一行。

**完成條件**
- 用 EG-008 的固定亂數比對確認結果不變；`npm run build`、`npm test` 通過；更新 CHANGELOG。

### 回報（負責角色填寫）
- 修改檔案：
- 做了什麼：
- 如何驗證：
- 新增給其他角色的請求：
- 收尾：
- 給 CEO 的注意事項：

### 審核（CEO 填寫）