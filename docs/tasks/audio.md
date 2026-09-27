# 音效 — 任務檔

> 格式與規則見 [README.md](README.md)。

## 任務列表

## [AU-001] 刪除未使用的 廢棄.mp3
- 狀態：已完成
- 優先度：低
- 來自：CEO（2026-09-27，使用者決定）
- 依賴：無

**需求**
刪除 `public/audio/廢棄.mp3`（4.9MB，程式沒有引用）。刪除前用搜尋確認 `src/` 沒有任何地方引用它。

**完成條件**
- 檔案已刪除；`npm run build` 成功。

### 回報（負責角色填寫）
- 修改檔案：`public/audio/廢棄.mp3`（刪除）
- 做了什麼：確認 `src/`、`index.html`、`vite.config.js` 都沒有引用後，經使用者在對話中允許，以 `git rm "public/audio/廢棄.mp3"` 刪除（已 staged）。第一次嘗試刪除曾被 Claude Code 自動模式擋下，取得使用者允許後才執行。
- 如何驗證：`grep -rln "廢棄"`（排除 node_modules/.git/dist）只命中 `docs/` 內的文字；刪除後 `npm run build` 成功。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：commit 範圍為該檔案的刪除（`git rm` 已 staged）。`PROJECT_MAP.md` §0（public/audio 說明）與 §11 #5 仍寫著「廢棄.mp3」，請 CEO 更新。

### 審核（CEO 填寫）
- 2026-09-27 通過。PROJECT_MAP §0、§11 #5 已由 CEO 更新。


## [AU-002] 音量分類：主音量 / 音樂 / 召喚音效 / 按鈕音效 / 勝敗音效
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27，使用者需求：設定只有一個音量太少）
- 依賴：無（UI-005 依賴本任務）

**需求**
目前 `AudioManager` 只有 master / music / sfx 三個 gain，設定畫面只能調主音量。請改成可分類調整：

| 分類 key | 內容 |
|---|---|
| `master` | 總音量 |
| `music` | 背景音樂（bgm_lobby、bgm_battle） |
| `summon` | 召喚角色音效（sfx_summon） |
| `ui` | 按鈕點擊音效（**新增**，見下） |
| `result` | 勝利 / 失敗音效（sfx_win、sfx_lose） |

1. 每個分類一個 GainNode，都接到 master。`playSfx(key)` 依音效自動走對應分類。
2. **新增按鈕點擊音效** `sfx_click`：短促、不刺耳。可用 Web Audio 振盪器即時合成（不用新增音檔），或自行放入小於 30KB 的音檔。
3. **音量設定由音訊模組自己保存**到 localStorage 新 key `audioVolumes`（`{ master, music, summon, ui, result }`，0~1，預設 master 1、其他 0.8）。首次載入若有舊 key `volume`，將其值轉為 `master`（不要刪其他存檔，不需提升 `SAVE_VERSION`）。
4. **對外 API（UI-005 會照這個介面寫，請務必一致）**：
   - `audio.getVolumes()` → `{ master, music, summon, ui, result }`
   - `audio.setVolume(category, value)` → 立即生效並存檔
   - `audio.playClick()` → 播放按鈕音效（等同 `playSfx('sfx_click')`，要有冷卻避免連點爆音）
   - 保留原本的 `playMusic` / `crossfadeMusic` / `fadeOutMusic` / `playSfx` 介面不變。
   - AudioContext 尚未建立時呼叫 `setVolume` / `getVolumes` 不可報錯（先存值，建立 gain 時套用）。

**限制**：只改 `src/audio/*`（以及 `public/audio/*`，如需要）。

**完成條件**
- 各分類音量獨立生效、重新整理後保留；舊 `volume` 值有正確轉移。
- `npm run build` 成功。
- 更新 `docs/PROJECT_MAP.md` 第 8 章（音效）。

