---
name: sports-day-dance-coach-builder
description: >-
  Use this skill whenever the user wants to create a new elementary school
  sports day entrance dance, aerobics, or performance interactive coaching web
  system and printable A4 cue/rubric worksheet from a reference video (YouTube
  URL or local MP4). Applies the proven Shimen Elementary V5.0 Gold Standard
  architecture (0.5s frame-sheet cutpoint auditing, ffmpeg abridged performance
  splicing & MP3 export, precision per-step cutpoints with lead-in buffers,
  2-line enlarged action+tip cues, prominent live subtitles, repeat/first-learn
  card sizing, and mobile deferred-seek stability) directly from the first build.
---

# 國小運動會進場舞／大會舞互動帶練系統建置萬用技能（V5.0 黃金藍圖）

當導師為**新學年度、新歌曲或新班級活動**開啟全新專案資料夾，並提供示範舞蹈影片（YouTube 連結或本機 MP4），或須進一步從完整原曲版**剪接出兩分鐘以內進場精華版**時，直接套用本藍圖從第一版起即產出經過實戰驗證的 **V5.0 黃金標準完整教材組**，無須重覆踩坑磨合。

---

## 一、標準專案目錄與雙版本獨立共存架構

於指定工作區（推薦位於 Google 雲端硬碟同步專案夾下）建立標準四層架構與根目錄入口；若需同時保有「完整原曲版（如 `V4.04`）」與「兩分鐘剪接精華版（如 `V5.0`）」，**必須建立完全獨立的平行資料夾與獨立 GitHub 倉庫（如 `<repo>` 與 `<repo>-v5`），嚴禁覆蓋原完整版**：

```text
<專案名稱>/
├── index.html                           # GitHub Pages 短網址自動導向頁（含帶練系統、A4 學習單與廣播 MP3 連結）
├── AGENTS.md                            # AI 自動載入之專案規則、時間軸、跨對話與筆電交接紀錄
├── README.md                            # 專案總覽、雙版本網址與師生快速使用說明
├── .agents/skills/
│   ├── dance-coach-updater/             # 本專案專用維護腳本（splice / extract / build / test / publish）
│   └── sports-day-dance-coach-builder/  # 萬用建置藍圖副本（雲端第二層技能同步）
├── 01_課程計畫/                         # 曲目拆解規格表、新舊時間對照、設計決策與改版歷史紀錄
├── 02_教案簡報/                         # 教師免備課分節進度、操場／教室帶練口令 SOP
├── 03_影音資源/
│   ├── <曲名>_教學原片.mp4              # 同目錄離線教學原片（建議 <= 50MB H.264 MP4）
│   ├── <曲名>_進場音樂.mp3              # （若為剪接精華版）同步匯出操場廣播用 MP3
│   └── <曲名>_互動帶練系統.html         # 單檔離線＋線上雙棲互動帶練網頁
└── 04_學習單與評量/
    └── <曲名>_八拍口訣與自練檢核單.html # A4 橫式雙面列印（學生自練版＋教師 100 分制 4 向度評量規準版）
```

---

## 二、媒體前處理、剪接合成與 0.5 秒畫格校準管線

1. **優先取得教學原片 MP4（徹底擺脫 YouTube 內嵌封鎖）**：
   - 使用 `yt-dlp`（或接收導師提供之影片）取得相容性最高之 H.264 MP4（建議檔案大小控制在 `50MB` 以內，兼顧 `file://` 本機雙擊離線播放與 GitHub Pages `HTTP 206` 串流快轉）。
   - 確認影片是否為「鏡面版」，一律將後續教材視角與實拍畫面對齊。
2. **兩分鐘精華表演版剪接管線（V5.0 實戰標準）**：
   - 若三班導師共議刪減中間重複段落、縮短進場時間至 2 分鐘以內，在系統暫存目錄安裝 `ffmpeg-static`（避免污染雲端硬碟），利用 `filter_complex` 的 `trim + atrim + concat` 精準拼接前後兩段為連續 MP4，同時匯出操場廣播專用 MP3（`libmp3lame`），並在網頁中提供一鍵下載 MP3 連結。
   - 剪接切點務必以實拍畫格確認「前一段結束姿勢與後一段起始姿勢一致」（例如前奏攤手回正無縫銜接後半段主歌起手）。
