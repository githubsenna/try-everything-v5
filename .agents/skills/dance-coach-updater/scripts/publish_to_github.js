const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const GH_EXE = fs.existsSync('C:\\Program Files\\GitHub CLI\\gh.exe')
  ? 'C:\\Program Files\\GitHub CLI\\gh.exe'
  : 'gh';
const GIT_EXE = fs.existsSync('C:\\Program Files\\Git\\cmd\\git.exe')
  ? 'C:\\Program Files\\Git\\cmd\\git.exe'
  : 'git';

const candidateRoot = path.resolve(__dirname, '../../../../');
const projectRoot = fs.existsSync(path.join(candidateRoot, '03_影音資源'))
  ? candidateRoot
  : 'I:\\我的雲端硬碟\\_2026-Antigravity\\石門國小_五年級運動會進場舞_TryEverything_V5精華版';

const REPO_NAME = 'try-everything-v5';
const commitMsg = process.argv[2] || 'Initial release V5.0: 石門國小五年級運動會進場舞兩分鐘精華版（0:00-0:16接1:39-3:13，5大段18步）';

function checkGhAuth() {
  try {
    execFileSync(GH_EXE, ['auth', 'status', '-h', 'github.com'], { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function loginGhInteractive() {
  return new Promise((resolve, reject) => {
    console.log('未偵測到有效的 GitHub 登入憑證，正在啟動瀏覽器授權登入...');
    const child = spawn(GH_EXE, ['auth', 'login', '-h', 'github.com', '-p', 'https', '-w', '-c'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: false
    });

    let sentEnter = false;
    let codeLogged = false;
    let buffer = '';

    function handleChunk(chunk) {
      const text = chunk.toString('utf8');
      process.stdout.write(text);
      buffer += text;

      const match = buffer.match(/one-time code:\s*([A-Z0-9]{4}-[A-Z0-9]{4})/i);
      if (match && !codeLogged) {
        codeLogged = true;
        console.log('\n=== GITHUB_DEVICE_CODE: ' + match[1] + ' ===');
      }

      if (!sentEnter && /Press Enter to open/i.test(buffer)) {
        sentEnter = true;
        setTimeout(() => {
          try { child.stdin.write('\n'); } catch (e) {}
        }, 120);
      }

      if (/Do you want to re-authenticate/i.test(text)) {
        try { child.stdin.write('y\n'); } catch (e) {}
      }

      if (/Authenticate Git with your GitHub credentials/i.test(text)) {
        try { child.stdin.write('Y\n'); } catch (e) {}
      }
    }

    child.stdout.on('data', handleChunk);
    child.stderr.on('data', handleChunk);

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('gh auth login exited with code ' + code));
      }
    });
  });
}

async function main() {
  if (!fs.existsSync(projectRoot)) {
    throw new Error('找不到專案目錄：' + projectRoot);
  }

  if (!checkGhAuth()) {
    await loginGhInteractive();
  } else {
    console.log('GitHub CLI 已登入認證。');
  }

  execFileSync(GH_EXE, ['auth', 'setup-git', '-h', 'github.com'], { stdio: 'inherit' });

  const owner = execFileSync(GH_EXE, ['api', 'user', '--jq', '.login'], { encoding: 'utf8' }).trim();
  if (!owner) throw new Error('無法取得已登入之 GitHub 使用者名稱。');
  console.log('已驗證 GitHub 帳號：', owner);

  let gitName = owner;
  let gitEmail = owner + '@users.noreply.github.com';
  try {
    const n = execFileSync(GIT_EXE, ['config', '--global', 'user.name'], { encoding: 'utf8' }).trim();
    const m = execFileSync(GIT_EXE, ['config', '--global', 'user.email'], { encoding: 'utf8' }).trim();
    if (n) gitName = n;
    if (m) gitEmail = m;
  } catch (e) {}

  const stageDir = path.join(os.tmpdir(), 'shimen-g5-try-everything-v5-publish');
  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });

  const items = ['index.html', 'README.md', 'AGENTS.md', '01_課程計畫', '02_教案簡報', '03_影音資源', '04_學習單與評量', '.agents'];
  for (const item of items) {
    const src = path.join(projectRoot, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, path.join(stageDir, item), {
        recursive: true,
        filter: (s) => !/(Thumbs\.db|\.DS_Store|desktop\.ini)$/i.test(path.basename(s))
      });
    }
  }
  fs.writeFileSync(path.join(stageDir, '.nojekyll'), '', 'utf8');

  execFileSync(GIT_EXE, ['init', '-b', 'main'], { cwd: stageDir, stdio: 'inherit' });
  execFileSync(GIT_EXE, ['config', 'user.name', gitName], { cwd: stageDir, stdio: 'inherit' });
  execFileSync(GIT_EXE, ['config', 'user.email', gitEmail], { cwd: stageDir, stdio: 'inherit' });
  execFileSync(GIT_EXE, ['add', '-A'], { cwd: stageDir, stdio: 'inherit' });
  execFileSync(GIT_EXE, ['commit', '-m', commitMsg], { cwd: stageDir, stdio: 'inherit' });

  const fullRepo = owner + '/' + REPO_NAME;
  let repoExists = true;
  try {
    execFileSync(GH_EXE, ['repo', 'view', fullRepo], { stdio: 'pipe' });
  } catch (e) {
    repoExists = false;
  }

  if (!repoExists) {
    console.log('正在建立公開 GitHub 儲存庫：', fullRepo);
    execFileSync(
      GH_EXE,
      ['repo', 'create', fullRepo, '--public', '--description', '石門國小五年級運動會進場舞 Try Everything 兩分鐘精華版 V5.0 互動帶練系統'],
      { stdio: 'inherit' }
    );
  } else {
    console.log('偵測到既有 GitHub 儲存庫：', fullRepo);
  }

  const remoteUrl = 'https://github.com/' + fullRepo + '.git';
  execFileSync(GIT_EXE, ['push', '-u', remoteUrl, 'main', '--force'], { cwd: stageDir, stdio: 'inherit' });

  try {
    execFileSync(
      GH_EXE,
      ['api', '--method', 'POST', 'repos/' + fullRepo + '/pages', '-f', 'source[branch]=main', '-f', 'source[path]=/'],
      { stdio: 'pipe' }
    );
    console.log('已開啟 GitHub Pages（main 分支根目錄）。');
  } catch (e) {
    try {
      execFileSync(
        GH_EXE,
        ['api', '--method', 'PUT', 'repos/' + fullRepo + '/pages', '-f', 'source[branch]=main', '-f', 'source[path]=/'],
        { stdio: 'pipe' }
      );
      console.log('已確認並更新 GitHub Pages 設定（main 分支根目錄）。');
    } catch (e2) {
      console.log('GitHub Pages API 回應：', e2.message);
    }
  }

  let pagesUrl = 'https://' + owner.toLowerCase() + '.github.io/' + REPO_NAME + '/';
  try {
    const u = execFileSync(GH_EXE, ['api', 'repos/' + fullRepo + '/pages', '--jq', '.html_url'], { encoding: 'utf8' }).trim();
    if (u) pagesUrl = u;
  } catch (e) {}

  console.log('=== GITHUB_REPO_URL: https://github.com/' + fullRepo + ' ===');
  console.log('=== GITHUB_PAGES_URL: ' + pagesUrl + ' ===');
}

main().catch((err) => {
  console.error('發布失敗：', err);
  process.exit(1);
});
