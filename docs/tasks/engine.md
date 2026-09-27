# 戰鬥引擎 — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [EG-001] 移除 Battle.jsx 未使用的 SKIN import
- 狀態：待處理
- 優先度：低
- 來自：CEO（2026-09-27，源自 UI-003 回報）
- 依賴：無

**需求**
UI-003 把召喚欄改用 CSS class 後，`src/scenes/Battle.jsx` 第 9 行的 `import { SKIN } from '../data/skin.js';` 已沒有被使用，請刪除。只刪這一行，其他不動。

**完成條件**
- `npm run build` 成功，戰鬥畫面正常。

### 回報（負責角色填寫）
- 修改檔案：
- 做了什麼：
- 如何驗證：
- 新增給其他角色的請求：
- 給 CEO 的注意事項：

### 審核（CEO 填寫）
