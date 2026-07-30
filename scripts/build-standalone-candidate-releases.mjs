import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  artifactRecord,
  collectDirectory,
  collectFiles,
  createDeterministicZip,
  generatedJsonEntry,
} from "./build-web-content-reader-releases.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = dirname(scriptDirectory);

export const candidateManifestPaths = [
  "packages/legal-practice-article/release-manifest.json",
  "packages/callable-knowledge/release-manifest.json",
  "packages/article-visual-workflow/release-manifest.json",
];

async function buildOne(root, manifestRelativePath) {
  const manifestPath = join(root, manifestRelativePath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.status !== "public-candidate") {
    throw new Error(`${manifestRelativePath}: 只能构建public-candidate`);
  }

  const packageRoot = dirname(manifestPath);
  const target = manifest.release;
  const entries = await collectFiles(packageRoot, target.bundleFiles, target.archiveRoot);
  entries.push(...await collectDirectory(
    join(packageRoot, target.source),
    `${target.archiveRoot}/skill/${target.slug}`,
  ));
  for (const extraDirectory of target.extraDirectories ?? []) {
    entries.push(...await collectDirectory(
      join(packageRoot, extraDirectory),
      `${target.archiveRoot}/${extraDirectory}`,
    ));
  }
  entries.push(generatedJsonEntry(
    `${target.archiveRoot}/COMPONENTS.json`,
    {
      schemaVersion: 1,
      slug: target.slug,
      name: target.name,
      type: target.type,
      packageMode: target.packageMode,
      version: target.version,
      releaseStatus: manifest.status,
      components: [{
        slug: target.slug,
        type: target.type,
        version: target.version,
        source: `skill/${target.slug}`,
      }],
    },
  ));

  const archiveBuffer = createDeterministicZip(entries);
  return {
    manifest,
    archiveBuffer,
    artifact: artifactRecord(target, archiveBuffer),
  };
}

export async function buildStandaloneCandidateReleases({
  repositoryRoot = defaultRepositoryRoot,
  outputDirectory = "outputs/standalone-candidates",
} = {}) {
  const root = resolve(repositoryRoot);
  const resolvedOutput = resolve(root, outputDirectory);
  const relativeOutput = relative(root, resolvedOutput);
  if (!relativeOutput || relativeOutput.startsWith("..") || isAbsolute(relativeOutput)) {
    throw new Error("构建输出目录必须位于仓库内");
  }

  const builds = [];
  for (const manifestPath of candidateManifestPaths) {
    builds.push(await buildOne(root, manifestPath));
  }

  await mkdir(resolvedOutput, { recursive: true });
  for (const build of builds) {
    await writeFile(join(resolvedOutput, build.artifact.file), build.archiveBuffer);
  }
  await writeFile(
    join(resolvedOutput, "artifacts.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      status: "public-candidate",
      generatedBy: "scripts/build-standalone-candidate-releases.mjs",
      artifacts: builds.map((build) => build.artifact),
    }, null, 2)}\n`,
    "utf8",
  );

  return {
    outputDirectory: resolvedOutput,
    artifacts: builds.map((build) => build.artifact),
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = await buildStandaloneCandidateReleases();
  for (const artifact of result.artifacts) {
    console.log(`${artifact.file} ${artifact.sha256} ${artifact.bytes} bytes`);
  }
  console.log(`输出目录：${result.outputDirectory}`);
}
