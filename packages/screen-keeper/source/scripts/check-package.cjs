'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const required = [
  'main.cjs',
  'preload.cjs',
  'lib/core.cjs',
  'src/index.html',
  'src/renderer.js',
  'src/styles.css',
  'assets/icon.ico',
  'PRIVACY.md',
  'KNOWN_LIMITATIONS.md',
  'THIRD_PARTY_NOTICES.md',
  'LICENSE',
];

for (const file of required) {
  assert.ok(fs.existsSync(path.join(root, file)), `缺少文件：${file}`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(packageJson.main, 'main.cjs');
assert.equal(packageJson.build.productName, '屏幕常亮');
assert.match(packageJson.version, /^\d+\.\d+\.\d+-candidate\.\d+$/);
assert.ok(Array.isArray(packageJson.build.files) && packageJson.build.files.length > 0);
assert.ok(!packageJson.build.files.some((entry) => entry.includes('*.*')));

const main = fs.readFileSync(path.join(root, 'main.cjs'), 'utf8');
assert.match(main, /contextIsolation:\s*true/);
assert.match(main, /nodeIntegration:\s*false/);
assert.match(main, /sandbox:\s*true/);
assert.match(main, /requestSingleInstanceLock/);
assert.match(main, /label:\s*'关闭窗口时'/);
assert.match(main, /label:\s*'每次询问'/);

const html = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'src', 'renderer.js'), 'utf8');
const visibleHtml = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ');
assert.doesNotMatch(visibleHtml, /Screen Keeper|Apple|Timer|Start|Stop|Settings/);
assert.doesNotMatch(renderer, /(['"`])(?:Screen Keeper|Apple|Timer|Start|Stop|Settings)\1/);
assert.doesNotMatch(html, /settingsButton|settingsDialog/);

for (const file of ['main.cjs', 'preload.cjs', 'src/index.html', 'src/renderer.js', 'src/styles.css']) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(content, /\b[A-Za-z]:\\/, `${file} 不得包含绝对路径`);
}

console.log(`发布结构检查通过：${required.length} 个必要文件存在。`);
