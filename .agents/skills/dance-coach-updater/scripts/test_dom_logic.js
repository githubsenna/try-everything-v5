const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '../../../../');
const hasProject = fs.existsSync(path.join(projectRoot, '03_影音資源'));

const file1 = hasProject
  ? path.join(projectRoot, '03_影音資源/Try_Everything_五年級運動會進場舞_互動帶練系統.html')
  : path.join(__dirname, 'Try_Everything_五年級運動會進場舞_互動帶練系統.html');
const file2 = hasProject
  ? path.join(projectRoot, '04_學習單與評量/Try_Everything_運動會進場舞_八拍口訣與自練檢核單.html')
  : null;

const html1 = fs.readFileSync(file1, 'utf8');

if (html1.includes('countdown-overlay')) {
  throw new Error('Found prohibited countdown-overlay in V5.0 HTML!');
}
if (/KaiTi|標楷體/i.test(html1)) {
  throw new Error('Found prohibited KaiTi font reference in V5.0 HTML!');
}
if (!html1.includes('src="Try_Everything_V5_兩分鐘精華版原片.mp4"')) {
  throw new Error('Missing V5.0 spliced MP4 video source in HTML!');
}
const titleMatch = html1.match(/<title>([\s\S]*?)<\/title>/);
const brandMatch = html1.match(/<h1[^>]*class="brand-title"[^>]*>([\s\S]*?)<\/h1>/);
if (!titleMatch || /V3|V4|V5/i.test(titleMatch[1]) || !brandMatch || /V3|V4|V5/i.test(brandMatch[1])) {
  throw new Error('Top title or brand heading must not contain version number V3/V4/V5!');
}
for (const reqToken of [
  'id="overlap-note"',
  'id="btn-zoom-mode"',
  'id="live-buffer-badge"',
  'id="live-sub-hand"',
  'id="live-sub-foot"',
  'id="site-footer"',
  'id="footer-version"',
  'Version 5.0 (V5.0)',
  'id="footer-author"',
  'Made by SENNA',
  'id="btn-prev-step"',
  'id="btn-next-step"',
  'id="btn-back-to-top"',
  'aria-label="回到網頁最頂端"',
  'id="video-loading-pill"',
  'poster="data:image/jpeg;base64,'
]) {
  if (!html1.includes(reqToken)) {
    throw new Error('Missing required V5.0 element/token: ' + reqToken);
  }
}

function createMockDOM(idList) {
  const elements = new Map();
  const docListeners = {};

  function makeEl(id, tag = 'DIV') {
    const classes = new Set();
    const attrs = {};
    const listeners = {};
    return {
      id,
      tagName: tag,
      _html: '',
      textContent: '',
      src: '',
      currentTime: 0,
      playbackRate: 1,
      readyState: 4,
      paused: true,
      seeking: false,
      style: {},
      classList: {
        add: (...cs) => cs.forEach((c) => classes.add(c)),
        remove: (...cs) => cs.forEach((c) => classes.delete(c)),
        toggle: (c, force) => {
          const has = classes.has(c);
          const next = force === undefined ? !has : Boolean(force);
          if (next) classes.add(c); else classes.delete(c);
          return next;
        },
        contains: (c) => classes.has(c)
      },
      set innerHTML(v) { this._html = v; },
      get innerHTML() { return this._html; },
      getAttribute: (k) => attrs[k] ?? null,
      setAttribute: (k, v) => { attrs[k] = String(v); },
      addEventListener: (ev, fn) => { (listeners[ev] ||= []).push(fn); },
      dispatchEvent: function (ev) { (listeners[ev] || []).forEach((fn) => fn({ currentTarget: this, target: this })); },
      click: function () { (listeners.click || []).forEach((fn) => fn({ currentTarget: this, target: this, stopPropagation() {} })); },
      play: function () { this.paused = false; return Promise.resolve(); },
      pause: function () { this.paused = true; },
      load: function () {},
      closest: () => null,
      _attrs: attrs,
      _classes: classes
    };
  }

  idList.forEach((id) => elements.set(id, makeEl(id)));

  const modeBtns = ['step', 'section', 'challenge'].map((md) => {
    const b = makeEl('', 'BUTTON');
    b.setAttribute('data-mode', md);
    if (md === 'section') b.classList.add('active');
    return b;
  });

  const speedBtns = [0.6, 0.75, 1].map((sp) => {
    const b = makeEl('', 'BUTTON');
    b.setAttribute('data-speed', sp);
    if (sp === 0.75) b.classList.add('active');
    return b;
  });

  const sheetModeBtns = ['student', 'teacher', 'both'].map((md) => {
    const b = makeEl('', 'BUTTON');
    b.setAttribute('data-mode', md);
    if (md === 'student') b.classList.add('active');
    return b;
  });

  const document = {
    head: { appendChild: () => {} },
    body: makeEl('body', 'BODY'),
    documentElement: { scrollTop: 0 },
    getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, makeEl(id));
      return elements.get(id);
    },
    createElement: (tag) => makeEl('', tag.toUpperCase()),
    querySelectorAll: (sel) => {
      if (sel === '.mode-btn') return modeBtns;
      if (sel === '.speed-btn') return speedBtns;
      if (sel === '.tool-btn[data-mode]') return sheetModeBtns;
      return [];
    },
    addEventListener: (ev, fn) => { (docListeners[ev] ||= []).push(fn); }
  };

  return { elements, document, modeBtns, speedBtns, sheetModeBtns };
}

