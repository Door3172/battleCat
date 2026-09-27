# 貓咪之戰（BattleCat）— AI 協作總綱

> 每個新對話的 AI 都會自動讀到這份檔案。**開工前請先讀完本檔，再讀 [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md)**（詳細系統說明），然後讀**自己的任務檔**（見下方「任務系統」）。

- 一律使用**繁體中文**回覆；程式碼、key、路徑維持原樣。
- 專案：仿《貓咪大戰爭》的橫向塔防網頁遊戲。React 18 + Vite 5 + Tailwind 3，純前端、無後端，存檔在 `localStorage`。
- 部署：push 到 `main` → GitHub Actions 建置並發佈到 GitHub Pages（`base: '/battleCat/'`）。
- Repo：https://github.com/Door3172/battleCat
- **所有角色都在同一個資料夾 `C:\Users\User\Desktop\BattleCats` 工作**（共用同一份工作目錄）。

## 常用指令

```bash
npm install        # 第一次或測試跑不起來時（repo 內的 node_modules 不完整）
npm run dev        # 本機開發
npm run build      # 建置到 dist/
npm test           # vitest
```

- **測試檔**放在被測模組旁邊（例如 `src/game/environment.test.js`），由該模組的負責角色維護。

## 角色分工（多對話協作）

本專案由多個 AI 對話共同開發，每個對話扮演一個角色。**開場時使用者會告訴你你是哪個角色**；若沒說，先問。

| 角色 | 任務檔 | 負責範圍（主要檔案） |
|---|---|---|
| **專案執行長（CEO）** | `docs/tasks/ceo.md` | 全局規劃、跨系統決策、任務分派、審核、commit/push；維護 `CLAUDE.md` 與 `docs/`（任務檔的「回報」區除外） |
| UI / 美術 | `docs/tasks/ui.md` | `src/ui/*`、`src/scenes/*` 的畫面排版、`src/styles.css`、`tailwind.config.js`、`src/data/skin.js`、`src/game/draw.js`（戰場繪製）、`public/pic` |
| 友軍（貓咪） | `docs/tasks/allies.md` | `src/data/cats.js`（BASE_CATS / SHOP_UNLOCKS / GACHA_UNLOCKS）、`src/game/world.js` 的 `buildCatsTpl` 函式 |
| 敵人 | `docs/tasks/enemies.md` | `src/data/enemies.js`（ENEMIES / BOSSES） |
| 關卡 | `docs/tasks/levels.md` | `src/data/spawns.js`（第一章）、`src/data/spawns2.js`（第二章）、`src/data/stages.js` |
| 經濟 / 數值平衡 | `docs/tasks/economy.md` | `src/data/gachaRates.js`、`src/data/gachaPool.js`、`src/utils/gacha.js`、`cats.js` 的 `upgradeCost` 與 `price`、關卡 `reward` 數值的建議 |
| 戰鬥引擎 | `docs/tasks/engine.md` | `src/game/ai.js`（含能力系統）、`src/game/world.js`（`buildCatsTpl` 除外）、`src/scenes/Battle.jsx` 的邏輯部分 |
| 音效 | `docs/tasks/audio.md` | `src/audio/*`、`public/audio/*` |

`App.jsx`、`Battle.jsx` 的畫面部分、`Upgrade.jsx`/`Shop.jsx` 的數值等多角色交界處：**動之前先在 `docs/tasks/ceo.md` 提出請求**，由 CEO 決定歸屬。

**CEO 寫進你任務檔的任務，就是對該任務所列檔案與範圍的正式授權**（使用者已同意此流程），照任務內容修改即可，不必再另外請求。

