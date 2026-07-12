"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toolEnvironments, tools, toolStatuses, toolTypes } from "./tool-data";

export function ToolCatalog() {
  const [activeType, setActiveType] = useState<(typeof toolTypes)[number]>("全部");
  const [environment, setEnvironment] = useState<(typeof toolEnvironments)[number]>("全部环境");
  const [status, setStatus] = useState<(typeof toolStatuses)[number]>("全部状态");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("全部");

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const searchable = `${tool.name} ${tool.summary} ${tool.category} ${tool.verified.join(" ")}`.toLowerCase();
      const matchesType = activeType === "全部" || tool.type === activeType;
      const matchesEnvironment = environment === "全部环境" || tool.environments.includes(environment);
      const matchesStatus = status === "全部状态" || tool.status === status;
      return matchesType && matchesEnvironment && matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeType, environment, query, status]);

  function clearFilters() {
    setActiveType("全部");
    setEnvironment("全部环境");
    setStatus("全部状态");
    setQuery("");
  }

  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <h2 className="sr-only" id="catalog-title">工具目录</h2>
      <div className="catalog-toolbar">
        <div className="sort-tabs" aria-label="排序方式">
          {["全部", "推荐", "最近更新", "名称"].map((item) => (
            <button
              className={sort === item ? "active" : ""}
              key={item}
              type="button"
              aria-pressed={sort === item}
              onClick={() => setSort(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="catalog-filters">
          <select value={activeType} onChange={(event) => setActiveType(event.target.value as (typeof toolTypes)[number])} aria-label="按成果类型筛选">
            {toolTypes.map((type) => <option key={type} value={type}>{type === "全部" ? "全部类型" : type}</option>)}
          </select>
          <select value={environment} onChange={(event) => setEnvironment(event.target.value as (typeof toolEnvironments)[number])} aria-label="按适配环境筛选">
            {toolEnvironments.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as (typeof toolStatuses)[number])} aria-label="按发布状态筛选">
            {toolStatuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="search-field">
            <span className="sr-only">搜索工具</span>
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工具" type="search" />
          </label>
          <div className="view-toggle" aria-label="视图模式">
            <button className="active" type="button" aria-label="列表视图" aria-pressed="true">☷</button>
            <button type="button" aria-label="卡片视图" aria-pressed="false" disabled>⊞</button>
          </div>
        </div>
      </div>

      <div className="results-heading">
        <span>找到 {visibleTools.length} 项结果</span>
        <span>{sort === "全部" ? "按推荐排序" : `按${sort}排序`}</span>
      </div>

      <div className="tool-list" aria-live="polite">
        {visibleTools.map((tool) => (
          <article className="tool-row" key={tool.slug}>
            <div className="tool-mark" aria-hidden="true">MD</div>
            <div className="tool-copy">
              <div className="tool-title-line">
                <h3>{tool.name}</h3>
                <span className="tag neutral">{tool.type}</span>
                <span className="tag candidate">{tool.status}</span>
              </div>
              <p>{tool.summary}</p>
              <div className="tool-submeta">
                <span>{tool.category}</span>
                <span>{tool.environmentNote}</span>
                <span>更新于 {tool.updated}</span>
              </div>
            </div>
            <div className="tool-actions">
              <span className="version">{tool.version}</span>
              <div>
                <Link className="button secondary" href={`/tools/${tool.slug}`}>查看详情</Link>
                <a className="button primary" href={tool.download} download>下载 ZIP</a>
              </div>
            </div>
          </article>
        ))}

        {visibleTools.length === 0 && (
          <div className="empty-result">
            <p>没有与当前条件匹配的工具。</p>
            <button type="button" onClick={clearFilters}>清除筛选</button>
          </div>
        )}
      </div>

      <div className="next-slot">
        <strong>更多工具正在整理</strong>
        <span>Workflow、Agent 与实用工具将在完成验证后陆续发布。</span>
      </div>
    </section>
  );
}
