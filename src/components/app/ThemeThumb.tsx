import type { Theme } from "@/lib/schema";
import { fontStack } from "@/components/player/theme";

/** Tiny static rendering of a form in its theme, used on cards. */
export function ThemeThumb({ theme, title, className = "" }: { theme: Theme; title: string; className?: string }) {
  const radius = theme.radius === "none" ? 0 : theme.radius === "pill" ? 99 : theme.radius === "large" ? 8 : 4;
  return (
    <div
      className={`relative flex flex-col justify-center overflow-hidden px-5 ${theme.align === "center" ? "items-center text-center" : ""} ${className}`}
      style={{ background: theme.background, color: theme.question, fontFamily: fontStack(theme.font) }}
    >
      {theme.backgroundImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={theme.backgroundImage} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0" style={{ background: theme.background, opacity: theme.backgroundOverlay ?? 0.4 }} />
        </>
      ) : null}
      <p className="relative line-clamp-2 text-[15px] leading-snug">{title || "Untitled"}</p>
      <div className="relative mt-2.5 flex gap-1.5">
        <span className="h-4 w-14 border" style={{ borderColor: theme.answer, background: `${theme.answer}22`, borderRadius: Math.min(radius, 6) }} />
        <span className="h-4 w-10 border" style={{ borderColor: theme.answer, background: `${theme.answer}22`, borderRadius: Math.min(radius, 6) }} />
      </div>
      <span className="relative mt-2.5 h-4 w-9" style={{ background: theme.button, borderRadius: radius }} />
    </div>
  );
}
