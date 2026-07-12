import { ToolCatalog } from "./ToolCatalog";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="z-skill 首页">
          <span className="brand-z">z</span>-skill
        </a>
        <nav aria-label="主导航">
          <a href="#catalog">工具目录</a>
          <span>INDEX / 01</span>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="section-index" aria-hidden="true">
          01
        </div>
        <div className="hero-main">
          <p className="eyebrow">INDEPENDENT AI TOOL INDEX · 2026</p>
          <h1 id="hero-title">
            周全设计的
            <br />
            <span>AI 工具与可复用工作流</span>
          </h1>
          <div className="hero-footer">
            <p>
              聚焦 Skill、Workflow、Agent 与实用工具。每项成果都保留版本、验证状态、使用边界和直接下载入口。
            </p>
            <a className="hero-link" href="#catalog">
              浏览全部成果 <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-stats" aria-label="网站当前状态">
            <div>
              <strong>01</strong>
              <span>可下载成果</span>
            </div>
            <div>
              <strong>04</strong>
              <span>成果类型</span>
            </div>
            <div>
              <strong>REAL</strong>
              <span>验证记录</span>
            </div>
          </div>
        </div>
      </section>

      <ToolCatalog />

      <footer className="site-footer">
        <p>z-skill · 只发布由周全设计、整理并实际验证的 AI 工具</p>
        <p>版本与限制以各成果详情页为准</p>
      </footer>
    </main>
  );
}
