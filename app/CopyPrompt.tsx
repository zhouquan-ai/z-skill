"use client";

import { useRef, useState } from "react";

export function CopyPrompt({ prompt }: { prompt: string }) {
  const promptRef = useRef<HTMLPreElement>(null);
  const [label, setLabel] = useState("复制 Prompt");
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await Promise.race([
        navigator.clipboard.writeText(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Clipboard timeout")), 800)),
      ]);
      setLabel("已复制");
      setStatus("安装 Prompt 已复制到剪贴板");
      setTimeout(() => setLabel("复制 Prompt"), 2000);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      if (promptRef.current && selection) {
        range.selectNodeContents(promptRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setLabel("请手动复制");
      setStatus("浏览器未允许自动复制，Prompt 文本已选中");
    }
  }

  return (
    <div className="prompt-panel">
      <div className="prompt-head">
        <div>
          <strong>复制给 Agent</strong>
          <span>保留环境检查、隐私提示与失败回报要求</span>
        </div>
        <button type="button" onClick={copy}>{label}</button>
      </div>
      <pre ref={promptRef}>{prompt}</pre>
      <span className="sr-only" aria-live="polite">{status}</span>
    </div>
  );
}
