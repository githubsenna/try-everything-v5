/**
 * 將 V4.04 教學原片剪接合成為 V5.0 兩分鐘精華版教學原片（0:00–0:16 ＋ 1:39–3:13，共 110.0 秒）
 * 並同步匯出可於操場廣播播放之 MP3 進場音樂檔。
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ffmpegPath = require(path.join(os.tmpdir(), 'v5-ffmpeg-tool', 'node_modules', 'ffmpeg-static'));

const V5_ROOT = path.resolve(__dirname, '../../../../');
const SRC_MP4 = 'I:\\我的雲端硬碟\\_2026-Antigravity\\石門國小_五年級運動會進場舞_TryEverything\\03_影音資源\\Try_Everything_鏡面教學原片.mp4';
const OUT_MP4 = path.join(V5_ROOT, '03_影音資源', 'Try_Everything_V5_兩分鐘精華版原片.mp4');
const OUT_MP3 = path.join(V5_ROOT, '03_影音資源', 'Try_Everything_V5_兩分鐘進場音樂.mp3');

if (!fs.existsSync(SRC_MP4)) {
  console.error('找不到來源教學影片:', SRC_MP4);
  process.exit(1);
}
if (!fs.existsSync(ffmpegPath)) {
  console.error('找不到 ffmpeg 執行檔:', ffmpegPath);
  process.exit(1);
}

console.log('使用 ffmpeg:', ffmpegPath);
console.log('正在剪接合成 V5.0 兩分鐘精華版原片 (0:00-0:16 + 1:39-3:13)...');

const filterComplex = [
  '[0:v]trim=start=0:end=16,setpts=PTS-STARTPTS[v0]',
  '[0:a]atrim=start=0:end=16,asetpts=PTS-STARTPTS[a0]',
  '[0:v]trim=start=99:end=193,setpts=PTS-STARTPTS[v1]',
  '[0:a]atrim=start=99:end=193,asetpts=PTS-STARTPTS[a1]',
  '[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]'
].join(';');

execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i', SRC_MP4,
    '-filter_complex', filterComplex,
    '-map', '[v]',
    '-map', '[a]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    OUT_MP4
  ],
  { stdio: 'inherit' }
);

console.log('正在匯出 V5.0 兩分鐘進場廣播音樂 MP3...');
execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i', OUT_MP4,
    '-vn',
    '-c:a', 'libmp3lame',
    '-q:a', '2',
    OUT_MP3
  ],
  { stdio: 'inherit' }
);

console.log('V5.0 精華版原片:', OUT_MP4, 'Size:', fs.statSync(OUT_MP4).size, 'bytes');
console.log('V5.0 廣播音檔 MP3:', OUT_MP3, 'Size:', fs.statSync(OUT_MP3).size, 'bytes');
