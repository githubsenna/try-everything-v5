---
name: dance-coach-updater-v5
description: 石門國小五年級《Try Everything》V5.0 兩分鐘精華版互動帶練系統、18 張截圖擷取、自動化 DOM 驗證與 GitHub Pages（try-everything-v5）維護發布技能。
---

# 舞蹈帶練系統與口訣維護技能（Dance Coach Updater — V5.0 兩分鐘精華版）

## 一、V5.0 專案黃金規範（與 V4.04 完全獨立隔離）

1. **獨立目錄與倉庫原則**：
   - 本技能僅維護 `石門國小_五年級運動會進場舞_TryEverything_V5精華版` 與獨立公開倉庫 **`githubsenna/try-everything-v5`**（`https://githubsenna.github.io/try-everything-v5/`），**嚴禁修改或覆蓋原有 V4.04 目錄或 `try-everything` 倉庫**。
2. **全曲 5 大段 × 18 步時間軸規範（`0` 到 `110` 秒 100% 無縫連續）**：
   - 教學影片使用剪接合成之 `03_影音資源/Try_Everything_V5_兩分鐘精華版原片.mp4`（原片 `0–16s` 接 `99–193s`，總長 `110.0s`）。
   - `01 前奏`（4 步：`0–16s`，含 `1-1` `0–5s`、`1-2` `4.8–9s`、`1-3` `8.8–13s`、`1-4` `12.8–16s`）
   - `02 主歌`（4 步：`16–34s`，接原片 `1:39`，`2-1`/`2-2` 接於 `21.5s`，`2-4` 停至 `34s`）
   - `03 副歌`（4 步：`34–67s`，含 `3-1` `33.5s` 緩衝、`3-3` 至 `58.5s`、`3-4` 至 `67s` 壓膝）
   - `04 橋段`（2 大組合：`67–88.5s`）
   - `05 結尾`（4 步：`88.5–110s`，含 `5-1` 至 `96.5s`、`5-2` 至 `102.5s`、`5-3` 至 `107s`、`5-4` 微笑定格 3 秒）
3. **鏡像與介面規範**：
   - 全域使用台灣繁體中文與學生本位鏡像左右方向（無 `KaiTi`、無倒數遮罩）。
   - 頂部不顯版本號，頁尾 `#site-footer` 與根目錄 `index.html` 統一標註 `Version 5.0 (V5.0) ｜ Made by SENNA`。

---

## 二、標準更新與發布流程

1. 若須重新剪接教學片與音檔：執行 `node ".agents/skills/dance-coach-updater/scripts/splice_v5_video.js"`（會自動使用暫存 `ffmpeg-static`）。
2. 若須調整 18 張代表截圖秒數：修改並執行 `node ".agents/skills/dance-coach-updater/scripts/extract_18_frames.js"` 更新 `keyframes_18.json`。
3. 重建網頁、執行自動化檢查並推送至 `try-everything-v5`：
   ```powershell
   node ".agents/skills/dance-coach-updater/scripts/build_interactive.js"
   node ".agents/skills/dance-coach-updater/scripts/test_dom_logic.js"
   node ".agents/skills/dance-coach-updater/scripts/publish_to_github.js" "Update V5.0: 更新說明"
   ```
   確認輸出 `ALL V5.0 VERIFICATION CHECKS PASSED!` 後即可發布。
