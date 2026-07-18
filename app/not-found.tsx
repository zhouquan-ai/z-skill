import Link from "next/link";
import { SiteFooter, SiteHeader } from "./SiteChrome";

export default function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="not-found-page site-wrap" id="main-content">
        <p className="eyebrow">404 · 页面不存在</p>
        <h1>这个工具页面还不存在</h1>
        <p>它可能尚未公开，或者地址已经失效。你可以返回工具目录查看当前真实发布内容。</p>
        <div className="not-found-actions">
          <Link className="button primary large" href="/tools">查看全部工具</Link>
          <Link className="text-link" href="/">返回首页</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