const ids1 = [
  'dance-video', 'section-nav', 'done-count', 'sec-heading', 'sec-meta-line',
  'btn-mark-section', 'steps-grid-2x2', 'easy-tip-text', 'live-sub-tag',
  'live-sub-time', 'live-buffer-badge', 'live-sub-hand', 'live-sub-foot',
  'btn-zoom-mode', 'btn-prev-step', 'btn-next-step', 'video-loading-pill',
  'btn-back-to-top', 'challenge-banner', 'challenge-title', 'btn-challenge-next',
  'btn-challenge-retry', 'video-missing-alert', 'file-video-input',
  'btn-toggle-play', 'btn-replay', 'btn-reset-progress',
  'btn-pick-video-alert', 'btn-pick-video-small'
];
const mock1 = createMockDOM(ids1);
const script1 = html1.match(/<script>([\s\S]*?)<\/script>/)[1];

let capturedInterval = null;
const mockWindow = {
  location: { protocol: 'file:', origin: 'null' },
  scrollY: 0,
  _scrollListeners: [],
  _scrollToCalls: [],
  addEventListener: (ev, fn) => {
    if (ev === 'scroll') mockWindow._scrollListeners.push(fn);
  },
  scrollTo: (arg) => {
    mockWindow._scrollToCalls.push(arg);
    mockWindow.scrollY = (arg && typeof arg === 'object') ? (arg.top || 0) : Number(arg || 0);
  }
};
const ctx1 = vm.createContext({
  window: mockWindow,
  document: mock1.document,
  localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = v; }, removeItem(k) { delete this._m[k]; } },
  URL: { createObjectURL: () => 'blob:mock' },
  Promise, Date,
  setInterval: (fn) => { capturedInterval = fn; return 1; },
  clearInterval: () => {},
  setTimeout, clearTimeout,
  console, Number, String, Array, Set, Math, JSON, Boolean
});

vm.runInContext(script1, ctx1);

// 檢查資料完整性（18 張截圖、5 段 × 18 步、0 到 110 秒無縫連續時間軸）
const keyframeCount = vm.runInContext('Object.keys(KEYFRAMES).length', ctx1);
const stepTotal = vm.runInContext('ALL_STEPS.length', ctx1);
const sectionTotal = vm.runInContext('DANCE_SECTIONS.length', ctx1);
console.log('V5.0 Data Check -> Keyframes:', keyframeCount, 'Sections:', sectionTotal, 'Steps:', stepTotal);
if (keyframeCount !== 18 || sectionTotal !== 5 || stepTotal !== 18) {
  throw new Error('V5.0 data completeness check failed!');
}

const timelineCheck = vm.runInContext(`(() => {
  if (ALL_STEPS[0].start !== 0 || ALL_STEPS[ALL_STEPS.length - 1].end !== 110) return 'Bad start/end';
  for (let i = 0; i < ALL_STEPS.length; i++) {
    const s = ALL_STEPS[i];
    if (!KEYFRAMES[s.id] || !s.hand || !s.foot || !s.tip || !s.tag) return 'Missing fields on ' + s.id;
    if (i < ALL_STEPS.length - 1 && s.end !== ALL_STEPS[i + 1].start) return 'Gap at ' + s.id;
  }
  return 'OK';
})()`, ctx1);
if (timelineCheck !== 'OK') throw new Error('Timeline check failed: ' + timelineCheck);

