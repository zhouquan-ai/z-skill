import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = dirname(scriptDirectory);
const manifestRelativePath = "packages/web-content-reader/release-manifest.json";
const fixedDosDate = 33;
const fixedDosTime = 0;
const utf8Flag = 0x0800;
const storedMethod = 0;

const forbiddenFilePatterns = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)(?:id_rsa|id_ed25519)(?:\.|$)/i,
  /\.(?:pem|p12|pfx|key)$/i,
  /(^|\/)(?:cookies?|browser-profile)(?:\.|\/|$)/i,
];

const forbiddenTextPatterns = [
  { label: "Windows绝对路径", pattern: /\b[A-Za-z]:\\/ },
  { label: "用户目录绝对路径", pattern: /\/(?:Users|home)\/[^/\s]+/ },
  { label: "私钥", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "疑似OpenAI密钥", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: "疑似AWS访问密钥", pattern: /\bAKIA[A-Z0-9]{16}\b/ },
];

const textExtensions = new Set([
  "",
  ".json",
  ".md",
  ".ps1",
  ".py",
  ".txt",
  ".yaml",
  ".yml",
]);

function normalizeArchivePath(value) {
  return value.split(sep).join("/").replace(/^\/+/, "");
}

function extensionOf(filePath) {
  const name = basename(filePath);
  const index = name.lastIndexOf(".");
  return index < 0 ? "" : name.slice(index).toLowerCase();
}

export function normalizeReleaseContent(archivePath, content) {
  const buffer = Buffer.from(content);
  if (!textExtensions.has(extensionOf(archivePath))) return buffer;
  return Buffer.from(buffer.toString("utf8").replace(/\r\n?/g, "\n"), "utf8");
}

function assertSafeArchivePath(archivePath) {
  if (!archivePath || archivePath.startsWith("/") || archivePath.includes("\\")) {
    throw new Error(`无效归档路径：${archivePath}`);
  }
  if (archivePath.split("/").some((segment) => segment === ".." || segment === "")) {
    throw new Error(`归档路径包含越界或空片段：${archivePath}`);
  }
  if (forbiddenFilePatterns.some((pattern) => pattern.test(archivePath))) {
    throw new Error(`归档包含禁止文件：${archivePath}`);
  }
}

function assertSafeContent(archivePath, content) {
  if (!textExtensions.has(extensionOf(archivePath))) return;
  const text = content.toString("utf8");
  for (const { label, pattern } of forbiddenTextPatterns) {
    if (pattern.test(text)) throw new Error(`${archivePath}包含${label}`);
  }
}

async function collectDirectory(sourceDirectory, archivePrefix) {
  const entries = [];
  const children = await readdir(sourceDirectory, { withFileTypes: true });
  children.sort((left, right) => left.name.localeCompare(right.name, "en"));

  for (const child of children) {
    const sourcePath = join(sourceDirectory, child.name);
    const archivePath = normalizeArchivePath(join(archivePrefix, child.name));
    if (child.isSymbolicLink()) throw new Error(`发布源不得包含符号链接：${sourcePath}`);
    if (child.isDirectory()) {
      entries.push(...await collectDirectory(sourcePath, archivePath));
      continue;
    }
    if (!child.isFile()) continue;
    const content = normalizeReleaseContent(archivePath, await readFile(sourcePath));
    assertSafeArchivePath(archivePath);
    assertSafeContent(archivePath, content);
    entries.push({ archivePath, content });
  }
  return entries;
}

async function collectFiles(packageRoot, filePaths, archiveRoot) {
  const entries = [];
  for (const relativePath of filePaths) {
    const sourcePath = join(packageRoot, relativePath);
    const sourceStat = await stat(sourcePath);
    if (!sourceStat.isFile()) throw new Error(`发布清单只允许文件：${relativePath}`);
    const archivePath = normalizeArchivePath(join(archiveRoot, basename(relativePath)));
    const content = normalizeReleaseContent(archivePath, await readFile(sourcePath));
    assertSafeArchivePath(archivePath);
    assertSafeContent(archivePath, content);
    entries.push({ archivePath, content });
  }
  return entries;
}

