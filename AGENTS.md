# 石門國小五年級運動會進場舞（V5.0 兩分鐘精華版）專案規範與交接紀錄

## 一、獨立專案定位與嚴格隔離原則
- 本專案為 **V5.0 兩分鐘精華版（總長 `1:50`＝`110.0` 秒｜`5 大段落 × 18 個精準分解步驟`）**。
- 原 **V4.04 完整版**位於平行目錄 `../石門國小_五年級運動會進場舞_TryEverything` 與公開倉庫 `githubsenna/try-everything`；**兩版完全獨立共存，維護 V5.0 時嚴禁更動 V4.04 目錄與倉庫**。
- 線上公開網址：<https://githubsenna.github.io/try-everything-v5/>

---

## 二、五大核心教學鐵律（不可更動）
1. **鏡像口訣鐵律（以學生端為準）**：所有網頁提詞、分解卡片、截圖方向標註與 A4 學習單一律直接寫**【學生自己的左右手腳】**（如「左跨弓箭步畫圓壓膝」、「左手指前微笑定格」）。
2. **無縫剪接影片與純淨介面**：採用離線剪接原片 `03_影音資源/Try_Everything_V5_兩分鐘精華版原片.mp4` 搭配 `<video>`，嚴禁外掛 YouTube `iframe`、5-6-7-8 黑幕倒數或 `KaiTi` 字型。
3. **極簡放大 2 行口令卡 ＋ 單步精準切點 ＋ 手機穩定防跳段**：卡片維持 `🎯 動作` ＋ `💡 提醒`；`ALL_STEPS` 維持 `0` 到 `110` 秒 100% 連續無缺口；保留單步結束 `350ms` 定格、段尾 `SEC_POST_BUFFER = 0.25s`、`state.pendingSeekTime` 手機延遲跳轉佇列與固定高度即時字幕框。
4. **標題乾淨、版本署名置底**：`<title>` 與頂部 `.brand-title` 嚴禁顯示版本號；頁尾 `#site-footer` 與根目錄 `index.html` 統一標註 `Version 5.0 (V5.0) ｜ Made by SENNA`。

---

## 三、全曲時間軸結構（5 大段落 × 18 個分解小步驟）
- `01 前奏`（`0:00–0:16`｜4 個八拍｜抱肩衝天・揮拳轉身｜4 步 `1-1`～`1-4`，`1-2` 延至 `0:09`）
- `02 主歌`（`0:16–0:34`｜4 個八拍｜斜指叉腰・平展舉手｜4 步 `2-1`～`2-4`，`21.5s` 換邊、`34s` 完整收手）
- `03 副歌`（`0:34–1:07`｜8 個八拍｜左跨後勾・舉手壓膝・插腰扭臀｜4 步 `3-1`～`3-4`）
- `04 橋段`（`1:07–1:28.5`｜4 個八拍（2 大組合）｜大力水手叉跳・右轉彩虹跳｜2 步 `4-1`～`4-2`）
- `05 結尾`（`1:28.5–1:50`｜8 個八拍｜左跨壓膝・開腳深蹲・畫圓定格｜4 步 `5-1`～`5-4`）

---

## 四、維護與發布標準指令
1. 若調整切點或口訣，請修改 `.agents/skills/dance-coach-updater/scripts/build_interactive.js` 與 `extract_18_frames.js`，切勿手動修改含 Base64 截圖的成品 HTML。
2. 建置與驗證指令：
   ```powershell
   node ".agents/skills/dance-coach-updater/scripts/build_interactive.js"
   node ".agents/skills/dance-coach-updater/scripts/test_dom_logic.js"
   node ".agents/skills/dance-coach-updater/scripts/publish_to_github.js" "Update V5.0: 更新說明"
   ```

---

## 五、V5.0 定版狀態與跨對話／筆電接手總覽（2026-11-16 結案存檔）

- **目前進度**：**V5.0 兩分鐘精華版已定稿上線**（GitHub Pages：<https://githubsenna.github.io/try-everything-v5/>）。
- **已完成的 0.5 秒逐格健檢精準切點**：
  - `1-2` 延至 `9.0s` 舉滿第 4 拍、`1-3` 至 `13.0s` 落地、`1-4` 至 `16.0s`。
  - `2-1`／`2-2` 精準對接於 `21.5s`、`2-4` 延至 `34.0s` 完成收手（`3-1` 含 `33.5s` 進場微緩衝）。
  - `3-3` 延至 `58.5s` 收手、`3-4` 延至 `67.0s` 並對齊 `61.5s` 壓膝圖文；`4-1` 含 `66.5s` 緩衝並至 `75.2s` 落地。
  - `5-1` 延至 `96.5s`（`1:36.5`）完整壓滿膝再起身、`5-2` 搖擺深蹲（`96.3–102.5s`）、`5-3` 畫圓轉圈（`102.2–107.2s`）、`5-4` 左手指前微笑定格 3 秒（`106.8–110.0s`）。
- **雙版本與雙層技能共存關係**：
  - **V4.04 完整原曲版**位於 `../石門國小_五年級運動會進場舞_TryEverything`（`https://githubsenna.github.io/try-everything/`），保持原樣未動。
  - **筆電切換作業方式**：筆電同步雲端硬碟後，依 `../_Antigravity_全域設定備份/筆電一鍵還原指令說明.md` 執行一次 `restore_to_this_pc.ps1`，即可同步第一層全域技能（`sports-day-dance-coach-builder` V5.0 藍圖）與 `GEMINI.md`；雲端 `.agents/skills/` 第二層技能會自動隨雲端硬碟生效。
  - **日後微調建議**：若僅微調切點秒數或口訣文字，直接使用 **Hydrogen** 模型修改 `build_interactive.js` 與 `extract_18_frames.js` 後執行 `test_dom_logic.js` 與 `publish_to_github.js` 即可。
