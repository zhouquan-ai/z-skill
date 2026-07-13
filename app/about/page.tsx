import { SiteFooter, SiteHeader } from "../SiteChrome";
import { tools } from "../tool-data";

const currentReleases = tools.map((tool) => `${tool.name} ${tool.version}`).join("、");

export default function AboutPage() {
  return (
    <>
      <SiteHeader active="about" />
      <main className="about-page">
        <section className="about-hero site-wrap">
          <p className="eyebrow">ABOUT Z-SKILL</p>
          <h1>一个人的工具发布站，也应有清楚的收录与验证原则</h1>
          <p>z-skill 只发布周全设计、整理和验证的 AI 工具，不做文章站、社区、投稿平台或排行榜。</p>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>发布什么</h2><p>只收录用途明确、版本可交付、测试和边界可说明的个人 AI 工具。当前仅公开 {currentReleases}。</p></div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>收录标准</h2></div>
          <div className="standard-list">
            <article><span>01</span><div><h3>用途明确</h3><p>说明解决的问题、适用场景和不适用边界。</p></div></article>
            <article><span>02</span><div><h3>版本可追溯</h3><p>页面、ZIP、GitHub 版本和更新记录保持一致。</p></div></article>
            <article><span>03</span><div><h3>验证有依据</h3><p>只陈述已完成的测试，不用评分或下载量代替证据。</p></div></article>
            <article><span>04</span><div><h3>限制不隐藏</h3><p>隐私风险、失败结果和待验证项与下载入口一起公开。</p></div></article>
          </div>
        </section>

        <section className="about-section site-wrap channel-section">
          <div className="about-copy"><h2>三个渠道怎样分工</h2></div>
          <div className="channel-grid">
            <article><span>公众号</span><h3>解释问题与过程</h3><p>记录为什么做、怎样判断，以及真实建设经历。</p></article>
            <article><span>GitHub</span><h3>保存权威版本</h3><p>承载代码、包、许可证、测试与精确技术差异。</p></article>
            <article><span>z-skill</span><h3>完成公开交付</h3><p>让访问者快速理解、安装或下载当前成果。</p></article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
