import type { Metadata } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL("https://z-skill.com"),
    title: "z-skill｜AI 工具与可复用工作流",
    description: "周全设计、整理并验证的 Skill、Workflow、Agent 与 AI 工具发布站。查看版本、测试、隐私、限制与下载方式。",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "z-skill｜AI 工具与可复用工作流",
      description: "把 AI 工具讲清楚，再交付。查看真实版本、测试状态、隐私说明与已知限制。",
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary",
      title: "z-skill｜AI 工具与可复用工作流",
      description: "把 AI 工具讲清楚，再交付。查看真实版本、测试状态、隐私说明与已知限制。",
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
