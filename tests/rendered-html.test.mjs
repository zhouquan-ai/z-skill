import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

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

  const html = await response.text();
  assert.match(html, /<title>z-skill｜AI 工具与可复用工作流<\/title>/i);
  assert.match(html, /把\s*<span>AI 工具<\/span>/);
  assert.match(html, /Any-to-MD/);
  assert.match(html, /公开候选/);
  assert.match(html, /周全设计、整理并验证的 AI 工具发布站/);
  assert.match(html, /搜索工具名称或用途/);
  assert.match(html, />搜索工具</);
  assert.match(html, /发布少一点，说明完整一点/);
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
  assert.match(html, /知识管理 · 文件处理/);
  assert.match(html, /最近更新/);
  assert.match(html, /\/downloads\/any-to-md-v0\.1\.0-candidate\.zip/);
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
  assert.match(html, /raw\.githubusercontent\.com\/zzzq8848-ai\/z-skill/);
  assert.match(html, /隐私提示/);
  assert.match(html, /下载候选版 ZIP/);
  assert.match(html, /不能替代原文件、签章、公式、批注或修订记录/);
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
  assert.match(html, /当前仅公开 Any-to-MD v0\.1\.0-candidate/);
});

test("keeps the mobile hero accent separate from the search panel", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /\.hero-statement::before\s*\{/);
  assert.doesNotMatch(css, /\.hero-copy::before\s*\{/);
  assert.match(css, /\.hero-search:focus-within\s*\{/);
  assert.match(css, /\.catalog-search:focus-within\s*\{/);
});

test("ships a real candidate download without starter dependencies", async () => {
  const archive = new URL(
    "../public/downloads/any-to-md-v0.1.0-candidate.zip",
    import.meta.url,
  );
  const packageJsonUrl = new URL("../package.json", import.meta.url);

  await access(archive);
  const archiveStat = await stat(archive);
  assert.ok(archiveStat.size > 100_000);

  const packageJson = await readFile(packageJsonUrl, "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
});