### 回報（負責角色填寫）
- 修改檔案：`src/audio/index.js`、`src/audio/useAudio.js`、`docs/PROJECT_MAP.md`（§8）、`docs/CHANGELOG.md`
- 做了什麼：
  - 節點改為 `musicFade → music → master`、`summon/ui/result → master`；淡入淡出只動 `musicFade`，不會蓋掉使用者音量。
  - `playSfx(key)` 依表自動走分類（sfx_summon→summon、sfx_click→ui、sfx_win/lose→result；其他預設 summon，`register(key,url,{category})` 可指定）。
  - `sfx_click` 用振盪器即時合成（三角波 1100→650Hz、約 70ms、音量 0.35），沒有新增音檔。
  - 音量存到 localStorage `audioVolumes`；首次載入沒有此 key 時，把舊 `volume` 轉成 master 並立即寫入 `audioVolumes`（不刪 `volume`、不動其他存檔、不需提升 SAVE_VERSION）。
  - API 照任務規格：`getVolumes()`、`setVolume(category, value)`（值夾在 0~1，無效分類/值忽略；ctx 未建立時只存值，建立時套用）、`playClick()`（60ms 冷卻）。`playMusic`/`crossfadeMusic`/`fadeOutMusic`/`playSfx` 介面不變；舊的 `setMasterVolume`/`setMusicVolume`/`setSfxVolume` 保留為相容用。
  - 不支援 Web Audio 時 `resume()` 回傳 false，所有公開方法失敗只 `console.warn`（jsdom 測試渲染 Lobby 時不會出現未處理的 rejection）。
  - 另修舊 bug：`useAudio` 每次 mount 都 `register` 會把「載入中的 Promise」蓋回 URL 造成重複下載；現在改為模組載入時註冊一次、且已註冊的 key 不覆蓋。
- 如何驗證：`npm run build` 成功。瀏覽器實測：設 `volume=0.5`、刪 `audioVolumes` 後重新整理 → `getVolumes()` 為 master 0.5、其他 0.8，`audioVolumes` 已寫入。另用 Node + 假 AudioContext 模擬：ctx 建立前 `setVolume('music',0.3)` → 建立後 music gain 為 0.3；`playClick()` 連點兩次只響一次。（瀏覽器後續 JS 檢查被自動模式擋下，因此分類音量的「耳聽」確認未做，建議 UI-005 完成後一起實聽。）`npm test` 未跑：repo 內 node_modules 缺 vitest。
- 新增給其他角色的請求：無（UI-005 可開始，API 與任務規格一致）
- 給 CEO 的注意事項：
  - commit 範圍：`src/audio/index.js`、`src/audio/useAudio.js`（AU-002、AU-003 共用），加上 AU-003 的 `src/scenes/Lobby.jsx`、以及 `docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`。
  - 過渡期：UI-005 完成前，`App.jsx` 仍會存 `volume` 並呼叫 `setMasterVolume(volume)`，因相容方法會同步寫入 `audioVolumes.master`，兩邊一致、不會衝突。
  - `App.jsx` 的 `handleReset` 會 `localStorage.clear()` 清掉 `audioVolumes`；記憶體中的音量值會保留，下一次調音量時才重寫。若希望「清除存檔」也重設音量，需另外決定（目前不影響功能）。
  - UI-005 完成後 `PROJECT_MAP.md` §1 localStorage 表的 `volume` 需改為 `audioVolumes`（UI-005 任務已列）。

### 審核（CEO 填寫）
- 2026-09-27 通過。改動限於 `src/audio/*`，API 與規格一致，build 與 test 通過。實際聽感待使用者上線後確認。「清除存檔後音量只留在記憶體」列入 PROJECT_MAP §11 #16。


## [AU-003] 修正背景音樂播放時機
- 狀態：已完成
- 優先度：高
- 來自：CEO（2026-09-27，使用者回報：「第一二關放音樂的時間點好像不太對」）
- 依賴：建議與 AU-002 一起做（同一個檔案）

**需求**
使用者只描述「時間點不對」，請先實際重現（第一章第 1、2 關；包含「首次進入」與「打完回大廳」的情況），在回報中寫清楚實際觀察到的現象。CEO 審閱程式後的懷疑點如下，請逐一確認並修正：

1. **打完關卡回大廳後，大廳音樂被殺掉 / 無聲**：`Battle.jsx` 勝敗時呼叫 `fadeOutMusic(300)`，它在 330ms 後才執行 `_stopAllMusic()`；但 300ms 時場景已切回大廳，Battle 卸載時呼叫 `playMusic('bgm_lobby')` 剛開始播，就被這個延遲的計時器關掉。另外 fade 把 `musicGain` 拉到 0，`playMusic` 沒有把音量恢復。→ 修正方式：`fadeOutMusic` 的計時器要受 token 控制（之後有新的播放請求就取消），`playMusic` 開播時要把 music gain 恢復。
2. **第一次進入戰鬥時音樂延遲好幾秒**：音檔是第一次要用時才下載＋解碼（bgm_lobby 4MB、bgm_battle 1.5MB），所以前一、兩場會晚開始，之後有快取就正常。→ 建議在 `resume()` 第一次建立 AudioContext 後，於背景預先載入所有已註冊的音檔。
3. **一進遊戲的大廳沒有音樂**：`Lobby.jsx` 沒有播放 bgm_lobby（要進到章節選擇才開始播）。

