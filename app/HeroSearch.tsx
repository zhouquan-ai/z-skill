"use client";

import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function navigateToResults() {
    const value = query.trim();
    router.push(value ? `/tools?q=${encodeURIComponent(value)}` : "/tools");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToResults();
  }

  function submitWithEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    navigateToResults();
  }

  return (
    <form className="hero-search" onSubmit={submit} role="search">
      <label>
        <span className="search-icon" aria-hidden="true" />
        <span className="sr-only">搜索公开工具</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={submitWithEnter}
          placeholder="搜索工具名称或用途"
        />
      </label>
      <button type="submit">搜索工具</button>
    </form>
  );
}
