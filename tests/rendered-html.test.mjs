import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { buildInstallPrompt, getIncludedIn, getVerifiedFormats, tools } from "../app/tool-data.ts";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the z-skill brand homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("permissions-policy"), "camera=(), microphone=(), geolocation=()");
  assert.equal(response.headers.get("x-frame-options"), "DENY");

  const html = await response.text();
  assert.match(html, /<title>z-skill｜AI 工具与可复用工作流<\/title>/i);
  assert.match(html, /把\s*<span>AI 工具<\/span>/);
  assert.match(html, /Any-to-MD/);
  assert.match(html, /class="tag verified">已验证/);
  assert.match(html, /周全设计、整理并验证的 AI 工具发布站/);
  assert.match(html, /搜索工具名称或用途/);
  assert.match(html, />搜索工具</);
  assert.match(html, /当前公开[\s\S]{0,24}3[\s\S]{0,24}项/);
  assert.match(html, /发布少一点，说明完整一点/);
  assert.match(html, /href="#main-content"[^>]*>跳到主要内容</);
  assert.match(html, /href="\/"[^>]*aria-current="page"/);
  assert.doesNotMatch(html, /候选版如实标注/);
  assert.doesNotMatch(html, /搜索工具名称、用途或已验证格式/);
  assert.doesNotMatch(html, /下载量|用户数|排行榜|评分/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/i);
});

test("server-renders the searchable tool directory", async () => {
  const response = await render("/tools");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /全部工具/);
  assert.match(html, /Any-to-MD/);
  assert.match(html, /Web Content Reader/);
  assert.match(html, /Weixin Article Reader/);
  assert.match(html, /知识管理 · 文件处理/);
  assert.match(html, /信息获取 · 网页阅读/);
  assert.match(html, /信息获取 · 微信公众号/);
  assert.match(html, /组合包/);
  assert.match(html, /独立包/);
  assert.match(html, /公开候选/);
  assert.match(html, /最近更新/);
  assert.match(html, /\/downloads\/any-to-md-v0\.1\.0\.zip/);
  assert.match(html, /\/downloads\/web-content-reader-v0\.2\.0-candidate\.1\.zip/);
  assert.match(html, /\/downloads\/weixin-article-reader-v0\.1\.0-candidate\.1\.zip/);
});

test("server-renders the Any-to-MD detail page", async () => {
  const response = await render("/tools/any-to-md");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Any-to-MD/);
  assert.match(html, /当前测试状态/);
  assert.match(html, /已知限制/);
  assert.match(html, /DOCX/);
  assert.match(html, /PPT \/ PPTX/);
  assert.match(html, /轻量接口本轮失败/);
  assert.match(html, /复制给 Agent 的安装 Prompt/);
  assert.match(html, /包含下载地址、安装步骤和隐私提示/);
  assert.match(html, /raw\.githubusercontent\.com\/zzzq8848-ai\/z-skill/);
  assert.match(html, /隐私提示/);
  assert.match(html, /下载 ZIP/);
  assert.match(html, /不能替代原文件、签章、公式、批注或修订记录/);
  assert.match(html, /<title>Any-to-MD｜z-skill<\/title>/i);
  assert.match(html, /aria-label="本页内容"/);
  assert.match(html, /href="#install"/);
  assert.match(html, /class="failed">轻量接口本轮失败/);
  assert.match(html, new RegExp(tools[0].download.sha256));
  assert.match(html, /验证环境/);
  assert.match(html, /<dt>验证环境<\/dt><dd>Codex<\/dd>/);
  assert.doesNotMatch(html, /Claude|Codex CLI|宿主 CLI/);
  assert.doesNotMatch(html, /失败回报要求|目标 Agent 认可的 skills 目录/);
});

test("server-renders the Web Content Reader Workflow and component links", async () => {
  const response = await render("/tools/web-content-reader");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Web Content Reader｜z-skill<\/title>/i);
  assert.match(html, /Workflow/);
  assert.match(html, /组合包/);
  assert.match(html, /公开候选/);
  assert.match(html, /组成与关系/);
  assert.match(html, /href="\/tools\/weixin-article-reader"/);
  assert.match(html, /Generic Web Reader/);
  assert.match(html, /内部组件/);
  assert.match(html, /运行依赖/);
  assert.match(html, /权威候选包地址/);
  assert.match(html, /下载候选版 Workflow ZIP/);
  assert.match(html, new RegExp(tools[1].download.sha256));
});

test("server-renders the standalone Weixin Skill and reverse relationship", async () => {
  const response = await render("/tools/weixin-article-reader");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>Weixin Article Reader｜z-skill<\/title>/i);
  assert.match(html, /Skill/);
  assert.match(html, /独立包/);
  assert.match(html, /也包含在/);
  assert.match(html, /href="\/tools\/web-content-reader"/);
  assert.match(html, /OpenCLI主路径/);
  assert.match(html, /下载候选版 Skill ZIP/);
  assert.match(html, new RegExp(tools[2].download.sha256));
});