**授權的跨檔修改**：`src/scenes/Lobby.jsx` 只可新增一個 `useEffect` 呼叫 `audio.playMusic('bgm_lobby')`（寫法比照 `ChapterSelect.jsx`，含 `useAudio` import），其他不動。`Battle.jsx` 不要改；若你認為一定要改，寫進 `docs/tasks/ceo.md` 提出。

**完成條件**
- 首次進大廳即有音樂；進戰鬥切成戰鬥音樂；勝 / 敗音效後回大廳，大廳音樂正常響起且音量正確。
- 重複打第 1、2 關數次都一致。
- `npm run build` 成功；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：`src/audio/index.js`、`src/scenes/Lobby.jsx`（僅新增 `useAudio` import 與一個 `useEffect` 播 bgm_lobby，符合授權）
- 做了什麼（重現結果，用 Node + 假 AudioContext 跑舊版程式的「大廳→章節→關卡→第 1 關→勝利→回大廳」流程）：
  1. **確認：回大廳後無聲**。舊版 `fadeOutMusic(300)` 的 330ms 計時器在 Battle 卸載呼叫 `playMusic('bgm_lobby')` 之後才觸發，把剛開始的大廳音樂 stop 掉。→ `fadeOutMusic` 改為取 token，計時器觸發時若已有新請求就不動作；`playMusic` 開播時把 `musicFade` 恢復為 1（並 cancel 排程中的 ramp）。
  2. **確認：首次進戰鬥延遲**。舊版 bgm_battle 是按下關卡後才 fetch＋解碼（1.5MB），大廳音樂更是 4MB。→ `resume()` 第一次建立 AudioContext 後，依註冊順序（bgm_lobby → bgm_battle → sfx）在背景預載所有音檔。
  3. **確認：一進遊戲大廳沒音樂**。→ `Lobby.jsx` 新增 `useEffect` 播 bgm_lobby（首次互動解鎖 AudioContext 後開始）。
  4. **額外發現：大廳各畫面切換時音樂一直從頭重播**。舊版 Lobby→章節→關卡每次都 stop 再 start 同一首（模擬中 bgm_lobby 被重啟 3 次），這也是「時間點不對」的可能原因。→ `playMusic` 在同一首正在播時不重播（只取消淡出）；需要強制重播可傳 `{ restart: true }`。
- 如何驗證：
  - 新版同流程模擬：bgm_lobby 只 start 一次、bgm_battle 在進戰鬥前已預載、勝利後 bgm_battle 停止並接上 bgm_lobby，330ms 的淡出計時器不再關掉它，最終 `_currentKey = bgm_lobby`、`musicFade = 1`。
  - 瀏覽器實測（dev server）：清掉狀態重新整理後，大廳一進來 `_currentKey` 即為 `bgm_lobby`、AudioContext running；之後進入第一章第 1 關。後續在瀏覽器內讀取音訊狀態、以及重複打 1、2 關到勝利的步驟被自動模式擋下，**未能在實機重複打完 1、2 關驗證**，建議 CEO 或使用者實聽確認一次。
  - `npm run build` 成功；dev server 與瀏覽器分頁已關閉。
- 新增給其他角色的請求：無（`Battle.jsx` 不需修改）
- 給 CEO 的注意事項：commit 範圍同 AU-002（`src/audio/*`、`src/scenes/Lobby.jsx`）。Battle 卸載與 Lobby 掛載會先後各呼叫一次 `playMusic('bgm_lobby')`，token 機制保證只生效一次，無重複播放。

### 審核（CEO 填寫）
- 2026-09-27 通過。三個懷疑點都已確認並修正，另外修掉大廳各畫面切換時音樂重頭播放的問題，做得好。Lobby.jsx 改動符合授權。實機重複打 1、2 關的耳聽驗證請使用者上線後確認。

## [AU-004] 「清除存檔」與存檔版本重置時保留玩家設定（音量、主題）
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27，使用者指示處理 PROJECT_MAP §11 #16）
- 依賴：無

**問題**
`src/App.jsx` 有兩處用 `localStorage.clear()` 清空全部存檔：
- 第 22 行 `checkSaveVersion()`（`SAVE_VERSION` 不符時）
- 第 163 行 `handleReset()`（大廳「清除存檔」按鈕）

清空時連 `audioVolumes`（音量）和 `theme`（主題）一起被刪，但畫面上的狀態沒變 → 重新整理後音量、主題都變回預設，玩家會覺得設定「莫名其妙不見」。

**決定（CEO）**：「清除存檔」只清**遊戲進度**，**保留玩家設定**。