3. **0.5 秒畫格組圖巡檢（杜絕動作舉到一半／蹲到一半切斷）**：
   - 定稿切點前，使用 `ffmpeg` 以 `fps=2` 匯出帶時間戳的 Contact Sheet 組圖實看每一處段落與步驟起迄。
   - 嚴禁只靠音樂粗估整秒數硬切：若動作在該秒數仍處於「手舉到一半」、「未落地轉回正面」或「仍低蹲壓膝未起身」，務必延後至完整收手／起身（例如 `9.0s`、`21.5s`、`34.0s`、`96.5s`）再切下一格，並讓代表截圖取自該動作實際高潮畫面（與卡片文字 100% 吻合）。
4. **首學段細分 vs 重複段整併（適性卡片數設計）**：
   - **首次學到的主歌／副歌／結尾段落**：一律拆為 **`4` 格獨立分解卡（①➔②➔③➔④）**，即使原完整版曾將該段視為複習而合併，只要在剪接精華版因刪減前段而成為**首度出現的動作**，仍須還原拆成 `4` 格讓小五生容易跟練。
   - **真正重複或換動密集之 4 八拍過渡橋段／間奏**：整併為 **`2` 張連貫組合卡（每張包含 2 個八拍）**，避免過碎卡拍。
   - 透過 Node HTTP Range 伺服器搭配無頭 Chrome 擷取代表畫格存為 `keyframes_<count>.json`，並直接將第 1 動寫入 `<video poster="...">`。

---

## 三、國小教學設計與鏡像文字鐵律

1. **台灣繁體中文與 108 課綱術語**：全程嚴格使用 `zh-TW`（例如學習單、評量規準、彈性學習課程），嚴禁簡體字與非台灣慣用語。
2. **鏡像左右鎖定（學生本位）**：所有畫面提示、動作口訣、即時字幕皆**直接寫【學生自己的左右手腳】**（螢幕左邊動＝你的左手／左腳；螢幕右邊動＝你的右手／右腳），絕不讓學生二次左右轉換。
3. **極簡放大 2 行分解卡 ＋ 適性保底 ＋ 重複標記**：
   - 每張步驟卡與即時字幕一律濃縮為醒目放大的 **2 行格式：`🎯 動作` ＋ `💡 提醒`**，搭配點擊卡片進入 `0.6x` 單步帶練。
   - **重複段落明確標記**：完整版若中後段重複前段動作，於段落名稱、卡片與學習單標註 **`🔁 同前段重跳複習`**。
   - 每大段提供 **`🌱 慢半拍沒關係（保底動作）`** 提示，照顧動作較慢或易頭暈的同學。
4. **反干擾原則**：**嚴禁「5-6-7-8 黑幕倒數遮罩」與多餘電子滴答聲**，亦**不硬塞無關的賓果九宮格或座號抽籤模組**。
5. **A4 雙面學習單規範**：單頁 HTML 工具列可切換「📄 學生發放版」、「👩‍🏫 教師備課與評量規準版（100 分制、4 向度 Rubrics 矩陣）」或「📑 雙面全印」，嚴禁浮水印、多餘圖標或頁碼，保留班級／座號／姓名欄位與延伸小老師任務。

---

## 四、V5.0 互動播放器與雙棲介面規格

1. **三段式傻瓜帶練按鈕 ＋ 雙層慢速分流 ＋ 全曲連跳**：
   - **🐢 第一步：慢速練這 1 格（`0.6x`）**：專攻單步精準切點與換手換腳細節。
   - **🚶 第二步：慢速連跳這段（`0.75x` 預設）**：保留音樂律動與拍點的教師愛用跟跳速度。
   - **🏃 第三步：原速過關挑戰（`1.0x`）**：播完該段自動停住播放 Web Audio API 過關音效，跳出「前往下一段」鼓勵橫幅。
   - 頂部設全曲導覽列與 **`🏆 全曲連跳（1.0x）`**（`storageKey` 依版次隔離，避免完整版與精華版進度互蓋）。
