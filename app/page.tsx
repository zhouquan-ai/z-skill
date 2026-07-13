import Link from "next/link";
import { HeroSearch } from "./HeroSearch";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { getPackageModeLabel, getRecentTools, getReleaseDate, tools } from "./tool-data";

const recentTools = getRecentTools();

export default function Home() {
  return (
    <>
      <SiteHeader active="home" />
      <main id="main-content">
        <section className="home-hero site-wrap">
          <div className="hero-copy">
            <div className="hero-statement">
              <p className="eyebrow">PERSONAL AI TOOL RELEASES</p>
              <h1>把 <span>AI 工具</span><br />讲清楚，再交付</h1>
              <p className="hero-lead">周全设计、整理并验证的 AI 工具发布站。每项成果均公开版本、测试、隐私与限制。</p>
            </div>
            <HeroSearch />
            <ul className="hero-facts" aria-label="当前公开事实">
              <li>当前公开 {tools.length} 项</li>
              <li>版本与限制公开</li>
            </ul>
          </div>
        </section>

        <section className="recent-releases" aria-labelledby="recent-releases-title">
          <div className="site-wrap">
            <div className="recent-heading">
              <div>
                <p className="eyebrow">RECENT RELEASES</p>
                <h2 id="recent-releases-title">最近发布</h2>
              </div>
              <Link className="text-link" href="/tools">查看全部工具</Link>
            </div>
            <div className="recent-grid">
              {recentTools.map((tool) => (
                <Link className="recent-card" href={`/tools/${tool.slug}`} key={tool.slug}>
                  <div className="recent-card-topline">
                    <span className="tool-glyph" aria-hidden="true">{tool.glyph}</span>
                    <div className="tag-group">
                      <span className="tag neutral">{tool.type}</span>
                      <span className="tag neutral">{getPackageModeLabel(tool.packageMode)}</span>
                      <span className={`tag ${tool.statusTone}`}>{tool.status}</span>
                    </div>
                  </div>
                  <h3>{tool.name}</h3>
                  <p>{tool.summary}</p>
                  <div className="recent-meta">
                    <strong>{tool.version}</strong>
                    <span>发布于 {getReleaseDate(tool)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-principles">
          <div className="site-wrap">
            <div className="section-heading">
              <p className="eyebrow">RELEASE PRINCIPLES</p>
              <h2>发布少一点，说明完整一点</h2>
            </div>
            <div className="principle-grid">
              <article><span>01</span><h3>用途明确</h3><p>说明解决什么问题、适合哪些场景。</p></article>
              <article><span>02</span><h3>版本可追溯</h3><p>页面、ZIP、GitHub 版本和更新记录保持一致。</p></article>
              <article><span>03</span><h3>限制公开</h3><p>测试失败、隐私风险和待验证项如实呈现。</p></article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
