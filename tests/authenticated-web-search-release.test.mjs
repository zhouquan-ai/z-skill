import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { buildAuthenticatedWebSearchRelease } from "../scripts/build-authenticated-web-search-release.mjs";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(repositoryRoot, "packages", "authenticated-web-search");
const outputsRoot = join(repositoryRoot, "outputs");

function readStoredZipEntryNames(buffer) {
  const names = [];
  let offset = 0;
  while (offset + 4 <= buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature === 0x02014b50 || signature === 0x06054b50) break;
    assert.equal(signature, 0x04034b50, `unexpected ZIP signature at ${offset}`);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    names.push(buffer.subarray(nameStart, nameStart + nameLength).toString("utf8"));
    offset = nameStart + nameLength + extraLength + compressedSize;
  }
  return names;
}

test("authenticated web search metadata uses one current identity", async () => {
  const manifest = JSON.parse(await readFile(join(packageRoot, "release-manifest.json"), "utf8"));
  const skill = await readFile(join(packageRoot, "skill", "authenticated-web-search", "SKILL.md"), "utf8");
  const interfaceYaml = await readFile(join(packageRoot, "skill", "authenticated-web-search", "agents", "openai.yaml"), "utf8");

  assert.equal(manifest.status, "public-candidate");
  assert.equal(manifest.release.slug, "authenticated-web-search");
  assert.equal(manifest.release.name, "登录态网页检索");
  assert.equal(manifest.release.version, "v0.1.0-candidate.3");
  assert.match(skill, /^name: authenticated-web-search$/m);
  assert.match(skill, /^# 登录态网页检索$/m);
  assert.match(interfaceYaml, /display_name: "登录态网页检索"/);
  assert.match(interfaceYaml, /\$authenticated-web-search/);
  assert.doesNotMatch(`${skill}\n${interfaceYaml}`, /authenticated-browser-workbench/);
});

test("authenticated web search archive is reproducible and contains only the current slug", async () => {
  await mkdir(outputsRoot, { recursive: true });
  const first = await mkdtemp(join(outputsRoot, ".authenticated-search-a-"));
  const second = await mkdtemp(join(outputsRoot, ".authenticated-search-b-"));
  try {
    const firstResult = await buildAuthenticatedWebSearchRelease({ repositoryRoot, outputDirectory: first });
    const secondResult = await buildAuthenticatedWebSearchRelease({ repositoryRoot, outputDirectory: second });
    assert.deepEqual(firstResult.artifacts, secondResult.artifacts);

    const artifact = firstResult.artifacts[0];
    const archive = await readFile(join(first, artifact.file));
    assert.deepEqual(archive, await readFile(join(second, artifact.file)));
    const entryNames = readStoredZipEntryNames(archive);
    assert.ok(entryNames.includes("authenticated-web-search/skill/authenticated-web-search/SKILL.md"));
    assert.ok(entryNames.every((name) => !name.includes("authenticated-browser-workbench")));
  } finally {
    await rm(first, { recursive: true, force: true });
    await rm(second, { recursive: true, force: true });
  }
});
