export type ToolType = "Skill" | "Workflow" | "Agent" | "工具";

export type ToolRecord = {
  slug: string;
  name: string;
  type: ToolType;
  status: string;
  version: string;
  updated: string;
  summary: string;
  verified: string[];
  download: string;
  category: string;
  environments: string[];
  environmentNote: string;
};

export const tools: ToolRecord[] = [
  {
    slug: "any-to-md",
    name: "Any-to-MD",
    type: "Skill",
    status: "公开候选",
    version: "v0.1.0-candidate",
    updated: "2026-07-12",
    summary:
      "把 PDF、Word、Excel、图片等文件转换为可维护、可复核的 Markdown 基础资料。",
    verified: ["PDF", "XLSX", "PNG", "Markdown"],
    download: "/downloads/any-to-md-v0.1.0-candidate.zip",
    category: "知识管理 · 文件处理",
    environments: [],
    environmentNote: "适配环境待正式验收",
  },
];

export const toolTypes = ["全部", "Skill", "Workflow", "Agent", "工具"] as const;
export const toolEnvironments = ["全部环境", "Codex", "Claude", "通用"] as const;
export const toolStatuses = ["全部状态", "已验证", "公开候选", "尚未验证"] as const;
