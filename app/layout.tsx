import type { Metadata } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL("https://z-skill.com"),
    title: "z-skill｜AI 工具与可复用工作流",
    description: "周全的 AI 工具发布页，提供 Skill、Workflow、Agent 等作品的安装说明、测试记录和版本下载。",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "z-skill｜AI 工具与可复用工作流",
      description: "查看 AI 工具的用途、安装方式、测试记录和已知限制。",
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary",
      title: "z-skill｜AI 工具与可复用工作流",
      description: "查看 AI 工具的用途、安装方式、测试记录和已知限制。",
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
