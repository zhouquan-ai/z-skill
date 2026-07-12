import Link from "next/link";
import { tools } from "../../tool-data";

const tool = tools[0];

export default function AnyToMdPage() {
  return (
    <main className="detail-page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="返回 z-skill 首页">
            <span className="brand-mark">z</span>
            <span>z-skill</span>
          </Link>
          <nav className="breadcrumb" aria-label="面包屑">
            <Link href="/">工具目录</Link><span>/</span><span>Any-to-MD</span>
          </nav>
        </div>
      </header>

      <section className="detail-intro">
        <div className="detail-mark" aria-hidden="true">MD</div>
        <div className="detail-title">
          <div className="tool-title-line">
            <span className="tag neutral">{tool.type}</span>
            <span className="tag candidate">{tool.status}</span>
          </div>
          <h1>{tool.name}</h1>
          <p>{tool.summary}</p>
          <div className="detail-meta">
            <span>{tool.version}</span><span>更新于 {tool.updated}</span><span>{tool.category}</span>
          </div>
        </div>
        <div className="detail-download">
          <a className="button primary large" href={tool.download} download>下载候选版 ZIP</a>
          <span>完整包 · 约 337 KB</span>
        </div>
      </section>

      <nav className="detail-tabs" aria-label="详情页章节">
        <a href="#overview">概述</a>
        <a href="#usage">使用说明</a>
        <a href="#versions">版本记录</a>
        <a href="#limits">测试与限制</a>
      </nav>

      <div className="detail-layout">
        <article className="detail-content">
          <section id="overview">
            <p className="section-label">OVERVIEW</p>
            <h2>让基础资料脱离单一 AI 平台</h2>
            <p>PDF、Word、Excel和图片并不适合被不同AI产品长期调用。Any-to-MD把格式识别、内容转换、结构修复和质量扫描组织成一条可复核流程，让Markdown成为可以迁移、维护和持续复用的衍生资料。</p>
            <div className="notice"><strong>重要边界</strong><span>Markdown不替代原文件、签章、公式、批注、修订记录或法律证据原貌。</span></div>
          </section>

          <section id="usage">
            <p className="section-label">HOW TO USE</p>
            <h2>下载后怎样使用</h2>
            <ol className="steps">
              <li><span>01</span><p>解压 ZIP，并先阅读根目录 README、隐私说明和已知限制。</p></li>
              <li><span>02</span><p>把 <code>skill/any-to-md</code> 复制到目标 Agent 的 skills 目录。</p></li>
              <li><span>03</span><p>远程转换前确认文件可以上传第三方服务；敏感资料不要直接上传。</p></li>
              <li><span>04</span><p>转换后运行本地修复和质量扫描，并逐项对照原文件。</p></li>
            </ol>
          </section>

          <section id="versions">
            <p className="section-label">CHANGELOG</p>
            <h2>版本记录</h2>
            <div className="version-card">
              <div><strong>{tool.version}</strong><span>{tool.updated}</span></div>
              <p>首个公开候选包。包含 Skill、转换脚本、格式修复、质量扫描、说明文件与脱敏测试材料。</p>
            </div>
          </section>

          <section id="limits">
            <p className="section-label">TESTS & LIMITS</p>
            <h2>测试与已知限制</h2>
            <div className="verification-table" role="table" aria-label="格式验证状态">
              {tool.verified.map((format) => <div role="row" key={format}><span role="cell">{format}</span><strong role="cell">本仓库已验证</strong></div>)}
              <div role="row"><span role="cell">DOCX</span><strong role="cell" className="pending">轻量接口本轮失败</strong></div>
              <div role="row"><span role="cell">PPT / PPTX</span><strong role="cell" className="pending">尚未验证</strong></div>
            </div>
            <ul className="boundary-list">
              <li>精准接口因现有私人 Token 返回 401，尚未完成本轮复验。</li>
              <li>Codex 与 Claude 目标环境的实际安装触发仍待验证。</li>
              <li>复杂合并表格、OCR错误和语义结构必须回看原件。</li>
              <li>默认转换路径会把文件上传至 MinerU，并非纯本地处理。</li>
            </ul>
          </section>
        </article>

        <aside className="detail-aside" aria-label="发布信息">
          <h2>发布信息</h2>
          <dl>
            <div><dt>当前版本</dt><dd>{tool.version}</dd></div>
            <div><dt>发布状态</dt><dd>{tool.status}</dd></div>
            <div><dt>作者</dt><dd>周全</dd></div>
            <div><dt>许可证</dt><dd>MIT</dd></div>
            <div><dt>远程解析</dt><dd>MinerU</dd></div>
          </dl>
          <div className="aside-note"><strong>隐私提示</strong><p>默认路径可能把原文件上传至第三方服务。处理客户资料、案件材料或其他敏感信息前，应先完成脱敏并确认上传权限。</p></div>
          <a className="button primary aside-button" href={tool.download} download>下载 ZIP</a>
        </aside>
      </div>

      <footer className="site-footer">
        <p><strong>z-skill</strong> · 版本与限制以本页说明为准</p>
        <Link href="/">← 返回工具目录</Link>
      </footer>
    </main>
  );
}
