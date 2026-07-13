import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstallPrompt, tools } from "../app/tool-data.ts";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const seenSlugs = new Set();
const seenDownloads = new Set();
const statusTones = {
  已验证: "verified",
  公开候选: "candidate",
  尚未验证: "unverified",
};

function requireText(value, field, tool) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${tool.slug || "unknown"}: ${field} 不能为空`);
  }
}

for (const tool of tools) {
  for (const [field, value] of Object.entries({
    slug: tool.slug,
    name: tool.name,
    glyph: tool.glyph,
    version: tool.version,
    updated: tool.updated,
    author: tool.author,
    license: tool.license,
    category: tool.category,
    summary: tool.summary,
    detailSummary: tool.detailSummary,
    environmentNote: tool.environmentNote,
    privacy: tool.privacy,
    limitations: tool.limitations,
    testNote: tool.testNote,
  })) {
    requireText(value, field, tool);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug)) {
    errors.push(`${tool.slug}: slug 只能使用小写字母、数字和连字符`);
  }
  if (seenSlugs.has(tool.slug)) errors.push(`${tool.slug}: slug 重复`);
  seenSlugs.add(tool.slug);

  if (statusTones[tool.status] !== tool.statusTone) {
    errors.push(`${tool.slug}: 发布状态与状态色不匹配`);
  }
  if (!/^v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(tool.version)) {
    errors.push(`${tool.slug}: version 不符合 vX.Y.Z 格式`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tool.updated)) {
    errors.push(`${tool.slug}: updated 必须使用 YYYY-MM-DD`);
  }

  const expectedFileStem = `${tool.slug}-${tool.version}`;
  if (!tool.download.path.startsWith("/downloads/") || !tool.download.path.endsWith(".zip")) {
    errors.push(`${tool.slug}: 下载路径必须位于 /downloads/ 且为 ZIP`);
  }
  if (!tool.download.path.includes(expectedFileStem)) {
    errors.push(`${tool.slug}: 下载文件名必须同时包含 slug 和 version`);
  }
  if (seenDownloads.has(tool.download.path)) errors.push(`${tool.slug}: 下载路径重复`);
  seenDownloads.add(tool.download.path);

  let sourcePath = "";
  try {
    sourcePath = new URL(tool.download.sourceUrl).pathname;
  } catch {
    errors.push(`${tool.slug}: sourceUrl 不是有效 URL`);
  }
  if (sourcePath && !sourcePath.endsWith(`/public${tool.download.path}`)) {
    errors.push(`${tool.slug}: sourceUrl 与网站下载路径不一致`);
  }

  if (!/^[a-f0-9]{64}$/.test(tool.download.sha256)) {
    errors.push(`${tool.slug}: sha256 必须是64位小写十六进制`);
  }

  const archivePath = join(repositoryRoot, "public", tool.download.path.replace(/^\//, ""));
  try {
    const archive = await readFile(archivePath);
    const archiveStat = await stat(archivePath);
    const digest = createHash("sha256").update(archive).digest("hex");
    if (archiveStat.size === 0) errors.push(`${tool.slug}: ZIP 文件为空`);
    if (archive.subarray(0, 2).toString() !== "PK") errors.push(`${tool.slug}: 下载文件不是有效 ZIP 签名`);
    if (digest !== tool.download.sha256) errors.push(`${tool.slug}: ZIP 的 SHA-256 与工具记录不一致`);
  } catch (error) {
    errors.push(`${tool.slug}: 无法读取下载包（${error.message}）`);
  }

  if (!tool.formatTests.some((test) => test.status === "verified")) {
    errors.push(`${tool.slug}: 至少需要一项已验证格式`);
  }
  if (tool.overview.scenarios.length === 0) errors.push(`${tool.slug}: 至少需要一个适用场景`);
  if (tool.usageSteps.length === 0) errors.push(`${tool.slug}: 至少需要一个使用步骤`);
  if (tool.install.steps.length === 0) errors.push(`${tool.slug}: 至少需要一个安装步骤`);

  const prompt = buildInstallPrompt(tool);
  for (const expected of [tool.name, tool.version, tool.download.sourceUrl, tool.install.fallback]) {
    if (!prompt.includes(expected)) errors.push(`${tool.slug}: 安装 Prompt 缺少 ${expected}`);
  }
}

if (tools.length === 0) errors.push("至少需要一项公开工具");
if (tools.filter((tool) => tool.featured).length !== 1) {
  errors.push("必须且只能有一项首页代表工具");
}

if (errors.length > 0) {
  console.error("发布校验失败：");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`发布校验通过：${tools.length} 项工具，版本、下载路径、必填说明与 SHA-256 一致。`);
