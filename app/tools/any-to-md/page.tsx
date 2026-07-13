import Link from "next/link";
import { CopyPrompt } from "../../CopyPrompt";
import { SiteFooter, SiteHeader } from "../../SiteChrome";
import { tools } from "../../tool-data";

const tool = tools[0];
const installPrompt = `请安装 Any-to-MD v0.1.0-candidate。

权威候选包地址：
https://raw.githubusercontent.com/zzzq8848-ai/z-skill/main/public/downloads/any-to-md-v0.1.0-candidate.zip

1. 先检查当前环境支持的 skills 目录与安装规则，不要猜测路径。
2. 从上述地址下载并解压候选版 ZIP，阅读 README、PRIVACY.md 和 KNOWN_LIMITATIONS.md。
3. 将 skill/any-to-md 放入当前环境认可的 skills 目录。
4. 不要上传任何敏感文件进行测试；默认远程转换可能把文件发送至 MinerU。
5. 安装后只做无敏感信息的最小触发检查，并报告下载来源、实际安装路径、测试结果与失败原因。

如果当前环境不支持该 Skill，请停止，不要伪造成功结果。`;

export default function AnyToMdPage() {
  return (
    <>
      <SiteHeader active="tools" />
      <main>
        <div className="breadcrumb-row site-wrap"><Link href="/tools">全部工具</Link><span>/</span><span>Any-to-MD</span></div>

        <section className="detail-hero site-wrap">
          <div className="detail-glyph" aria-hidden="true">MD</div>
          <div className="detail-title">
            <div className="tag-group"><span className="tag neutral">{tool.type}</span><span className="tag candidate">{tool.status}</span></div>
            <h1>{tool.name}</h1>
            <p>把常见文件转换为可维护、可复核的 Markdown 基础资料。</p>
            <div className="detail-meta"><strong>{tool.version}</strong><span>作者：周全</span><span>MIT License</span><span>更新于 {tool.updated}</span></div>
          </div>
          <a className="button primary large" href={tool.download} download>下载候选版 ZIP</a>
        </section>

        <div className="detail-layout site-wrap">
          <article className="detail-content">
            <section>
              <p className="eyebrow">OVERVIEW</p>
              <h2>让基础资料脱离单一 AI 平台</h2>
              <p>Any-to-MD 把格式识别、内容转换、结构修复和质量扫描组织成一条可复核流程。生成的 Markdown 是衍生资料，不能替代原文件、签章、公式、批注或修订记录。</p>
              <div className="scenario-grid">
                <div>把研究报告与合同附件整理为可检索的 Markdown</div>
                <div>为知识库准备可跨平台迁移的基础资料</div>
                <div>将表格和图片转换后继续人工复核与修订</div>
                <div>为 Agent 提供结构更稳定的长期输入</div>
              </div>
            </section>

            <section>
              <p className="eyebrow">VERIFIED FORMATS</p>
              <h2>当前测试状态</h2>
              <p>状态仅对应本仓库测试，不代表所有复杂文件都能无误转换。</p>
              <div className="verification-table" role="table" aria-label="格式验证状态">
                {tool.verified.map((format) => <div role="row" key={format}><code role="cell">{format}</code><strong role="cell">本仓库已验证</strong></div>)}
                <div role="row"><code role="cell">DOCX</code><strong role="cell" className="pending">轻量接口本轮失败</strong></div>
                <div role="row"><code role="cell">PPT / PPTX</code><strong role="cell" className="pending">尚未验证</strong></div>
              </div>
            </section>

            <section>
              <p className="eyebrow">HOW TO USE</p>
              <h2>下载后怎样使用</h2>
              <ol className="steps">
                <li><span>01</span><p>解压 ZIP，并先阅读 README、隐私说明和已知限制。</p></li>
                <li><span>02</span><p>把 <code>skill/any-to-md</code> 复制到目标 Agent 认可的 skills 目录。</p></li>
                <li><span>03</span><p>远程转换前确认文件可以上传第三方服务；敏感资料不要直接上传。</p></li>
                <li><span>04</span><p>转换后运行本地修复和质量扫描，并逐项对照原文件。</p></li>
              </ol>
            </section>

            <section>
              <p className="eyebrow">INSTALL WITH AN AGENT</p>
              <h2>复制给 Agent 的安装 Prompt</h2>
              <p>要求 Agent 先检查环境和说明文件，再执行安装；实际触发仍待目标环境验收。</p>
              <CopyPrompt prompt={installPrompt} />
            </section>

            <section>
              <p className="eyebrow">LIMITS</p>
              <h2>已知限制</h2>
              <p>精准接口因私人 Token 返回 401，尚未复验；Codex 与 Claude 的实际安装触发仍待验证。复杂表格、OCR 和语义结构必须回看原件。</p>
            </section>
          </article>

          <aside className="download-panel" aria-label="下载与发布信息">
            <h2>下载与发布信息</h2>
            <dl>
              <div><dt>当前版本</dt><dd>{tool.version}</dd></div>
              <div><dt>发布状态</dt><dd>{tool.status}</dd></div>
              <div><dt>作者</dt><dd>周全</dd></div>
              <div><dt>许可证</dt><dd>MIT</dd></div>
              <div><dt>文件类型</dt><dd>ZIP</dd></div>
            </dl>
            <div className="privacy-note"><strong>隐私提示</strong><p>默认转换可能把原文件上传至 MinerU。处理客户、案件或其他敏感资料前，须先脱敏并确认上传权限。</p></div>
            <a className="button primary large" href={tool.download} download>下载候选版 ZIP</a>
            <p className="panel-footnote">版本、测试与限制以本页说明为准</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