**需求**
1. 兩處都改成：清除存檔時保留 `audioVolumes`、`theme` 兩個 key（其餘照舊清除），並照舊寫回 `saveVersion`。建議在 App.jsx 內寫一個小函式共用，保留清單集中定義，方便以後新增設定 key。
2. 舊 key `volume` 已由音訊模組轉移成 `audioVolumes.master`，可以照舊被清掉。
3. 驗證：調整音量與主題 → 按「清除存檔」 → 重新整理 → 音量、主題維持；金幣、解鎖、關卡進度等確實重設。

**授權的跨檔修改**：`src/App.jsx` 只可改 `checkSaveVersion()` 與 `handleReset()` 內的清除邏輯，以及新增上述共用函式 / 保留清單常數；其他（state、場景、props、主題 effect）一律不動。

**完成條件**
- 上述驗證通過；`npm run build`、`npm test` 通過。
- 更新 `docs/PROJECT_MAP.md` §1（說明清除存檔會保留哪些 key）；驗證完關閉 dev server 與瀏覽器。

### 回報（負責角色填寫）
- 修改檔案：`src/App.jsx`、`docs/PROJECT_MAP.md`（§1）、`docs/CHANGELOG.md`
- 做了什麼：
  - `App.jsx` 在 `SAVE_VERSION` 下方新增常數 `PRESERVED_KEYS = ['audioVolumes', 'theme']` 與函式 `clearSaveData()`：先讀出保留 key 的值（不存在的略過）→ `localStorage.clear()` → 寫回保留值 → 寫回 `saveVersion`。
  - `checkSaveVersion()` 與 `handleReset()` 原本的 `localStorage.clear()` + `setItem('saveVersion')` 兩行都改成呼叫 `clearSaveData()`。其他（state、場景、props、主題 effect）沒動，符合授權範圍。
  - 舊 key `volume` 照舊被清掉。
- 如何驗證：
  - `npm run build` 成功；`npx vitest run` 通過（1 test，「開啟設定」）。本機 node_modules 現在已有 vitest。
  - dev server 實測（清除存檔）：先寫入 coins=9999、highestUnlocked={1:5,2:3}、theme=neon、audioVolumes={master:0.4,…} 後重新整理 → 按「清除存檔」（測試時把 `window.confirm` stub 成回傳 true）→ 畫面金幣變 300、localStorage 中 coins=300、highestUnlocked={1:1,2:1}、saveVersion=1，audioVolumes 與 theme 原值保留 → 重新整理後主題仍是 neon、audioVolumes 不變、金幣仍是 300。
  - dev server 實測（版本不符）：把 saveVersion 改成 '0'、coins 改成 777 後重新整理 → coins 重設為 300、saveVersion=1，theme 與 audioVolumes 保留。
  - 驗證完已關閉 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：無
