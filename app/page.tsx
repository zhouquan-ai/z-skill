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
              <p className="eyebrow">PERSONAL AI TOOLS</p>
              <h1>把 <span>AI 工具</span><br />讲清楚，再交付</h1>
              <p className="hero-lead">z-skill 发布由周全制作并实际验证过的 AI 工具，提供清晰的使用说明和可下载版本。</p>
            </div>
            <HeroSearch />
            <ul className="hero-facts" aria-label="当前公开事实">
              <li>已发布 {tools.length} 项</li>
              <li>支持 Agent 安装与 ZIP 下载</li>
            </ul>
          </div>
        </section>

        <section className="recent-releases" aria-labelledby="recent-releases-title">
          <div className="site-wrap">
            <div className="recent-heading">
              <div>
                <p className="eyebrow">RELEASES</p>
                <h2 id="recent-releases-title">最近发布</h2>
              </div>
              <Link className="button secondary section-action" href="/tools">查看全部工具</Link>
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
                    <span>发布于 {getReleaseDate(tool)} <span className="card-arrow" aria-hidden="true">→</span></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-principles">
          <div className="site-wrap">
            <div className="section-heading">
              <p className="eyebrow">PRINCIPLES</p>
              <h2>每项工具都会说明</h2>
            </div>
            <div className="principle-grid">
              <article><span>01</span><h3>适用范围</h3><p>说明用途、运行环境和必要依赖。</p></article>
              <article><span>02</span><h3>测试记录</h3><p>列明已通过、失败和待验证的测试项。</p></article>
              <article><span>03</span><h3>隐私与限制</h3><p>说明数据处理方式、已知问题和使用边界。</p></article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
