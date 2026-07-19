import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyPrompt } from "../../CopyPrompt";
import { SiteFooter, SiteHeader } from "../../SiteChrome";
import { ToolIcon } from "../../ToolIcon";
import { buildInstallPrompt, getIncludedIn, getPackageModeLabel, getToolByLegacySlug, getToolBySlug, tools } from "../../tool-data";

type ToolPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const tool = getToolBySlug(slug) ?? getToolByLegacySlug(slug);
  if (!tool) return {};

  return {
    title: `${tool.name}｜z-skill`,
    description: `${tool.detailSummary} 查看版本、测试、隐私、限制与下载方式。`,
  };
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const slug = (await params).slug;
  const tool = getToolBySlug(slug);
  const migratedTool = getToolByLegacySlug(slug);
  if (!tool && migratedTool) redirect(`/tools/${migratedTool.slug}`);
  if (!tool) notFound();

  const installPrompt = buildInstallPrompt(tool);
  const includedIn = getIncludedIn(tool.slug);
  const hasComposition = tool.components.length > 0 || includedIn.length > 0;

  return (
    <>
      <SiteHeader active="tools" />
      <main id="main-content">
        <div className="breadcrumb-row site-wrap"><Link href="/tools">全部工具</Link><span>/</span><span>{tool.name}</span></div>

        <section className="detail-hero site-wrap">
          <ToolIcon className="detail-glyph" iconKey={tool.iconKey} iconTone={tool.iconTone} />
          <div className="detail-title">
            <div className="tag-group"><span className="tag neutral">{tool.type}</span><span className="tag neutral">{getPackageModeLabel(tool.packageMode)}</span><span className={`tag ${tool.statusTone}`}>{tool.status}</span></div>
            <h1>{tool.name}</h1>
            <p>{tool.detailSummary}</p>
            <div className="detail-meta"><strong>{tool.version}</strong><span>作者：{tool.author}</span><span>{tool.license} License</span><span>更新于 {tool.updated}</span></div>
          </div>
          <a className="button primary large" href={tool.download.path} download>{tool.download.label}</a>
        </section>

        <div className="detail-layout site-wrap">
          <article className="detail-content">
            <nav className="detail-nav" aria-label="本页内容">
              <span>本页</span>
              <a href="#overview">核心用途</a>
              {hasComposition && <a href="#composition">组成与依赖</a>}
              <a href="#testing">测试与验证</a>
              <a href="#usage">使用步骤</a>
              <a href="#install">安装指令</a>
              <a href="#limits">已知限制</a>
            </nav>

            <section id="overview">
              <h2>{tool.overview.title}</h2>
              <p>{tool.overview.description}</p>
              <div className="scenario-grid">
                {tool.overview.scenarios.map((scenario) => <div key={scenario}>{scenario}</div>)}
              </div>
            </section>

            {hasComposition && (
              <section id="composition">
                <h2>组成与依赖</h2>
                {tool.components.length > 0 && (
                  <div className="relation-grid">
                    {tool.components.map((component) => {
                      const content = (
                        <>
                          <div className="relation-card-head"><strong>{component.name}</strong><span>{component.type === "Internal" ? "内部组件" : component.type}</span></div>
                          {component.version && <code>{component.version}</code>}
                          <p>{component.summary}</p>
                        </>
                      );
                      return component.slug
                        ? <Link className="relation-card linked" href={`/tools/${component.slug}`} key={component.name}>{content}</Link>
                        : <div className="relation-card" key={component.name}>{content}</div>;
                    })}
                  </div>
                )}
                {includedIn.length > 0 && (
                  <div className="included-note"><strong>也包含在</strong>{includedIn.map((parent) => <Link href={`/tools/${parent.slug}`} key={parent.slug}>{parent.name} {parent.version}</Link>)}</div>
                )}
                {tool.dependencies.length > 0 && (
                  <div className="dependency-list" aria-label="运行依赖">
                    <strong>运行依赖</strong>
                    {tool.dependencies.map((dependency) => <span key={dependency.name}>{dependency.name}<small>{dependency.role}</small></span>)}
                  </div>
                )}
              </section>
            )}

            <section id="testing">
              <h2>测试与验证</h2>
              <p>{tool.testNote}</p>
              <div className="verification-table" role="table" aria-label="格式验证状态">
                {tool.formatTests.map((test) => (
                  <div role="row" key={test.format}>
                    <code role="cell">{test.format}</code>
                    <strong role="cell" className={test.status === "verified" ? undefined : test.status}>{test.label}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section id="usage">
              <h2>使用步骤</h2>
              <ol className="steps">
                {tool.usageSteps.map((step, index) => (
                  <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>
                ))}
              </ol>
            </section>

            <section id="install">
              <h2>Agent 安装指令</h2>
              <p>{tool.install.intro}</p>
              <CopyPrompt prompt={installPrompt} />
            </section>

            <section id="limits">
              <h2>已知限制</h2>
              <p>{tool.limitations}</p>
            </section>
          </article>

          <aside className="download-panel" aria-label="下载与发布信息">
            <h2>下载与发布信息</h2>
            <dl>
              <div><dt>当前版本</dt><dd>{tool.version}</dd></div>
              <div><dt>技术标识</dt><dd><code>{tool.slug}</code></dd></div>
              <div><dt>发布状态</dt><dd>{tool.status}</dd></div>
              <div><dt>分发形式</dt><dd>{getPackageModeLabel(tool.packageMode)}</dd></div>
              <div><dt>作者</dt><dd>{tool.author}</dd></div>
              <div><dt>许可证</dt><dd>{tool.license}</dd></div>
              <div><dt>文件类型</dt><dd>{tool.download.fileType}</dd></div>
              <div className="stacked"><dt>验证环境</dt><dd>{tool.environmentNote}</dd></div>
            </dl>
            <div className="checksum-note"><strong>文件校验</strong><span>SHA-256</span><code>{tool.download.sha256}</code></div>
            <div className="privacy-note"><strong>隐私与数据处理</strong><p>{tool.privacy}</p></div>
            <a className="button primary large" href={tool.download.path} download>{tool.download.label}</a>
            <p className="panel-footnote">版本、测试与限制以本页说明为准</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
