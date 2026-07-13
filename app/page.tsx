import Link from "next/link";
import { HeroSearch } from "./HeroSearch";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import { tools } from "./tool-data";

const tool = tools[0];

export default function Home() {
  return (
    <>
      <SiteHeader active="home" />
      <main>
        <section className="home-hero site-wrap">
          <div className="hero-copy">
            <p className="eyebrow">PERSONAL AI TOOL RELEASES</p>
            <h1>把 <span>AI 工具</span><br />讲清楚，再交付</h1>
            <p className="hero-lead">z-skill 收录由周全设计、整理并验证的 Skill、Workflow、Agent 与 AI 工具。每项成果都说明版本、测试、隐私与已知限制。</p>
            <HeroSearch />
            <ul className="hero-facts" aria-label="当前公开事实">
              <li>当前公开 1 项</li>
              <li>候选版如实标注</li>
              <li>版本与限制公开</li>
            </ul>
          </div>

          <article className="release-card">
            <div className="release-rule" aria-hidden="true" />
            <div className="release-topline">
              <span className="tool-glyph" aria-hidden="true">MD</span>
              <div className="tag-group"><span className="tag neutral">{tool.type}</span><span className="tag candidate">{tool.status}</span></div>
            </div>
            <p className="eyebrow">CURRENT RELEASE</p>
            <h2>{tool.name}</h2>
            <p>{tool.summary}</p>
            <div className="release-formats" aria-label="已验证格式">
              {tool.verified.map((format) => <span key={format}>{format}</span>)}
            </div>
            <div className="release-meta"><strong>{tool.version}</strong><span>更新于 {tool.updated}</span></div>
            <Link className="button primary large" href={`/tools/${tool.slug}`}>查看工具详情</Link>
          </article>
        </section>

        <section className="home-principles">
          <div className="site-wrap">
            <div className="section-heading">
              <p className="eyebrow">RELEASE PRINCIPLES</p>
              <h2>发布少一点，说明完整一点</h2>
            </div>
            <div className="principle-grid">
              <article><span>01</span><h3>用途明确</h3><p>先说明工具解决什么问题、适合哪些场景，再提供下载。</p></article>
              <article><span>02</span><h3>版本可追溯</h3><p>页面、ZIP、GitHub 版本和更新记录保持一致。</p></article>
              <article><span>03</span><h3>限制公开</h3><p>测试失败、隐私风险与尚未验证项不会被包装成成功。</p></article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