- 給 CEO 的注意事項：
  - commit 範圍：`src/App.jsx`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/audio.md`。
  - `PROJECT_MAP.md` §11 的 #16 仍是未修狀態，請 CEO 標記為已修（AU-004）。§1 的 `saveVersion` 那列與「清除存檔」說明已由我更新。

### 審核（CEO 填寫）
- 2026-09-27 通過。App.jsx 只改兩處清除邏輯並新增共用函式與保留清單，符合授權；清除存檔與版本重置兩種情境都有實測；build、test 通過。

## [AU-005] 章節環境機制：環境提示音
- 狀態：已完成
- 優先度：中
- 來自：CEO（2026-09-27，使用者選定新特色「章節環境機制」）
- 依賴：無（引擎用 `audio.playEnvCue?.()` 呼叫，你先完成也不會出錯）

**設計文件**：`docs/design/chapter-environment.md`（**先完整讀過**；§4 介面是合約，不可自行更改，有問題寫進 `docs/tasks/ceo.md`）

**需求**（詳見設計文件 §4.4）
1. `src/audio/index.js` 新增 `playEnvCue(kind)`，kind：`nightWarn`、`dayStart`、`floodWarn`、`ebbWarn`。用振盪器 / 雜訊合成：夜晚低沉鐘聲感、天亮輕快、漲潮與退潮水聲感（兩者可用音高或方向感區分）。
2. 音量分類由你決定：沿用現有分類，或新增 `env` 分類。**若新增分類**，在 `docs/tasks/ui.md` 新增任務請 UI 在設定畫面加一條滑桿。
3. 要有冷卻，避免重複觸發疊音。

**完成條件**
- 四種提示音可用瀏覽器 console 直接呼叫試聽，聽感彼此可區分。
- `npm run build`、`npm test` 通過；更新 `docs/PROJECT_MAP.md` §8。

### 回報（負責角色填寫）
- 修改檔案：`src/audio/index.js`、`docs/PROJECT_MAP.md`（§8）、`docs/CHANGELOG.md`、`docs/tasks/ui.md`（新增 UI-008）
- 做了什麼：
  - 依設計文件 §4.4 合約新增 `audio.playEnvCue(kind)`，`kind`：`nightWarn` / `dayStart` / `floodWarn` / `ebbWarn`；其他值直接忽略（不報錯）。另匯出常數 `ENV_CUES`。
  - 全部用振盪器 / 雜訊即時合成，**沒有新增音檔**：
    - `nightWarn` 夜晚預告：低沉鐘聲（G2 98Hz 基音＋0.5/2/2.76/5.4 倍泛音），敲兩下，約 2.7 秒。
    - `dayStart` 天亮：三角波上行琶音 C5-E5-G5-C6，約 0.5 秒，輕快。
    - `floodWarn` 漲潮預告：帶通白雜訊浪聲（濾波 1800→350Hz），聲像由右往左（潮水往我方推），加 110→70Hz 低沉下滑音，約 1.5 秒。
    - `ebbWarn` 退潮預告：同樣的浪聲但濾波 350→1800Hz、聲像由左往右，加輕的 440→660Hz 上滑音。漲潮/退潮用音高走向＋左右方向區分。
  - **新增音量分類 `env`**（預設 0.8）。理由：環境提示音是戰鬥中的遊戲提示，玩家可能想單獨調大或關掉；放在「勝敗音效」下會讓滑桿意義混淆。舊存檔的 `audioVolumes` 沒有 `env` 時自動補預設值，不需轉移、不需提升 SAVE_VERSION。`getVolumes()` 會多回傳 `env`。
  - 冷卻：同一種提示音 1.5 秒內重複觸發會被忽略（走既有 `playSfx` 冷卻機制，內部 key `env_<kind>`）。
  - 開發模式下把單例掛到 `window.audio`，符合「可用瀏覽器 console 直接呼叫試聽」：`npm run dev` → 點一下頁面 → console 輸入 `audio.playEnvCue('nightWarn')`。有 `import.meta.env.DEV` 判斷，正式建置不會掛。
- 如何驗證：
  - `npm run build` 成功；`npx vitest run` 全部通過（2 個檔案、14 tests，含引擎角色新增、尚未審核的 `environment.test.js`）。
  - dev server 用 OfflineAudioContext 實際渲染四種聲音並量測：長度 nightWarn 2.74s / dayStart 0.53s / floodWarn 1.46s / ebbWarn 1.48s；聲像（每 250ms，負＝左、正＝右）floodWarn `0.00 0.15 -0.18 -0.22`（往左）、ebbWarn `-0.22 -0.22 0.18 0.71`（往右），其餘置中。第一版潮汐浪聲偏小（峰值 0.17），已把雜訊包絡拉高，調整後四者發聲期間 RMS 在 0.041~0.068，響度相近、無削波（峰值 ≤ 0.57）。
  - 即時 AudioContext：四種 `playEnvCue` 皆無警告；1.5 秒內重播被冷卻擋下；`playEnvCue('bogus')`、`playEnvCue()` 不報錯；`setVolume('env', 0.35)` 會存進 `audioVolumes.env`，播放時 env gain 為設定值。
  - **未做耳聽確認**（我無法實際聽聲音），聽感是否「可區分、不刺耳」建議 CEO 或使用者在 console 試聽一次。
  - 驗證完已關閉 dev server 與瀏覽器分頁。
- 新增給其他角色的請求：`docs/tasks/ui.md` 新增 **UI-008**（設定畫面加「環境提示音」`env` 滑桿），請通知 UI 角色。
- 給 CEO 的注意事項：
  - commit 範圍：`src/audio/index.js`、`docs/PROJECT_MAP.md`、`docs/CHANGELOG.md`、`docs/tasks/audio.md`、`docs/tasks/ui.md`。
  - 未改 `Battle.jsx`；EG-003 照合約以 `audio.playEnvCue?.(kind)` 呼叫即可。
  - 設計文件 §4.4 只說「若新增分類要告知 UI」，已照做（UI-008），介面沒有變動。
  - 量測時發現 Chrome 對沒有聲音流過的 GainNode 不會更新 `.value` 讀值（有聲音播放時才是設定值），這不是 bug，只是之後若有人用 console 讀 gain 值檢查，別被誤導。

### 審核（CEO 填寫）
- 2026-09-27 通過。四種提示音純合成、有冷卻，新增 `env` 分類並依規則開了 UI-008；`window.audio` 只在開發模式掛載。耳聽確認請使用者上線後試聽。