2. **連續時間軸 ＋ 單步精準切點與進場微緩衝（`playStart` / `playEnd`）**：
   - **資料層 100% 連續無間隙**：`ALL_STEPS` 的 `start` / `end` 從 `0` 秒到曲末總秒數必須完全相接不留缺口，確保整段與全曲亮燈正確切換（全曲連跳結束門檻設於 `總長 - 0.2s`）。
   - **單步模式（`step`）**：`getStepPlaybackBounds(st)` 優先讀取逐格實看校準之 **`playStart` / `playEnd`**，於跨段或轉折步驟酌留 `0.2–0.5s` 進場微緩衝（如前奏過主歌進副歌），並在單步結束處**暫停定格 `350ms`** 後再重播。
   - **整段／挑戰模式（`section` / `challenge`）**：段尾追加 `SEC_POST_BUFFER = 0.25` 秒收尾微緩衝，亮燈追蹤鎖定 `Math.min(t, sec.end - 0.01)` 確保最後一格卡片不提前跳格。
   - 左欄須附 `#overlap-note` 說明橫幅與即時 `#live-buffer-badge` 狀態標籤。
3. **手機／直立平板與遠距無障礙優化**：
   - **`<= 1080px` 置頂凍結 ＋ 醒目即時字幕**：`.sticky-player-wrap` 自動固定 `<video>`、高對比放大雙行膠囊即時字幕（`.live-subtitle` 含 `#live-sub-hand`／`#live-sub-foot`）與播放控制列於頂部（`<= 640px` 限縮影片最大高度 `36vh`）。
   - **免捲動換招**：控制列內建 **`⏮ 上一動 ／ 下一動 ⏭`**（電腦支援鍵盤 `ArrowLeft` / `ArrowRight`、`Space` 播放暫停）。
   - **一鍵放大大字模式**：頂部提供 **`🔍 放大影片／手機平板大字模式`** 切換 `body.zoom-mode`。
   - **無障礙回到頂端鈕**：右下角設 `#btn-back-to-top`（`⬆ 回到頂端`，`scrollY > 180` 或 `:focus-visible` 顯現）。
   - **線上載入保護與字型禁令**：`<video>` 設 `poster` 並監聽 `waiting`／`playing` 顯示「⏳ 影片載入緩衝中…」；嚴格遵循無襯線系統字型，**禁止 `KaiTi`（標楷體）**。
   - **手機觸控與延遲跳轉防呆（V4.03 起內建）**：`button` 與 `.step-card` 設 `touch-action: manipulation`；`<= 640px` 固定 `.live-subtitle` `min-height: 118px` 搭配 `setTextIfChanged` 節流寫入；`seekVideoTo` 遇 `video.readyState < 1` 排入 `state.pendingSeekTime`（早期 `play` 不提前清空）並於 `loadedmetadata`／`loadeddata`／`canplay` 自動跳點，搭配 `650ms` 冷卻、`state.isBuffering` 防重入與原生 `<video>` `play` 邊界校準。
4. **版面識別與署名規範**：
   - 頂部 `<title>` 與 `.brand-title` **保持乾淨不顯示版本號**。
   - 網頁最底部頁尾 `#site-footer` 顯示完整名稱、版本號（如 `Version 5.0 (V5.0)`）與作者署名 **`Made by SENNA`**（若專案另有指定署名依使用者要求調整），並附上直達 A4 學習單的連結。

---

## 五、自動化驗證與 GitHub Pages 安全發布原則

1. **程式化建置 ＋ Node VM 驗證**：產出網頁與學習單時，同步撰寫 Node.js DOM/狀態測試腳本驗證時間軸連續性、截圖完整性、單步與進場緩衝精準邊界、結尾定格機制、`上一動/下一動`、放大模式、回到頂端鈕、手機延遲佇列及 A4 學習單雙版切換。
2. **暫存區乾淨推送 GitHub Pages**：
   - 為避免 Google 雲端硬碟因 `.git` 物件鎖定而同步衝突，**切勿直接在雲端硬碟目錄執行 `git init`**。
   - 一律由發布腳本將專案檔案複製到系統暫存區（`os.tmpdir()`），寫入 `.nojekyll` 後初始化 Git 並透過 `gh` CLI 推送公開儲存庫的 `main` 分支且開啟 GitHub Pages 根目錄服務（`index.html` 自動導向互動系統）。
3. **實測驗收標準**：發布後確認 GitHub Pages 建置成功，並實測確認首頁、互動網頁（含新版代表字串與正確位元組數）、MP3（若有）與學習單皆為 HTTP `200`，且 `.mp4` 支援 `HTTP 206`（`accept-ranges: bytes`）斷點串流播放。
