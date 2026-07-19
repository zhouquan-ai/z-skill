import type { ReactNode } from "react";
import type { ToolIconKey, ToolIconTone } from "./tool-icon-registry";

const iconArtwork: Record<ToolIconKey, ReactNode> = {
  "file-convert": (
    <>
      <path d="M6.5 3.5h7l4 4v13h-11z" />
      <path d="M13.5 3.5v4h4" />
      <path d="M8.5 14.5h6" />
      <path d="m12.5 11.5 3 3-3 3" />
    </>
  ),
  "web-read": (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <path d="M3.5 8h17" />
      <path d="M7 12h10M7 15.5h7" />
    </>
  ),
  "article-read": (
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <path d="M8 7h8M8 11h8M8 15h5" />
      <path d="M8 18h3" />
    </>
  ),
  "secure-search": (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m14.5 14.5 5 5" />
      <path d="m7.5 10 1.7 1.7 3.5-3.5" />
    </>
  ),
};

export function ToolIcon({
  iconKey,
  iconTone,
  className,
}: {
  iconKey: ToolIconKey;
  iconTone: ToolIconTone;
  className: string;
}) {
  return (
    <span className={`tool-icon ${className}`} data-icon-key={iconKey} data-icon-tone={iconTone} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {iconArtwork[iconKey]}
      </svg>
    </span>
  );
}
