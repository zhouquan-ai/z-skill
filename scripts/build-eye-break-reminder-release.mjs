import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
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
const defaultManifestRelativePath = "packages/eye-break-reminder/release-manifest.json";

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function buildEyeBreakReminderRelease({
  repositoryRoot = defaultRepositoryRoot,
  manifestRelativePath = defaultManifestRelativePath,
  executablePath,
  outputDirectory = "outputs/eye-break-reminder",
  verifyRecordedArtifact = true,
} = {}) {
  if (!executablePath) throw new Error("必须通过 executablePath 指定已验收 EXE");

  const root = resolve(repositoryRoot);
  const manifestPath = join(root, manifestRelativePath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.status !== "public-candidate") throw new Error("护眼提醒发布状态必须是 public-candidate");

  const packageRoot = dirname(manifestPath);
  const target = manifest.release;
  const executable = await readFile(resolve(executablePath));
  const executableStat = await stat(resolve(executablePath));
  const executableDigest = sha256(executable);
  if (executableStat.size !== target.executable.bytes) {
    throw new Error(`EXE 大小不一致：期望 ${target.executable.bytes}，实际 ${executableStat.size}`);
  }
  if (executableDigest !== target.executable.sha256) {
    throw new Error(`EXE SHA-256 不一致：期望 ${target.executable.sha256}，实际 ${executableDigest}`);
  }

  const sourcePackage = JSON.parse(await readFile(join(packageRoot, target.source, "package.json"), "utf8"));
  if (`v${sourcePackage.version}` !== target.version) {
    throw new Error(`源码版本与发布版本不一致：${sourcePackage.version} / ${target.version}`);
  }

  const entries = await collectFiles(packageRoot, target.bundleFiles, target.archiveRoot);
  entries.push(...await collectDirectory(
    join(packageRoot, target.source),
    `${target.archiveRoot}/source`,
  ));
  entries.push({
    archivePath: `${target.archiveRoot}/bin/${target.executable.file}`,
    content: executable,
  });
  entries.push(generatedJsonEntry(
    `${target.archiveRoot}/RELEASE.json`,
    {
      schemaVersion: 1,
      slug: target.slug,
      name: target.name,
      type: target.type,
      packageMode: target.packageMode,
      version: target.version,
      releaseStatus: manifest.status,
      executable: target.executable,
    },
  ));

  const archiveBuffer = createDeterministicZip(entries);
  const artifact = artifactRecord(target, archiveBuffer);
  if (verifyRecordedArtifact && target.artifact.sha256 !== "pending") {
    if (artifact.bytes !== target.artifact.bytes || artifact.sha256 !== target.artifact.sha256) {
      throw new Error(
        `ZIP 与发布清单不一致：期望 ${target.artifact.sha256}/${target.artifact.bytes}，实际 ${artifact.sha256}/${artifact.bytes}`,
      );
    }
  }

  const resolvedOutput = resolve(root, outputDirectory);
  const relativeOutput = relative(root, resolvedOutput);
  if (!relativeOutput || relativeOutput.startsWith("..") || isAbsolute(relativeOutput)) {
    throw new Error("构建输出目录必须位于仓库内");
  }
  await mkdir(resolvedOutput, { recursive: true });
  await writeFile(join(resolvedOutput, artifact.file), archiveBuffer);
  await writeFile(
    join(resolvedOutput, "artifacts.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      status: manifest.status,
      generatedBy: "scripts/build-eye-break-reminder-release.mjs",
      artifacts: [artifact],
    }, null, 2)}\n`,
    "utf8",
  );

  return { manifest, outputDirectory: resolvedOutput, artifacts: [artifact] };
}

function parseExecutableArgument(argv) {
  const index = argv.indexOf("--executable");
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = await buildEyeBreakReminderRelease({
    executablePath: parseExecutableArgument(process.argv.slice(2)),
  });
  for (const artifact of result.artifacts) {
    console.log(`${artifact.file} ${artifact.sha256} ${artifact.bytes} bytes`);
  }
  console.log(`输出目录：${result.outputDirectory}`);
}
