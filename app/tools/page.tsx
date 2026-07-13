import { SiteFooter, SiteHeader } from "../SiteChrome";
import { ToolCatalog } from "../ToolCatalog";

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <>
      <SiteHeader active="tools" />
      <main id="main-content">
        <section className="directory-hero site-wrap">
          <div>
            <p className="eyebrow">ALL RELEASES</p>
            <h1>全部工具</h1>
            <p>按真实名称、用途、类型与发布状态查找当前公开成果。</p>
          </div>
        </section>
        <ToolCatalog initialQuery={q} />
      </main>
      <SiteFooter />
    </>
  );
}
