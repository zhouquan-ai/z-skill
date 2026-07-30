import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildInternalCandidateReleases,
  candidateManifestPaths,
} from "../scripts/build-internal-candidate-releases.mjs";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputsRoot = join(repositoryRoot, "outputs");
const workTypePattern = /Skill|Workflow|Agent|工作流|智能体/i;

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

test("internal candidate identities and public boundaries are explicit", async () => {
  for (const manifestPath of candidateManifestPaths) {
    const manifest = JSON.parse(await readFile(join(repositoryRoot, manifestPath), "utf8"));
    const { slug, name, source } = manifest.release;
    const sourceRoot = join(repositoryRoot, dirname(manifestPath), source);
    const skill = await readFile(join(sourceRoot, "SKILL.md"), "utf8");
    const interfaceYaml = await readFile(join(sourceRoot, "agents", "openai.yaml"), "utf8");
    const readme = await readFile(join(repositoryRoot, dirname(manifestPath), "README.md"), "utf8");

    assert.equal(manifest.status, "internal-candidate");
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.doesNotMatch(name, workTypePattern);
    assert.match(readme, new RegExp(`^# ${name}$`, "m"));
    assert.match(skill, new RegExp(`^name: ${slug}$`, "m"));
    assert.match(skill, new RegExp(`^# ${name}$`, "m"));
    assert.ok(interfaceYaml.includes(`display_name: "${name}"`));
    assert.ok(interfaceYaml.includes(`$${slug}`));
    assert.match(readme, /尚未进入z-skill公开目录/);
    assert.doesNotMatch(`${skill}\n${interfaceYaml}\n${readme}`, /\[TODO|周全秘书|D:\\|C:\\/);
  }
});

test("internal candidate archives are reproducible and isolated", async () => {
  await mkdir(outputsRoot, { recursive: true });
  const first = await mkdtemp(join(outputsRoot, ".internal-candidates-a-"));
  const second = await mkdtemp(join(outputsRoot, ".internal-candidates-b-"));
  try {
    const firstResult = await buildInternalCandidateReleases({
      repositoryRoot,
      outputDirectory: first,
    });
    const secondResult = await buildInternalCandidateReleases({
      repositoryRoot,
      outputDirectory: second,
    });
    assert.deepEqual(firstResult.artifacts, secondResult.artifacts);
    assert.equal(firstResult.artifacts.length, 2);

    for (const artifact of firstResult.artifacts) {
      const firstArchive = await readFile(join(first, artifact.file));
      const secondArchive = await readFile(join(second, artifact.file));
      assert.deepEqual(firstArchive, secondArchive);
      const entries = readStoredZipEntryNames(firstArchive);
      assert.ok(entries.includes(`${artifact.slug}/skill/${artifact.slug}/SKILL.md`));
      assert.ok(entries.includes(`${artifact.slug}/COMPONENTS.json`));
      assert.ok(entries.every((entry) => entry.startsWith(`${artifact.slug}/`)));
    }
  } finally {
    await rm(first, { recursive: true, force: true });
    await rm(second, { recursive: true, force: true });
  }
});