function generatedJsonEntry(archivePath, value) {
  const content = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
  assertSafeArchivePath(archivePath);
  assertSafeContent(archivePath, content);
  return { archivePath, content };
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

export function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

export function createDeterministicZip(inputEntries) {
  const entries = [...inputEntries].sort((left, right) =>
    left.archivePath.localeCompare(right.archivePath, "en"));
  const seen = new Set();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    assertSafeArchivePath(entry.archivePath);
    if (seen.has(entry.archivePath)) throw new Error(`归档路径重复：${entry.archivePath}`);
    seen.add(entry.archivePath);

    const name = Buffer.from(entry.archivePath, "utf8");
    const content = Buffer.from(entry.content);
    const checksum = crc32(content);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(utf8Flag, 6);
    localHeader.writeUInt16LE(storedMethod, 8);
    localHeader.writeUInt16LE(fixedDosTime, 10);
    localHeader.writeUInt16LE(fixedDosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(0x0314, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(utf8Flag, 8);
    centralHeader.writeUInt16LE(storedMethod, 10);
    centralHeader.writeUInt16LE(fixedDosTime, 12);
    centralHeader.writeUInt16LE(fixedDosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function artifactRecord(target, archiveBuffer) {
  return {
    slug: target.slug,
    type: target.type,
    packageMode: target.packageMode,
    version: target.version,
    file: target.archiveName,
    bytes: archiveBuffer.length,
    sha256: createHash("sha256").update(archiveBuffer).digest("hex"),
  };
}

async function buildBundle(packageRoot, workflow) {
  const entries = await collectFiles(packageRoot, workflow.bundleFiles, workflow.archiveRoot);
  entries.push(...await collectDirectory(
    join(packageRoot, "skill"),
    normalizeArchivePath(join(workflow.archiveRoot, "skill")),
  ));
  entries.push(generatedJsonEntry(
    `${workflow.archiveRoot}/COMPONENTS.json`,
    {
      schemaVersion: 1,
      slug: workflow.slug,
      name: workflow.name,
      type: workflow.type,
      packageMode: workflow.packageMode,
      version: workflow.version,
      components: workflow.components,
    },
  ));
  return createDeterministicZip(entries);
}

async function buildStandalone(packageRoot, standalone) {
  const entries = await collectFiles(
    packageRoot,
    standalone.distributionFiles,
    standalone.archiveRoot,
  );
  entries.push(...await collectDirectory(
    join(packageRoot, standalone.source),
    normalizeArchivePath(join(standalone.archiveRoot, "skill", standalone.slug)),
  ));
  entries.push(generatedJsonEntry(
    `${standalone.archiveRoot}/COMPONENTS.json`,
    {
      schemaVersion: 1,
      slug: standalone.slug,
      name: standalone.name,
      type: standalone.type,
      packageMode: standalone.packageMode,
      version: standalone.version,
      components: [
        {
          slug: standalone.slug,
          type: standalone.type,
          version: standalone.version,
          source: `skill/${standalone.slug}`,
        },
      ],
    },
  ));
  return createDeterministicZip(entries);
}

export async function buildReleases({
  repositoryRoot = defaultRepositoryRoot,
  outputDirectory,
} = {}) {
  const root = resolve(repositoryRoot);
  const manifestPath = join(root, manifestRelativePath);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const packageRoot = dirname(manifestPath);
  const resolvedOutput = resolve(root, outputDirectory ?? manifest.build.outputDirectory);

  const relativeOutput = relative(root, resolvedOutput);
  if (!relativeOutput || relativeOutput.startsWith("..") || isAbsolute(relativeOutput)) {
    throw new Error("构建输出目录必须位于仓库内");
  }
  if (!new Set(["internal-candidate", "public-candidate", "public-stable"]).has(manifest.status)) {
    throw new Error("构建状态必须是internal-candidate、public-candidate或public-stable");
  }
  await mkdir(resolvedOutput, { recursive: true });

  const targets = [
    { metadata: manifest.workflow, buffer: await buildBundle(packageRoot, manifest.workflow) },
    { metadata: manifest.standalone, buffer: await buildStandalone(packageRoot, manifest.standalone) },
  ];
  const artifacts = [];
  for (const target of targets) {
    const outputPath = join(resolvedOutput, target.metadata.archiveName);
    await writeFile(outputPath, target.buffer);
    artifacts.push(artifactRecord(target.metadata, target.buffer));
  }
  artifacts.sort((left, right) => left.file.localeCompare(right.file, "en"));

  const artifactManifest = {
    schemaVersion: 1,
    status: manifest.status,
    generatedBy: "scripts/build-web-content-reader-releases.mjs",
    artifacts,
  };
  await writeFile(
    join(resolvedOutput, manifest.build.artifactManifest),
    `${JSON.stringify(artifactManifest, null, 2)}\n`,
    "utf8",
  );
  return { manifest, outputDirectory: resolvedOutput, artifacts };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = await buildReleases();
  for (const artifact of result.artifacts) {
    console.log(`${artifact.file} ${artifact.sha256} ${artifact.bytes} bytes`);
  }
  console.log(`输出目录：${result.outputDirectory}`);
}
