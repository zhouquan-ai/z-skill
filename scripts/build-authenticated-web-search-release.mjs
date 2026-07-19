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
const manifestRelativePath = "packages/authenticated-web-search/release-manifest.json";
const releaseStatuses = new Set(["internal-candidate", "public-candidate", "public-stable"]);

export async function buildAuthenticatedWebSearchRelease({
  repositoryRoot = defaultRepositoryRoot,
  outputDirectory,
} = {}) {
  const root = resolve(repositoryRoot);
  const manifestPath = join(root, manifestRelativePath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const packageRoot = dirname(manifestPath);
  const target = manifest.release;
  const resolvedOutput = resolve(root, outputDirectory ?? manifest.build.outputDirectory);
  const relativeOutput = relative(root, resolvedOutput);

  if (!relativeOutput || relativeOutput.startsWith("..") || isAbsolute(relativeOutput)) {
    throw new Error("构建输出目录必须位于仓库内");
  }
  if (!releaseStatuses.has(manifest.status)) {
    throw new Error("构建状态必须是internal-candidate、public-candidate或public-stable");
  }

  const entries = await collectFiles(packageRoot, target.bundleFiles, target.archiveRoot);
  entries.push(...await collectDirectory(
    join(packageRoot, target.source),
    `${target.archiveRoot}/skill/${target.slug}`,
  ));
  entries.push(generatedJsonEntry(
    `${target.archiveRoot}/COMPONENTS.json`,
    {
      schemaVersion: 1,
      slug: target.slug,
      name: target.name,
      type: target.type,
      packageMode: target.packageMode,
      version: target.version,
      components: [{
        slug: target.slug,
        type: target.type,
        version: target.version,
        source: `skill/${target.slug}`,
      }],
    },
  ));

  const archiveBuffer = createDeterministicZip(entries);
  const artifact = artifactRecord(target, archiveBuffer);
  await mkdir(resolvedOutput, { recursive: true });
  await writeFile(join(resolvedOutput, target.archiveName), archiveBuffer);
  await writeFile(
    join(resolvedOutput, manifest.build.artifactManifest),
    `${JSON.stringify({
      schemaVersion: 1,
      status: manifest.status,
      generatedBy: "scripts/build-authenticated-web-search-release.mjs",
      artifacts: [artifact],
    }, null, 2)}\n`,
    "utf8",
  );

  return { manifest, outputDirectory: resolvedOutput, artifacts: [artifact] };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = await buildAuthenticatedWebSearchRelease();
  for (const artifact of result.artifacts) {
    console.log(`${artifact.file} ${artifact.sha256} ${artifact.bytes} bytes`);
  }
  console.log(`输出目录：${result.outputDirectory}`);
}
