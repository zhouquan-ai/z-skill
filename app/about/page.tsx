import Link from "next/link";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export default function AboutPage() {
  return (
    <>
      <SiteHeader active="about" />
      <main className="about-page" id="main-content">
        <section className="about-hero site-wrap">
          <h1>关于 z-skill</h1>
          <p>z-skill 是周全的个人 AI 工具发布站，仅发布已完成基本测试、可以公开交付的作品。网站不承担文章发布、用户投稿、社区或排行功能。</p>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>发布什么</h2></div>
          <div className="about-body">
            <p>公开作品须具备用途说明、可交付版本、测试记录和边界说明。</p>
            <p>全部公开作品、当前版本与发布阶段，以<Link href="/tools">工具目录</Link>和各作品详情页为准。</p>
          </div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>作者与时效</h2></div>
          <div className="about-body">
            <p>公开作品由周全设计、整理或验证。每项工具的作者、版本、更新时间、测试记录和已知限制，以对应详情页为准。</p>
          </div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>发布阶段</h2><p>发布阶段表示版本成熟度；“已验证”仅适用于已经完成测试的具体格式或场景。</p></div>
          <div className="release-stage-grid">
            <article><span className="tag stable">正式版</span><h3>达到既定发布门槛</h3><p>使用稳定版本号，作为当前对外提供的正式版本。</p></article>
            <article><span className="tag candidate">公开候选</span><h3>已经公开，可供使用</h3><p>版本、测试和限制均已公开，尚未转为正式版本号。</p></article>
          </div>
        </section>

        <section className="about-section site-wrap">
          <div className="about-copy"><h2>收录标准</h2><p>只有同时满足以下四项，工具才进入公开目录。</p></div>
          <div className="standard-list">
            <article><span>01</span><div><h3>用途明确</h3><p>说明解决的问题、适用场景和不适用边界。</p></div></article>
            <article><span>02</span><div><h3>版本可追溯</h3><p>页面、ZIP、GitHub 版本和更新记录保持一致。</p></div></article>
            <article><span>03</span><div><h3>测试有依据</h3><p>测试结论须对应具体格式、场景或结果。</p></div></article>
            <article><span>04</span><div><h3>边界如实说明</h3><p>隐私风险、失败结果和待验证项均随版本公开。</p></div></article>
          </div>
        </section>

        <section className="about-section site-wrap channel-section">
          <div className="about-copy"><h2>渠道分工</h2><p>公众号解释过程，GitHub 保存版本，z-skill 完成交付。</p></div>
          <div className="channel-grid">
            <article>
              <span className="channel-label">微信公众号</span>
              <h3>法律人周全</h3>
              <p>发布与本站工具相关的实践文章、测试复盘和建设记录。</p>
              <div className="channel-meta">微信搜索「法律人周全」</div>
            </article>
            <article>
              <span className="channel-label">GitHub</span>
              <h3 className="channel-technical">zhouquan-ai / z-skill</h3>
              <p>保存代码、发布包、许可证、测试记录和版本差异。</p>
              <a className="channel-link" href="https://github.com/zhouquan-ai/z-skill" target="_blank" rel="noopener noreferrer">查看 GitHub 仓库 <span aria-hidden="true">↗</span></a>
            </article>
            <article>
              <span className="channel-label">网站</span>
              <h3 className="channel-technical">z-skill.com</h3>
              <p>集中提供工具说明、安装指令和当前版本下载。</p>
              <div className="channel-meta">当前站点</div>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
