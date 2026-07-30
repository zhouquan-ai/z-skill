import type { ToolIconKey, ToolIconTone } from "./tool-icon-registry";
import { anyToMd } from "./tool-records/any-to-md.ts";
import { articleVisualWorkflow } from "./tool-records/article-visual-workflow.ts";
import { authenticatedWebSearch } from "./tool-records/authenticated-web-search.ts";
import { callableKnowledge } from "./tool-records/callable-knowledge.ts";
import { feishuLocalAiBridge } from "./tool-records/feishu-local-ai-bridge.ts";
import { legalPracticeArticle } from "./tool-records/legal-practice-article.ts";
import { resumeLibraryManagement } from "./tool-records/resume-library-management.ts";
import { webContentReader } from "./tool-records/web-content-reader.ts";
import { wechatArticleLayout } from "./tool-records/wechat-article-layout.ts";
import { weixinArticleReader } from "./tool-records/weixin-article-reader.ts";

export type ToolType = "Skill" | "Workflow" | "Agent" | "Tool";
export type PackageMode = "Standalone" | "Bundle";
export type ReleaseStatus = "正式版" | "公开候选";
export type StatusTone = "stable" | "candidate";
export type FormatTestStatus = "verified" | "failed" | "pending";

export type ToolComponent = {
  slug?: string;
  name: string;
  type: "Skill" | "Internal";
  version?: string;
  summary: string;
};

export type ToolDependency = {
  name: string;
  role: string;
};

export type ToolRecord = {
  slug: string;
  name: string;
  aliases: string[];
  legacySlugs?: string[];
  iconKey: ToolIconKey;
  iconTone: ToolIconTone;
  type: ToolType;
  packageMode: PackageMode;
  status: ReleaseStatus;
  statusTone: StatusTone;
  version: string;
  releasedAt: string;
  updated: string;
  author: string;
  license: string;
  category: string;
  summary: string;
  detailSummary: string;
  environments: string[];
  environmentNote: string;
  download: {
    path: string;
    sourceUrl: string;
    label: string;
    fileType: "ZIP";
    sha256: string;
  };
  overview: {
    title: string;
    description: string;
    scenarios: string[];
  };
  testNote: string;
  formatTests: Array<{
    format: string;
    status: FormatTestStatus;
    label: string;
  }>;
  usageSteps: string[];
  install: {
    intro: string;
    steps: string[];
    fallback: string;
  };
  components: ToolComponent[];
  dependencies: ToolDependency[];
  privacy: string;
  limitations: string;
};

export const tools: ToolRecord[] = [
  anyToMd,
  webContentReader,
  weixinArticleReader,
  authenticatedWebSearch,
  legalPracticeArticle,
  callableKnowledge,
  articleVisualWorkflow,
  resumeLibraryManagement,
  feishuLocalAiBridge,
  wechatArticleLayout,
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolByLegacySlug(slug: string) {
  return tools.find((tool) => tool.legacySlugs?.includes(slug));
}

export function getVerifiedFormats(tool: ToolRecord) {
  return tool.formatTests
    .filter((test) => test.status === "verified")
    .map((test) => test.format);
}

export function getIncludedIn(slug: string) {
  return tools.filter((tool) => tool.components.some((component) => component.slug === slug));
}

export function getPackageModeLabel(mode: PackageMode) {
  return mode === "Bundle" ? "组合包" : "独立包";
}

export function getToolSearchText(tool: ToolRecord) {
  return [
    tool.name,
    tool.slug,
    ...tool.aliases,
    tool.summary,
    tool.category,
    ...getVerifiedFormats(tool),
    ...tool.components.map((item) => item.name),
    ...tool.dependencies.map((item) => item.name),
  ].join(" ").toLowerCase();
}

const toolNameCollator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

export function compareToolsByUpdated(left: ToolRecord, right: ToolRecord) {
  return right.updated.localeCompare(left.updated)
    || right.releasedAt.localeCompare(left.releasedAt)
    || toolNameCollator.compare(left.name, right.name);
}

export function getRecentTools(limit = 3) {
  return tools.toSorted((left, right) =>
    right.releasedAt.localeCompare(left.releasedAt)
      || toolNameCollator.compare(left.name, right.name))
    .slice(0, limit);
}

export function getReleaseDate(tool: ToolRecord) {
  return tool.releasedAt.slice(0, 10);
}

export function buildInstallPrompt(tool: ToolRecord) {
  const steps = tool.install.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const addressLabel = tool.status === "正式版" ? "权威版本地址" : "权威候选包地址";

  return `请安装 ${tool.name} ${tool.version}。

${addressLabel}：
${tool.download.sourceUrl}

${steps}

${tool.install.fallback}`;
}

export const catalogUpdated = tools
  .map((tool) => tool.updated)
  .toSorted()
  .at(-1) ?? "";

export const toolTypes = ["全部", "Skill", "Workflow", "Agent", "Tool"] as const;
export const toolEnvironments = ["全部环境", "Codex"] as const;
export const toolStatuses = ["全部状态", "正式版", "公开候选"] as const;
