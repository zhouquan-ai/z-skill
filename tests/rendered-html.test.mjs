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

test("server-renders the z-skill tool directory", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>z-skill｜AI 工具与可复用工作流<\/title>/i);
  assert.match(html, /Any-to-MD/);
  assert.match(html, /PDF/);
  assert.match(html, /XLSX/);
  assert.match(html, /公开候选/);
  assert.match(html, /\/downloads\/any-to-md-v0\.1\.0-candidate\.zip/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/i);
});

test("server-renders the Any-to-MD detail page", async () => {
  const response = await render("/tools/any-to-md");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Any-to-MD/);
  assert.match(html, /本轮验证状态/);
  assert.match(html, /DOCX/);
  assert.match(html, /PPT \/ PPTX/);
  assert.match(html, /轻量接口本轮失败/);
  assert.match(html, /下载完整候选包/);
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
