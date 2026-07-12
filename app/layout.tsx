import type { Metadata } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "z-skill｜AI 工具与可复用工作流",
    description: "周全设计的 Skill、Workflow、Agent 与实用工具目录。查看验证状态、使用边界并直接下载。",
    openGraph: {
      title: "z-skill｜AI 工具与可复用工作流",
      description: "经过整理、验证并可直接下载的个人 AI 工具索引。",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "z-skill｜AI 工具与可复用工作流",
      description: "经过整理、验证并可直接下载的个人 AI 工具索引。",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
