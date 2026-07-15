"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { catalogUpdated, compareToolsByUpdated, getPackageModeLabel, getVerifiedFormats, tools, toolStatuses, toolTypes } from "./tool-data";

type SortMode = "recent" | "name";

export function ToolCatalog({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<(typeof toolTypes)[number]>("全部");
  const [status, setStatus] = useState<(typeof toolStatuses)[number]>("全部状态");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortMode>("recent");

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tools
      .filter((tool) => {
        const searchable = `${tool.name} ${tool.summary} ${tool.category} ${getVerifiedFormats(tool).join(" ")} ${tool.components.map((item) => item.name).join(" ")} ${tool.dependencies.map((item) => item.name).join(" ")}`.toLowerCase();
        const matchesType = activeType === "全部" || tool.type === activeType;
        const matchesStatus = status === "全部状态" || tool.status === status;
        return matchesType && matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
      })
      .toSorted((a, b) => sort === "name" ? a.name.localeCompare(b.name) : compareToolsByUpdated(a, b));
  }, [activeType, query, sort, status]);

  function clearFilters() {
    setActiveType("全部");
    setStatus("全部状态");
    setQuery("");
    setSort("recent");
    router.replace("/tools");
  }

  return (
    <section className="catalog site-wrap" aria-labelledby="catalog-title">
      <h2 className="sr-only" id="catalog-title">工具目录</h2>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="search-icon" aria-hidden="true" />
          <span className="sr-only">搜索工具</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工具名称、用途或组件" type="search" />
        </label>
        <div className="filter-group" aria-label="按成果类型筛选">
          {toolTypes.map((type) => (
            <button key={type} className={activeType === type ? "active" : ""} type="button" aria-pressed={activeType === type} onClick={() => setActiveType(type)}>{type === "全部" ? "全部类型" : type}</button>
          ))}
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as (typeof toolStatuses)[number])} aria-label="按发布状态筛选">
          {toolStatuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="排序方式">
          <option value="recent">最近更新</option>
          <option value="name">名称</option>
        </select>
      </div>

      <div className="results-heading"><span>共 {visibleTools.length} 项</span><span>更新于 {catalogUpdated}</span></div>

      <div className="tool-list" aria-live="polite">
        {visibleTools.map((tool) => (
          <article className="tool-card" key={tool.slug}>
            <div className="tool-glyph" aria-hidden="true">{tool.glyph}</div>
            <div className="tool-copy">
              <div className="tool-title-line"><h3>{tool.name}</h3><span className="tag neutral">{tool.type}</span><span className="tag neutral">{getPackageModeLabel(tool.packageMode)}</span><span className={`tag ${tool.statusTone}`}>{tool.status}</span></div>
              <p>{tool.summary}</p>
              <div className="verified-row"><span>已验证</span>{getVerifiedFormats(tool).map((format) => <code key={format}>{format}</code>)}</div>
              <div className="tool-submeta"><span>{tool.category}</span><strong>{tool.version}</strong><span>更新于 {tool.updated}</span></div>
            </div>
            <div className="tool-actions"><Link className="button primary" href={`/tools/${tool.slug}`}>查看详情</Link><a className="text-link" href={tool.download.path} download>下载 ZIP</a></div>
          </article>
        ))}
        {visibleTools.length === 0 && <div className="empty-result"><p>没有找到匹配的工具。</p><button type="button" onClick={clearFilters}>清除搜索与筛选</button></div>}
      </div>
    </section>
  );
}
