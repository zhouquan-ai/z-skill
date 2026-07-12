import Link from "next/link";
import { tools } from "../../tool-data";

const tool = tools[0];

export default function AnyToMdPage() {
  return (
    <main className="detail-page">
      <header className="site-header detail-header">
        <Link className="brand" href="/" aria-label="返回 z-skill 首页">
          <span className="brand-z">z</span>-skill
        </Link>
        <nav aria-label="面包屑">
          <Link href="/">工具目录</Link>
          <span>/</span>
          <span>Any-to-MD</span>
        </nav>
      </header>

      <section className="detail-hero">
        <div className="detail-number" aria-hidden="true">01</div>
        <div className="detail-title-block">
          <div className="tool-meta">
            <span>{tool.type}</span>
            <span className="status-dot">{tool.status}</span>
            <span>{tool.version}</span>
          </div>
          <h1>Any-to-MD</h1>
          <p className="detail-lead">{tool.summary}</p>
          <div className="detail-actions">
            <a className="download-button large" href={tool.download} download>
              下载候选版 ZIP <span aria-hidden="true">↓</span>
            </a>
            <span>更新于 {tool.updated}</span>
          </div>
        </div>
        <div className="detail-mark" aria-hidden="true">MD</div>
      </section>

      <section className="detail-grid" aria-label="Any-to-MD 说明">
        <div className="detail-aside">
          <p className="eyebrow">RELEASE NOTES</p>
          <dl>
            <div><dt>当前版本</dt><dd>{tool.version}</dd></div>
            <div><dt>发布状态</dt><dd>{tool.status}</dd></div>
            <div><dt>许可证</dt><dd>MIT</dd></div>
            <div><dt>远程解析</dt><dd>MinerU</dd></div>
          </dl>
        </div>
        <div className="detail-content">
          <section>
            <p className="eyebrow">01 / PROBLEM</p>
            <h2>它解决什么问题</h2>
            <p>
              PDF、Word、Excel和图片并不适合被不同AI产品长期调用。Any-to-MD把转换、结构修复和质量扫描组织成一条可复核流程，让Markdown成为可以迁移和维护的衍生资料。
            </p>
            <p className="notice">Markdown不替代原文件、签章、公式、批注、修订记录或法律证据原貌。</p>
          </section>

          <section>
            <p className="eyebrow">02 / VERIFIED</p>
            <h2>本轮验证状态</h2>
            <div className="verification-table" role="table" aria-label="格式验证状态">
              {tool.verified.map((format) => (
                <div role="row" key={format}>
                  <span role="cell">{format}</span><strong role="cell">本仓库已验证</strong>
                </div>
              ))}
              <div role="row"><span role="cell">DOCX</span><strong role="cell" className="pending">轻量接口本轮失败</strong></div>
              <div role="row"><span role="cell">PPT / PPTX</span><strong role="cell" className="pending">尚未验证</strong></div>
            </div>
          </section>

          <section>
            <p className="eyebrow">03 / USE</p>
            <h2>下载后怎样使用</h2>
            <ol className="steps">
              <li>解压ZIP，并阅读根目录README、隐私说明和已知限制。</li>
              <li>把 <code>skill/any-to-md</code> 复制到目标Agent的skills目录。</li>
              <li>远程转换前确认文件可以上传第三方服务；敏感资料不要直接上传。</li>
              <li>完成转换后运行本地修复和质量扫描，并逐项对照原文件。</li>
            </ol>
          </section>

          <section>
            <p className="eyebrow">04 / BOUNDARY</p>
            <h2>当前边界</h2>
            <ul className="boundary-list">
              <li>精准接口因现有私人Token返回401，尚未完成本轮复验。</li>
              <li>Codex与Claude目标环境的实际安装触发仍待验证。</li>
              <li>复杂合并表格、OCR错误和语义结构必须回看原件。</li>
              <li>默认转换路径会把文件上传至MinerU，并非纯本地处理。</li>
            </ul>
          </section>

          <div className="final-download">
            <div>
              <p className="eyebrow">DOWNLOAD / {tool.version}</p>
              <h2>下载完整候选包</h2>
              <p>包含Skill、脚本、README、测试矩阵、隐私说明、已知限制和脱敏样例。</p>
            </div>
            <a className="download-button large" href={tool.download} download>下载 ZIP <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <Link href="/">← 返回工具目录</Link>
        <p>z-skill · 版本与限制以本页说明为准</p>
      </footer>
    </main>
  );
}
