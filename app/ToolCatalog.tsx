"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tools, toolTypes } from "./tool-data";

export function ToolCatalog() {
  const [activeType, setActiveType] = useState<(typeof toolTypes)[number]>("全部");
  const [query, setQuery] = useState("");

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesType = activeType === "全部" || tool.type === activeType;
      const searchable = `${tool.name} ${tool.summary} ${tool.verified.join(" ")}`.toLowerCase();
      return matchesType && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeType, query]);

  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="section-index" aria-hidden="true">
        02
      </div>
      <div className="catalog-main">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">TOOL DIRECTORY / 工具目录</p>
            <h2 id="catalog-title">可下载成果</h2>
          </div>
          <p className="catalog-count">{String(visibleTools.length).padStart(2, "0")} 项</p>
        </div>

        <div className="catalog-controls">
          <div className="filter-group" aria-label="按成果类型筛选">
            {toolTypes.map((type) => (
              <button
                className="filter-button"
                key={type}
                type="button"
                aria-pressed={activeType === type}
                onClick={() => setActiveType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="sr-only">搜索工具</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索名称、用途或格式"
              type="search"
            />
            <span aria-hidden="true">⌕</span>
          </label>
        </div>

        <div className="tool-list" aria-live="polite">
          {visibleTools.map((tool, index) => (
            <article className="tool-row" key={tool.slug}>
              <div className="tool-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="tool-mark" aria-hidden="true">
                MD
              </div>
              <div className="tool-copy">
                <div className="tool-meta">
                  <span>{tool.type}</span>
                  <span className="status-dot">{tool.status}</span>
                  <span>{tool.version}</span>
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.summary}</p>
                <div className="verified-list" aria-label="本仓库已验证格式">
                  <span className="verified-label">VERIFIED</span>
                  {tool.verified.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="tool-actions">
                <Link className="text-link" href={`/tools/${tool.slug}`}>
                  查看详情 <span aria-hidden="true">↗</span>
                </Link>
                <a className="download-button" href={tool.download} download>
                  下载 ZIP <span aria-hidden="true">↓</span>
                </a>
              </div>
            </article>
          ))}

          {visibleTools.length === 0 && (
            <div className="empty-result">
              <p>没有找到匹配的成果。</p>
              <button type="button" onClick={() => { setActiveType("全部"); setQuery(""); }}>
                清除筛选
              </button>
            </div>
          )}

          <div className="next-slot" aria-label="下一项工具正在整理">
            <span className="next-number">02</span>
            <div>
              <p className="eyebrow">NEXT RELEASE</p>
              <p>下一项工具正在整理</p>
            </div>
            <span className="progress-line" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
