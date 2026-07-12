import { ToolCatalog } from "./ToolCatalog";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="z-skill 首页">
            <span className="brand-mark">z</span>
            <span>z-skill</span>
          </a>
          <nav className="primary-nav" aria-label="主导航">
            <a className="active" href="#catalog">全部工具</a>
            <a href="#catalog">Skill</a>
            <a href="#catalog">Workflow</a>
            <a href="#catalog">Agent</a>
            <a href="#catalog">工具</a>
          </nav>
          <div className="header-status">
            <span className="online-dot" aria-hidden="true" />
            <span>持续整理与验证</span>
          </div>
        </div>
      </header>

      <section className="directory-hero" id="top">
        <div>
          <p className="eyebrow">PERSONAL AI TOOL HUB</p>
          <h1>全部工具</h1>
          <p>周全设计、整理并验证的 AI 工具，提供清晰说明与可迁移下载。</p>
        </div>
        <span className="directory-count">当前收录 1 项</span>
      </section>

      <ToolCatalog />

      <footer className="site-footer">
        <p><strong>z-skill</strong> · 只发布经过整理和验证的 AI 工具</p>
        <p>版本、隐私与限制以各成果详情页为准</p>
      </footer>
    </main>
  );
}
