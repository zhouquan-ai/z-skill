import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyPrompt } from "../../CopyPrompt";
import { SiteFooter, SiteHeader } from "../../SiteChrome";
import { buildInstallPrompt, getToolBySlug, tools } from "../../tool-data";

type ToolPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug((await params).slug);
  if (!tool) return {};

  return {
    title: `${tool.name}｜z-skill`,
    description: `${tool.detailSummary} 查看版本、测试、隐私、限制与下载方式。`,
  };
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const tool = getToolBySlug((await params).slug);
  if (!tool) notFound();

  const installPrompt = buildInstallPrompt(tool);

  return (
    <>
      <SiteHeader active="tools" />
      <main>
        <div className="breadcrumb-row site-wrap"><Link href="/tools">全部工具</Link><span>/</span><span>{tool.name}</span></div>

        <section className="detail-hero site-wrap">
          <div className="detail-glyph" aria-hidden="true">{tool.glyph}</div>
          <div className="detail-title">
            <div className="tag-group"><span className="tag neutral">{tool.type}</span><span className={`tag ${tool.statusTone}`}>{tool.status}</span></div>
            <h1>{tool.name}</h1>
            <p>{tool.detailSummary}</p>
            <div className="detail-meta"><strong>{tool.version}</strong><span>作者：{tool.author}</span><span>{tool.license} License</span><span>更新于 {tool.updated}</span></div>
          </div>
          <a className="button primary large" href={tool.download.path} download>{tool.download.label}</a>
        </section>

        <div className="detail-layout site-wrap">
          <article className="detail-content">
            <section>
              <p className="eyebrow">OVERVIEW</p>
              <h2>{tool.overview.title}</h2>
              <p>{tool.overview.description}</p>
              <div className="scenario-grid">
                {tool.overview.scenarios.map((scenario) => <div key={scenario}>{scenario}</div>)}
              </div>
            </section>

            <section>
              <p className="eyebrow">VERIFIED FORMATS</p>
              <h2>当前测试状态</h2>
              <p>{tool.testNote}</p>
              <div className="verification-table" role="table" aria-label="格式验证状态">
                {tool.formatTests.map((test) => (
                  <div role="row" key={test.format}>
                    <code role="cell">{test.format}</code>
                    <strong role="cell" className={test.status === "verified" ? undefined : "pending"}>{test.label}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="eyebrow">HOW TO USE</p>
              <h2>下载后怎样使用</h2>
              <ol className="steps">
                {tool.usageSteps.map((step, index) => (
                  <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>
                ))}
              </ol>
            </section>

            <section>
              <p className="eyebrow">INSTALL WITH AN AGENT</p>
              <h2>复制给 Agent 的安装 Prompt</h2>
              <p>{tool.install.intro}</p>
              <CopyPrompt prompt={installPrompt} />
            </section>

            <section>
              <p className="eyebrow">LIMITS</p>
              <h2>已知限制</h2>
              <p>{tool.limitations}</p>
            </section>
          </article>

          <aside className="download-panel" aria-label="下载与发布信息">
            <h2>下载与发布信息</h2>
            <dl>
              <div><dt>当前版本</dt><dd>{tool.version}</dd></div>
              <div><dt>发布状态</dt><dd>{tool.status}</dd></div>
              <div><dt>作者</dt><dd>{tool.author}</dd></div>
              <div><dt>许可证</dt><dd>{tool.license}</dd></div>
              <div><dt>文件类型</dt><dd>{tool.download.fileType}</dd></div>
            </dl>
            <div className="privacy-note"><strong>隐私提示</strong><p>{tool.privacy}</p></div>
            <a className="button primary large" href={tool.download.path} download>{tool.download.label}</a>
            <p className="panel-footnote">版本、测试与限制以本页说明为准</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
