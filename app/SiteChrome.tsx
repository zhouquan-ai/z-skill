import Link from "next/link";

type ActivePage = "home" | "tools" | "about";

export function SiteHeader({ active }: { active: ActivePage }) {
  return (
    <header className="site-header">
      <div className="site-wrap header-inner">
        <Link className="brand" href="/" aria-label="z-skill 首页">
          <span className="brand-mark" aria-hidden="true"><span>Z</span></span>
          <span>z-skill</span>
        </Link>
        <nav className="primary-nav" aria-label="主导航">
          <Link className={active === "home" ? "active" : ""} href="/">首页</Link>
          <Link className={active === "tools" ? "active" : ""} href="/tools">全部工具</Link>
          <Link className={active === "about" ? "active" : ""} href="/about">关于</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-wrap footer-inner">
        <div>
          <strong>z-skill</strong>
          <p>周全设计、整理并验证的个人 AI 工具发布站</p>
        </div>
        <nav aria-label="页脚导航">
          <Link href="/">首页</Link>
          <Link href="/tools">全部工具</Link>
          <Link href="/about">关于</Link>
        </nav>
      </div>
    </footer>
  );
}
