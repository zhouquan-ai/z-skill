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
            <h1>全部工具</h1>
            <p>按名称或用途搜索，并按类型和发布状态筛选。</p>
          </div>
        </section>
        <ToolCatalog initialQuery={q} />
      </main>
      <SiteFooter />
    </>
  );
}