// 檢查精準切點：1-1 (0–5s)、1-2 (4.8–9s)、2-1 (16–21.5s)、2-2 (21.5–25.5s)、2-4 (29.5–34s)、3-1 (33.5–42.2s)、5-1 (88.2–96.5s)、5-4 (106.8–110s)
const bounds11 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '1-1'))", ctx1);
const bounds12 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '1-2'))", ctx1);
const bounds21 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '2-1'))", ctx1);
const bounds22 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '2-2'))", ctx1);
const bounds24 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '2-4'))", ctx1);
const bounds31 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '3-1'))", ctx1);
const bounds51 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '5-1'))", ctx1);
const bounds54 = vm.runInContext("getStepPlaybackBounds(ALL_STEPS.find(s => s.id === '5-4'))", ctx1);
const secBounds2 = vm.runInContext('getSectionPlaybackBounds(DANCE_SECTIONS[1])', ctx1);
if (bounds11.start !== 0 || bounds11.end !== 5) {
  throw new Error('Step 1-1 bounds mismatch: ' + JSON.stringify(bounds11));
}
if (bounds12.start !== 4.8 || bounds12.end !== 9) {
  throw new Error('Step 1-2 bounds mismatch: ' + JSON.stringify(bounds12));
}
if (bounds21.start !== 16 || bounds21.end !== 21.5 || bounds22.start !== 21.5 || bounds22.end !== 25.5 || bounds24.start !== 29.5 || bounds24.end !== 34 || secBounds2.end !== 34.25) {
  throw new Error('Section 2 bounds mismatch');
}
if (bounds31.start !== 33.5 || bounds31.end !== 42.2) {
  throw new Error('Step 3-1 overlap bounds mismatch: ' + JSON.stringify(bounds31));
}
if (bounds51.start !== 88.2 || bounds51.end !== 96.5 || bounds54.start !== 106.8 || bounds54.end !== 110) {
  throw new Error('Section 5 bounds mismatch');
}
console.log('V5.0 Precision Bounds Check -> 1-2:', bounds12.start + 's-' + bounds12.end + 's | 2-1:', bounds21.start + 's-' + bounds21.end + 's | 2-4:', bounds24.start + 's-' + bounds24.end + 's | 5-4:', bounds54.start + 's-' + bounds54.end + 's');