test("returns 404 for an unpublished tool slug", async () => {
  const response = await render("/tools/not-published");
  assert.equal(response.status, 404);

  const html = await response.text();
  assert.match(html, /这个工具页面还不存在/);
  assert.match(html, /查看全部工具/);
  assert.match(html, /z-skill 首页/);
});

test("server-renders the About page and channel boundaries", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /收录与验证原则/);
  assert.match(html, /收录标准/);
  assert.match(html, /公众号/);
  assert.match(html, /GitHub/);
  assert.match(html, /不做文章站、社区、投稿平台或排行榜/);
  assert.match(html, /当前仅公开/);
  assert.match(html, /Any-to-MD v0\.1\.0/);
  assert.match(html, /Web Content Reader v0\.2\.0-candidate\.1/);
  assert.match(html, /Weixin Article Reader v0\.1\.0-candidate\.1/);
  assert.doesNotMatch(html, /Claude/);
});

test("keeps the mobile hero accent separate from the search panel", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const searchComponent = await readFile(new URL("../app/HeroSearch.tsx", import.meta.url), "utf8");
  const catalogComponent = await readFile(new URL("../app/ToolCatalog.tsx", import.meta.url), "utf8");

  assert.match(css, /\.hero-statement::before\s*\{/);
  assert.doesNotMatch(css, /\.hero-copy::before\s*\{/);
  assert.match(css, /\.hero-search:focus-within\s*\{/);
  assert.match(css, /\.catalog-search:focus-within\s*\{/);
  assert.match(css, /box-shadow: 0 0 0 5px var\(--blue-700\)/);
  assert.doesNotMatch(css, /rgb\(49 87 213 \/ 22%\)/);
  assert.match(searchComponent, /event\.key !== "Enter"/);
  assert.match(searchComponent, /onKeyDown=\{submitWithEnter\}/);
  assert.match(catalogComponent, /router\.replace\("\/tools"\)/);
});

test("derives release metadata and install prompt from one tool record", () => {
  const tool = tools[0];
  const prompt = buildInstallPrompt(tool);

  assert.equal(tools.filter((item) => item.featured).length, 1);
  assert.equal(tool.status, "已验证");
  assert.equal(tool.statusTone, "verified");
  assert.equal(tool.version, "v0.1.0");
  assert.deepEqual(tool.environments, ["Codex"]);
  assert.equal(tool.packageMode, "Standalone");
  assert.deepEqual(getVerifiedFormats(tool), ["PDF", "XLSX", "PNG", "Markdown"]);
  assert.match(tool.download.path, new RegExp(`${tool.slug}-${tool.version}\\.zip$`));
  assert.match(prompt, new RegExp(tool.version));
  assert.ok(prompt.includes(tool.download.sourceUrl));
  assert.ok(prompt.includes(tool.install.fallback));
  assert.deepEqual(getIncludedIn("weixin-article-reader").map((item) => item.slug), ["web-content-reader"]);
});

test("ships all public downloads without starter dependencies", async () => {
  const packageJsonUrl = new URL("../package.json", import.meta.url);

  for (const tool of tools) {
    const archive = new URL(`../public${tool.download.path}`, import.meta.url);
    await access(archive);
    const archiveStat = await stat(archive);
    assert.ok(archiveStat.size > 10_000, tool.slug);
  }

  const packageJson = await readFile(packageJsonUrl, "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /drizzle/);
  assert.match(packageJson, /"node": ">=22\.15\.0"/);
  assert.match(packageJson, /"build": "npm run validate:release && vinext build"/);
  assert.match(packageJson, /"start": "wrangler dev --config dist\/server\/wrangler\.json"/);
  assert.match(packageJson, /"validate:release": "node --experimental-strip-types scripts\/validate-release\.mjs"/);
  assert.match(packageJson, /"test:web-reader": "node --test tests\/web-content-reader-release\.test\.mjs"/);
  assert.match(packageJson, /"test": "npm run test:web-reader && npm run build && node --experimental-strip-types --test tests\/rendered-html\.test\.mjs"/);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
  await assert.rejects(access(new URL("../db/", import.meta.url)));
  await assert.rejects(access(new URL("../examples/d1/", import.meta.url)));
});

test("ships security and immutable download headers", async () => {
  const sourceHeaders = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  const builtHeaders = await readFile(new URL("../dist/client/_headers", import.meta.url), "utf8");

  for (const header of [
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy: camera=(), microphone=(), geolocation=()",
    "X-Frame-Options: DENY",
    "Content-Disposition: attachment",
  ]) {
    assert.match(sourceHeaders, new RegExp(header.replace(/[()]/g, "\\$&")));
    assert.match(builtHeaders, new RegExp(header.replace(/[()]/g, "\\$&")));
  }
  assert.match(builtHeaders, /\/downloads\/\*/);
  assert.match(builtHeaders, /max-age=31536000, immutable/);
});
