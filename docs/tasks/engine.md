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