// 檢查初始 DOM 渲染（5 個分段按鈕 + 1 個全曲連跳按鈕 = 6）
const navHtml = mock1.elements.get('section-nav').innerHTML;
const navBtnCount = (navHtml.match(/data-sec-id="/g) || []).length;
const gridHtml1 = mock1.elements.get('steps-grid-2x2').innerHTML;
const cardCount1 = (gridHtml1.match(/data-step-id="/g) || []).length;
const imgCount1 = (gridHtml1.match(/src="data:image\/jpeg;base64,/g) || []).length;
console.log('V5.0 DOM Check -> Nav buttons:', navBtnCount, 'Cards in Sec 1:', cardCount1, 'Card images:', imgCount1);
if (navBtnCount !== 6 || cardCount1 !== 4 || imgCount1 !== 4) {
  throw new Error('V5.0 initial DOM check failed!');
}

// 測試第 2 段主歌 2-1 與上一動／下一動按鈕
const videoEl = mock1.elements.get('dance-video');
ctx1.selectSingleStep('2-1', true);
if (
  vm.runInContext('state.practiceMode', ctx1) !== 'step' ||
  vm.runInContext('state.playbackRate', ctx1) !== 0.6 ||
  videoEl.currentTime !== 16
) {
  throw new Error('V5.0 Step 2-1 check failed!');
}
mock1.elements.get('btn-next-step').click();
if (vm.runInContext('state.activeStepId', ctx1) !== '2-2' || videoEl.currentTime !== 21.5) {
  throw new Error('V5.0 btn-next-step check failed! Got ' + videoEl.currentTime);
}
mock1.elements.get('btn-prev-step').click();
if (vm.runInContext('state.activeStepId', ctx1) !== '2-1' || videoEl.currentTime !== 16) {
  throw new Error('V5.0 btn-prev-step check failed!');
}

// 測試第 4 段橋段 2 大組合（4-1、4-2）與第 5 段結尾左跨（5-1）與微笑定格（5-4）
ctx1.selectSection(4, false);
const sec4CardsHtml = mock1.elements.get('steps-grid-2x2').innerHTML;
if (!sec4CardsHtml.includes('data-step-id="4-1"') || !sec4CardsHtml.includes('data-step-id="4-2"') || sec4CardsHtml.includes('data-step-id="4-3"')) {
  throw new Error('V5.0 Section 4 bridge 2-card check failed!');
}

ctx1.selectSection(5, false);
const sec5CardsHtml = mock1.elements.get('steps-grid-2x2').innerHTML;
if (!mock1.elements.get('sec-heading').textContent.includes('第 5 段：結尾') || !sec5CardsHtml.includes('左跨')) {
  throw new Error('V5.0 Section 5 switch or 5-1 left-lunge label check failed!');
}

ctx1.selectSingleStep('5-4', true);
if (
  vm.runInContext('state.practiceMode', ctx1) !== 'step' ||
  mock1.elements.get('live-sub-tag').textContent !== '動作 ④【左手指前微笑定格】' ||
  videoEl.currentTime !== 106.8
) {
  throw new Error('V5.0 Step 5-4 click behavior failed! currentTime=' + videoEl.currentTime);
}

// 測試手機端 readyState === 0 延遲跳轉佇列（4-2 playStart 為 74.8s）
videoEl.readyState = 0;
videoEl.currentTime = 0;
videoEl.paused = true;
ctx1.selectSingleStep('4-2', true);
if (vm.runInContext('state.pendingSeekTime', ctx1) !== 74.8) {
  throw new Error('V5.0 mobile deferred seek queue failed! pendingSeekTime=' + vm.runInContext('state.pendingSeekTime', ctx1));
}
videoEl.currentTime = 0;
videoEl.dispatchEvent('play');
if (vm.runInContext('state.pendingSeekTime', ctx1) !== 74.8) {
  throw new Error('V5.0 early play prematurely cleared pendingSeekTime!');
}
videoEl.readyState = 1;
videoEl.dispatchEvent('loadedmetadata');
if (videoEl.currentTime !== 74.8 || vm.runInContext('state.pendingSeekTime', ctx1) !== null) {
  throw new Error('V5.0 loadedmetadata failed to flush pendingSeekTime!');
}
videoEl.readyState = 4;

// 驗證根目錄 index.html 與 V5.0 學習單
if (hasProject) {
  const indexHtmlPath = path.join(projectRoot, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('Missing GitHub Pages root entry index.html!');
  }
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  if (!indexHtml.includes('Version 5.0 (V5.0)') || !indexHtml.includes('Made by SENNA') || !indexHtml.includes('03_影音資源/Try_Everything_五年級運動會進場舞_互動帶練系統.html')) {
    throw new Error('Root index.html missing expected V5.0 version, author credit or target link!');
  }
  console.log('Root index.html Check -> OK');
}

if (file2 && fs.existsSync(file2)) {
  const html2 = fs.readFileSync(file2, 'utf8');
  if (!html2.includes('0:00–1:50') || !html2.includes('/ 5 段')) {
    throw new Error('Worksheet V5.0 duration/5-section check failed!');
  }
  const mock2 = createMockDOM(['sheet-student', 'sheet-teacher', 'btn-print']);
  mock2.elements.get('sheet-teacher').classList.add('hidden');
  const script2 = html2.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ctx2 = vm.createContext({
    window: { print: () => {} },
    document: mock2.document
  });
  vm.runInContext(script2, ctx2);

  mock2.sheetModeBtns[1].click();
  if (!mock2.elements.get('sheet-student').classList.contains('hidden') || mock2.elements.get('sheet-teacher').classList.contains('hidden')) {
    throw new Error('Worksheet teacher mode switch failed');
  }
  console.log('Worksheet Check -> OK');
}

console.log('ALL V5.0 VERIFICATION CHECKS PASSED!');
