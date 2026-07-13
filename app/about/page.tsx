import { SiteFooter, SiteHeader } from "../SiteChrome";

export default function AboutPage() {
  return (
    <>
      <SiteHeader active="about" />
      <main className="about-page">
        <section className="about-hero site-wrap">
          <p className="eyebrow">ABOUT Z-SKILL</p>
          <h1>一个人的工具发布站，也应有清楚的收录与验证原则</h1>
          <p>z-skill 只发布由周全设计、整理及验证的 Skill、Workflow、Agent 与 AI 工具，不扩展为文章站、社区、投稿平台或排行榜。</p>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>发布什么</h2><p>网站发布有明确用途、可交付版本、真实测试记录和使用边界的个人 AI 工具成果。当前公开内容只有 Any-to-MD v0.1.0-candidate；更多工具只有在完成整理与验证后才会出现。</p></div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>收录标准</h2></div>
          <div className="standard-list">
            <article><span>01</span><div><h3>用途明确</h3><p>能够说明解决什么问题、适合哪些场景，以及不适合做什么。</p></div></article>
            <article><span>02</span><div><h3>版本可追溯</h3><p>页面、ZIP、GitHub 权威版本和更新记录之间保持一致。</p></div></article>
            <article><span>03</span><div><h3>验证有依据</h3><p>只陈述已经完成的测试，不用评分、下载量或模糊背书替代证据。</p></div></article>
            <article><span>04</span><div><h3>限制不隐藏</h3><p>隐私风险、失败结果和待验证环境都与下载入口一起公开。</p></div></article>
          </div>
        </section>

        <section className="about-section site-wrap channel-section">
          <div className="about-copy"><h2>三个渠道怎样分工</h2><p>公众号、GitHub 与网站承担不同职责，避免同一份内容被机械复制到各处。</p></div>
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
