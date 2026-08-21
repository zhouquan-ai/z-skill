export const toolIconKeys = [
  "file-convert",
  "web-read",
  "article-read",
  "secure-search",
  "eye-break",
  "screen-keep",
] as const;

export type ToolIconKey = (typeof toolIconKeys)[number];

export const toolIconTones = ["indigo", "sky", "teal", "violet"] as const;

export type ToolIconTone = (typeof toolIconTones)[number];
