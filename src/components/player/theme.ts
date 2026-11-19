import type { CSSProperties } from "react";
import type { Theme } from "@/lib/schema";

const RADIUS: Record<Theme["radius"], { box: string; btn: string }> = {
  none: { box: "0px", btn: "0px" },
  small: { box: "6px", btn: "6px" },
  large: { box: "14px", btn: "14px" },
  pill: { box: "18px", btn: "999px" },
};

const SERIF = new Set(["Fraunces", "Playfair Display", "Lora"]);
const MONO = new Set(["IBM Plex Mono"]);

export function fontStack(font: string) {
  const fallback = SERIF.has(font)
    ? "Georgia, serif"
    : MONO.has(font)
      ? "ui-monospace, monospace"
      : "ui-sans-serif, system-ui, sans-serif";
  return `"${font}", ${fallback}`;
}

export function fontHref(font: string) {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:ital,wght@0,300..700;1,400&display=swap`;
}

export function themeVars(theme: Theme): CSSProperties {
  const r = RADIUS[theme.radius] ?? RADIUS.small;
  return {
    "--fl-bg": theme.background,
    "--fl-q": theme.question,
    "--fl-a": theme.answer,
    "--fl-btn": theme.button,
    "--fl-btn-text": theme.buttonText,
    "--fl-radius": r.box,
    "--fl-btn-radius": r.btn,
    "--fl-font": fontStack(theme.font),
    "--fl-overlay": String(theme.backgroundOverlay ?? 0.4),
  } as CSSProperties;
}

/** Is the background dark? Used to pick contrasting chrome. */
export function isDark(hex: string) {
  const m = hex.replace("#", "");
  if (m.length < 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}