## 協作規則
1. **嚴禁修改不屬於自己角色的檔案**。就算只是一行、就算是順手修 bug，也不行。
2. **需要別的角色幫忙時，要提出請求，不要自己動手**：把請求寫進**目標角色的任務檔**（格式見 `docs/tasks/README.md`），然後在回覆中告訴使用者「已在 X 的任務檔新增 ID，請通知 X 角色讀取」。
3. **CEO 不寫遊戲程式碼**，只維護 `CLAUDE.md` 與 `docs/`，負責規劃、審核、決策、派工與 push。
4. 完成任務後：在任務下方填寫「回報」、把狀態改成 `待審核`；若改變了系統行為或資料格式，同步更新 `docs/PROJECT_MAP.md` 中**自己領域**的章節，並在 `docs/CHANGELOG.md` 最上方追加一行（日期｜角色｜摘要）。
5. **除了 CEO，任何角色都不能 commit / push**。CEO 只在使用者說「審核」且審核通過後才 commit + push（push 到 `main` 會直接部署上線）。
6. 數值（HP/ATK/價格/獎勵）大幅調整要考慮經濟連動，先在 `docs/tasks/ceo.md` 提出，由 CEO 決定。
7. 發現 bug 但不在自己範圍 → 寫進負責角色的任務檔（不確定是誰 → 寫進 `docs/tasks/ceo.md`），不要順手改。
8. 修改 `localStorage` 存檔結構時，要評估是否需要提升 `App.jsx` 的 `SAVE_VERSION`（提升會**清空所有玩家存檔**），並事先在 `docs/tasks/ceo.md` 提出。
9. 在別人的任務檔**只能新增任務**，不能改動或刪除既有內容。自己任務檔中的任務，只能填「回報」區和改狀態；「審核」區只有 CEO 能寫。例外：**使用者在對話中直接指派的工作**，由該角色自己在**自己的任務檔**新增一筆任務（`來自：使用者`），做完照常填回報、改 `待審核`。
10. **所有要讓 CEO 或其他角色知道的事，都必須寫進任務檔，不能只在對話裡跟使用者說**。包括：commit 範圍、注意事項、疑慮、建議、未完成的部分、需要 CEO 更新的文件。CEO 審核時**只看任務檔**，看不到你的對話。對話中只需告訴使用者：「<任務 ID> 已完成並寫好回報，請通知 CEO 審核」（以及需要通知的其他角色）。回報寫完後，自己再讀一次任務檔，確認對話中講過的重點都有寫進去。
11. **驗證完要收拾工具**：用瀏覽器預覽 / dev server / 背景指令驗證完後，回報前一律關閉自己開的 dev server（`preview_stop`）、瀏覽器分頁與背景程序，不要留著。別的對話開的伺服器不要去關，直接連它的網址即可。
12. **共用記憶**：本專案所有角色的對話**共用同一個記憶資料夾**（`~/.claude/projects/C--Users-User-Desktop-BattleCats/memory/`）。
    - 只能**新增**自己的記憶檔，不能修改或刪除別人的記憶檔；`MEMORY.md` 索引只能追加一行。
    - 只適用某角色的記憶，檔名與 description 要標明角色（例如「【UI】…」）；寫給所有角色的記憶要寫成角色中立的語氣（不要寫「我是 X」）。
    - 專案規則以本檔為準。想新增全體規則 → 在 `docs/tasks/ceo.md` 提出，由 CEO 寫進本檔。
    - 不准修改全域設定 `~/.claude/CLAUDE.md`。

## 設計文件（`docs/design/`）

大型新功能由 CEO 先寫設計文件，裡面的「介面合約」是角色之間的約定，**不可自行更改**；有問題在 `docs/tasks/ceo.md` 提出。

| 文件 | 內容 | 狀態 |
|---|---|---|
| [chapter-environment.md](docs/design/chapter-environment.md) | 章節環境機制（晝夜、潮汐） | 已實作，平衡試玩中 |

## 任務系統（`docs/tasks/`）

- 每個角色一個任務檔，格式與狀態流程見 [docs/tasks/README.md](docs/tasks/README.md)。
- **開機流程**：讀本檔 → 讀 `docs/PROJECT_MAP.md` → 讀自己的任務檔（任務若引用 `docs/design/` 的設計文件，先讀完）→ 依優先度處理狀態為 `待處理` 或 `退回` 的任務 → 填回報、改為 `待審核` → 告訴使用者完成了哪些任務、是否有新增給其他角色的請求。
- 任務檔沒有待辦 → 回報「目前沒有任務」並等待指示，不要自行找事改。

## CEO 審核流程（使用者說「審核」時）

1. 讀所有任務檔中狀態為 `待審核` 的任務及其回報。
2. 用 `git status` / `git diff` 檢查實際改動：只改了該角色的檔案、內容符合需求、沒有超出範圍的改動。
3. 執行 `npm run build`（以及 `npm test`，若環境可跑）。
4. 通過 → 狀態改 `已完成`、在「審核」區寫結論；**只 `git add` 通過任務的檔案**，commit（訊息列出任務 ID）後 push。
5. 不通過 → 狀態改 `退回`，在「審核」區寫明原因與修正要求；必要時在其他角色任務檔新增任務。最後告訴使用者要通知哪些角色。
