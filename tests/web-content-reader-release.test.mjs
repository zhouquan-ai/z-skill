import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildReleases,
  crc32,
} from "../scripts/build-web-content-reader-releases.mjs";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(repositoryRoot, "packages", "web-content-reader");
const outputsRoot = join(repositoryRoot, "outputs");

function readStoredZip(buffer) {
  const entries = new Map();
  let offset = 0;
  while (offset + 4 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature === 0x02014b50 || signature === 0x06054b50) break;
    assert.equal(signature, 0x04034b50, `unexpected ZIP signature at ${offset}`);
    const method = buffer.readUInt16LE(offset + 8);
    const expectedCrc = buffer.readUInt32LE(offset + 14);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    assert.equal(method, 0, "release ZIP must use deterministic stored entries");
    assert.equal(compressedSize, uncompressedSize);
    const nameStart = offset + 30;
    const contentStart = nameStart + nameLength + extraLength;
    const name = buffer.subarray(nameStart, nameStart + nameLength).toString("utf8");
    const content = buffer.subarray(contentStart, contentStart + uncompressedSize);
    assert.equal(crc32(content), expectedCrc, `${name} CRC mismatch`);
    entries.set(name, Buffer.from(content));
    offset = contentStart + compressedSize;
  }
  return entries;
}

async function withBuilds(callback) {
  await mkdir(outputsRoot, { recursive: true });
  const first = await mkdtemp(join(outputsRoot, ".release-test-a-"));
  const second = await mkdtemp(join(outputsRoot, ".release-test-b-"));
  try {
    const firstResult = await buildReleases({ repositoryRoot, outputDirectory: first });
    const secondResult = await buildReleases({ repositoryRoot, outputDirectory: second });
    await callback(firstResult, secondResult);
  } finally {
    await rm(first, { recursive: true, force: true });
    await rm(second, { recursive: true, force: true });
  }
}

test("release manifest keeps public components and internal modules distinct", async () => {
  const manifest = JSON.parse(await readFile(join(packageRoot, "release-manifest.json"), "utf8"));
  assert.equal(manifest.status, "internal-candidate");
  assert.equal(manifest.workflow.type, "Workflow");
  assert.equal(manifest.workflow.packageMode, "Bundle");
  assert.equal(manifest.standalone.type, "Skill");
  assert.equal(manifest.standalone.packageMode, "Standalone");
  assert.equal(
    manifest.workflow.components.find((item) => item.slug === manifest.standalone.slug)?.version,
    manifest.standalone.version,
  );
  assert.equal(
    manifest.workflow.components.find((item) => item.slug === "generic-web-reader")?.type,
    "Internal",
  );
});

test("both Skill folders keep minimal valid frontmatter", async () => {
  for (const skillName of ["web-content-reader", "weixin-article-reader"]) {
    const skillRoot = join(packageRoot, "skill", skillName);
    const markdown = await readFile(join(skillRoot, "SKILL.md"), "utf8");
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${skillName} missing frontmatter`);
    const fields = frontmatter[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.slice(0, line.indexOf(":")));
    assert.deepEqual(fields, ["name", "description"]);
    assert.match(frontmatter[1], new RegExp(`^name: ${skillName}$`, "m"));
    assert.ok((await readdir(skillRoot)).includes("agents"));
    assert.ok((await readdir(skillRoot)).includes("scripts"));
    assert.ok(!(await readdir(skillRoot)).includes("README.md"));
  }
});

test("candidate archives are byte-for-byte reproducible", async () => {
  await withBuilds(async (firstResult, secondResult) => {
    assert.deepEqual(firstResult.artifacts, secondResult.artifacts);
    for (const artifact of firstResult.artifacts) {
      const firstArchive = await readFile(join(firstResult.outputDirectory, artifact.file));
      const secondArchive = await readFile(join(secondResult.outputDirectory, artifact.file));
      assert.deepEqual(firstArchive, secondArchive, artifact.file);
      assert.equal(createHash("sha256").update(firstArchive).digest("hex"), artifact.sha256);
    }
  });
});

test("release builder refuses repository root and outside output paths", async () => {
  await assert.rejects(
    buildReleases({ repositoryRoot, outputDirectory: repositoryRoot }),
    /构建输出目录必须位于仓库内/,
  );
  await assert.rejects(
    buildReleases({ repositoryRoot, outputDirectory: dirname(repositoryRoot) }),
    /构建输出目录必须位于仓库内/,
  );
});

test("bundle and standalone ZIPs contain only their declared install units", async () => {
  await withBuilds(async (firstResult) => {
    const workflowArtifact = firstResult.artifacts.find((item) => item.slug === "web-content-reader");
    const standaloneArtifact = firstResult.artifacts.find((item) => item.slug === "weixin-article-reader");
    const workflowEntries = readStoredZip(
      await readFile(join(firstResult.outputDirectory, workflowArtifact.file)),
    );
    const standaloneEntries = readStoredZip(
      await readFile(join(firstResult.outputDirectory, standaloneArtifact.file)),
    );

    for (const name of workflowEntries.keys()) {
      assert.ok(name.startsWith("web-content-reader/"));
      assert.ok(!name.includes(".."));
      assert.ok(!name.includes("release-manifest.json"));
    }
    assert.ok(workflowEntries.has("web-content-reader/COMPONENTS.json"));
    assert.ok(workflowEntries.has("web-content-reader/skill/web-content-reader/SKILL.md"));
    assert.ok(workflowEntries.has("web-content-reader/skill/weixin-article-reader/SKILL.md"));

    for (const name of standaloneEntries.keys()) {
      assert.ok(name.startsWith("weixin-article-reader/"));
      assert.ok(!name.includes(".."));
      assert.ok(!name.includes("web-content-reader/SKILL.md"));
    }
    assert.ok(standaloneEntries.has("weixin-article-reader/COMPONENTS.json"));
    assert.ok(standaloneEntries.has("weixin-article-reader/README.md"));
    assert.ok(standaloneEntries.has("weixin-article-reader/skill/weixin-article-reader/SKILL.md"));
  });
});
