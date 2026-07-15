import { SiteFooter, SiteHeader } from "../SiteChrome";
import { tools } from "../tool-data";

const currentReleases = tools.map((tool) => `${tool.name} ${tool.version}`).join("、");

export default function AboutPage() {
  return (
    <>
      <SiteHeader active="about" />
      <main className="about-page" id="main-content">
        <section className="about-hero site-wrap">
          <p className="eyebrow">ABOUT</p>
          <h1>周全的 AI 工具发布页</h1>
          <p>这里仅发布已完成基本测试、可以公开交付的作品。网站不承担文章发布、用户投稿、社区或排行功能。</p>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>发布什么</h2><p>公开作品须具备用途说明、可交付版本、测试记录和边界说明。当前发布 {currentReleases}。</p></div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>发布阶段</h2><p>发布阶段表示版本成熟度；“已验证”仅适用于已经完成测试的具体格式或场景。</p></div>
          <div className="release-stage-grid">
            <article><span className="tag stable">正式版</span><h3>达到既定发布门槛</h3><p>使用稳定版本号，作为当前对外提供的正式版本。</p></article>
            <article><span className="tag candidate">公开候选</span><h3>已经公开，可供使用</h3><p>版本、测试和限制均已公开，尚未转为正式版本号。</p></article>
          </div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>收录标准</h2></div>
          <div className="standard-list">
            <article><span>01</span><div><h3>用途明确</h3><p>说明解决的问题、适用场景和不适用边界。</p></div></article>
            <article><span>02</span><div><h3>版本可追溯</h3><p>页面、ZIP、GitHub 版本和更新记录保持一致。</p></div></article>
            <article><span>03</span><div><h3>测试有依据</h3><p>测试结论须对应具体格式、场景或结果。</p></div></article>
            <article><span>04</span><div><h3>边界如实说明</h3><p>隐私风险、失败结果和待验证项均随版本公开。</p></div></article>
          </div>
        </section>

        <section className="about-section site-wrap channel-section">
          <div className="about-copy"><h2>渠道分工</h2></div>
          <div className="channel-grid">
            <article><span>公众号</span><h3>解释问题与过程</h3><p>记录为什么做、怎样判断，以及真实建设经历。</p></article>
            <article><span>GitHub</span><h3>保存权威版本</h3><p>承载代码、包、许可证、测试与精确技术差异。</p></article>
            <article><span>z-skill</span><h3>提供说明与下载</h3><p>集中提供作品说明、安装入口和当前版本下载。</p></article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
