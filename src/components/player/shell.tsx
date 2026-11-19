"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Attachment } from "@/lib/schema";

/** Minimal, safe rich text: **bold**, *italic*, line breaks, links. */
export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 ? <br /> : null}
          {renderInline(line)}
        </span>
      ))}
    </>
  );
}

function renderInline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("*")) out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    else
      out.push(
        <a key={k++} href={t} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
          {t}
        </a>,
      );
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export function AttachmentImage({ attachment, className = "" }: { attachment: Attachment; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={attachment.url} alt={attachment.alt ?? ""} className={className} draggable={false} />
  );
}

/**
 * Lays out a single screen (question, welcome or ending) with an optional image
 * stacked above, split beside, or as a wallpaper.
 */
export function ScreenLayout({
  attachment,
  align,
  children,
}: {
  attachment?: Attachment;
  align: "left" | "center";
  children: ReactNode;
}) {
  const layout = attachment?.url ? attachment.layout : undefined;
  const content = (
    <div className={`fl-content ${align === "center" ? "is-center" : ""}`}>
      {layout === "stack" && attachment ? (
        <AttachmentImage attachment={attachment} className="fl-stack-img" />
      ) : null}
      {children}
    </div>
  );

  if (layout === "split-left" || layout === "split-right") {
    return (
      <div className={`fl-split ${layout === "split-left" ? "is-left" : ""}`}>
        <div className="fl-split-media">
          <AttachmentImage attachment={attachment!} className="size-full object-cover" />
        </div>
        <div className="fl-split-body">{content}</div>
      </div>
    );
  }
  if (layout === "wallpaper") {
    return (
      <div className="fl-wallpaper">
        <AttachmentImage attachment={attachment!} className="absolute inset-0 size-full object-cover" />
        <div className="fl-wallpaper-veil" />
        <div className="fl-center relative">{content}</div>
      </div>
    );
  }
  return <div className="fl-center">{content}</div>;
}

export function QuestionHeading({
  number,
  required,
  title,
  description,
}: {
  number?: number;
  required?: boolean;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="fl-heading">
      <h1 className="fl-title">
        {number !== undefined ? (
          <span className="fl-number">
            {number}
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
        <span>
          {title}
          {required ? <span className="fl-required">*</span> : null}
        </span>
      </h1>
      {description ? <div className="fl-description">{description}</div> : null}
    </div>
  );
}

export function ActionButton({
  label,
  onClick,
  showCheck = true,
  hint = true,
  loading,
}: {
  label: string;
  onClick?: () => void;
  showCheck?: boolean;
  hint?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="fl-actions">
      <button type="button" className="fl-button" onClick={onClick} disabled={loading}>
        {loading ? <span className="fl-spinner" /> : null}
        {label}
        {showCheck && !loading ? <Check className="size-4" strokeWidth={3} /> : null}
      </button>
      {hint ? (
        <span className="fl-hint hidden text-xs sm:inline">
          press <b>Enter ↵</b>
        </span>
      ) : null}
    </div>
  );
}
