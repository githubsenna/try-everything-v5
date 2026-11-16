/**
 * 從 V5.0 兩分鐘精華版原片 Try_Everything_V5_兩分鐘精華版原片.mp4 自動擷取 18 個分解動作之專屬截圖
 * 使用本機 HTTP Range Server + 無頭 Chrome Canvas 裁切聚焦舞者全身
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCRATCH_DIR = __dirname;
const PROJECT_MP4 = path.resolve(SCRATCH_DIR, '../../../../03_影音資源/Try_Everything_V5_兩分鐘精華版原片.mp4');
const MP4_PATH = fs.existsSync(PROJECT_MP4) ? PROJECT_MP4 : path.join(SCRATCH_DIR, 'Try_Everything_V5_兩分鐘精華版原片.mp4');
const OUT_JSON = path.join(SCRATCH_DIR, 'keyframes_18.json');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// V5.0 兩分鐘精華版（5 大段落 × 18 個校準分解小動作，代表截圖全面對齊動作高潮與切點）
const SAMPLES = [
  { id: '1-1', sec: 2.5 }, { id: '1-2', sec: 6.0 }, { id: '1-3', sec: 11.5 }, { id: '1-4', sec: 15.0 },
  { id: '2-1', sec: 18.5 }, { id: '2-2', sec: 23.0 }, { id: '2-3', sec: 27.0 }, { id: '2-4', sec: 32.0 },
  { id: '3-1', sec: 36.0 }, { id: '3-2', sec: 43.5 }, { id: '3-3', sec: 55.0 }, { id: '3-4', sec: 61.5 },
  { id: '4-1', sec: 68.5 }, { id: '4-2', sec: 78.5 },
  { id: '5-1', sec: 90.5 }, { id: '5-2', sec: 99.0 }, { id: '5-3', sec: 105.8 }, { id: '5-4', sec: 108.5 }
];

if (!fs.existsSync(MP4_PATH)) {
  console.error('找不到影片檔案:', MP4_PATH);
  process.exit(1);
}

const mp4Stat = fs.statSync(MP4_PATH);

const extractorHtml = `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head><meta charset="utf-8"><title>Frame Extractor V5.0</title></head>
<body>
<video id="v" src="/video.mp4" muted playsinline preload="auto" crossorigin="anonymous"></video>
<canvas id="c" width="420" height="260"></canvas>
<script>
const SAMPLES = ${JSON.stringify(SAMPLES)};
const v = document.getElementById('v');
const c = document.getElementById('c');
const ctx = c.getContext('2d');

function waitSeek(sec) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Seek timeout at ' + sec)), 8000);
    const onSeeked = () => {
      clearTimeout(timer);
      v.removeEventListener('seeked', onSeeked);
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    };
    v.addEventListener('seeked', onSeeked);
    v.currentTime = sec;
  });
}

async function run() {
  try {
    if (v.readyState < 1) {
      await new Promise((res, rej) => {
        const t = setTimeout(() => rej(new Error('Metadata timeout')), 10000);
        v.addEventListener('loadedmetadata', () => { clearTimeout(t); res(); }, { once: true });
        v.addEventListener('error', () => { clearTimeout(t); rej(new Error('Video load error')); }, { once: true });
      });
    }
    const vw = v.videoWidth;
    const vh = v.videoHeight;
    const duration = v.duration;
    const frames = {};

    for (const item of SAMPLES) {
      const targetSec = Math.min(Math.max(0.1, item.sec), Math.max(0.1, duration - 0.2));
      await waitSeek(targetSec);
      const sx = vw * 0.12;
      const sy = vh * 0.06;
      const sw = vw * 0.76;
      const sh = vh * 0.88;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
      frames[item.id] = c.toDataURL('image/jpeg', 0.82);
    }

    await fetch('/done', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meta: { vw, vh, duration }, frames })
    });
  } catch (err) {
    await fetch('/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: err.message })
    });
  }
}

run();
</script>
</body>
</html>`;

let chromeProc = null;
const userDataDir = path.join(SCRATCH_DIR, 'chrome_extract_tmp');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(extractorHtml);
    return;
  }

  if (req.url === '/video.mp4' && req.method === 'GET') {
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : mp4Stat.size - 1;
      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${mp4Stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(MP4_PATH, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': mp4Stat.size,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(MP4_PATH).pipe(res);
    }
    return;
  }

  if (req.url === '/done' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        fs.writeFileSync(OUT_JSON, JSON.stringify(payload.frames), 'utf8');

        console.log('Video Meta:', payload.meta);
        console.log('Extracted frames count:', Object.keys(payload.frames).length);
        console.log('Saved keyframes JSON:', OUT_JSON, 'Size:', fs.statSync(OUT_JSON).size, 'bytes');

        res.writeHead(200);
        res.end('OK');
        cleanupAndExit(0);
      } catch (e) {
        console.error('Failed to process /done:', e);
        res.writeHead(500);
        res.end('ERR');
        cleanupAndExit(1);
      }
    });
    return;
  }

  if (req.url === '/error' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      console.error('Browser extraction error:', body);
      res.writeHead(200);
      res.end('ACK');
      cleanupAndExit(1);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

function cleanupAndExit(code) {
  if (chromeProc && !chromeProc.killed) {
    try { chromeProc.kill(); } catch (e) {}
  }
  server.close(() => {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
    process.exit(code);
  });
  setTimeout(() => process.exit(code), 1000).unref();
}

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  const targetUrl = `http://127.0.0.1:${port}/`;
  console.log('Extractor server listening on', targetUrl);

  chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    targetUrl
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  chromeProc.stderr.on('data', (d) => console.error('[chrome stderr]', d.toString()));
  chromeProc.on('exit', (c) => {
    if (c !== 0 && c !== null) {
      console.log('Chrome exited early with code:', c);
      cleanupAndExit(1);
    }
  });
});

setTimeout(() => {
  console.error('Extraction timed out after 45s');
  cleanupAndExit(1);
}, 45000).unref();
