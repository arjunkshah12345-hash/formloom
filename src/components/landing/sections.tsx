import Link from "next/link";
import { ArrowUpRight, Download, EyeOff, KeyRound, Lock, Trash2, Webhook } from "lucide-react";
import { TypeIcon } from "@/components/builder/TypeIcon";
import { Halftone } from "@/components/dithercn/halftone";
import { fontStack } from "@/components/player/theme";
import { Reveal } from "@/components/landing/Reveal";
import { THEME_PRESETS, type FieldType } from "@/lib/schema";
import { TEMPLATES } from "@/lib/templates";

/* -------------------------------------------------------------- primitives */

export function Label({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-tech text-[11px] tracking-[0.16em] text-ink-3 uppercase">
      <span className="text-accent">[{n}]</span>
      {children}
    </p>
  );
}

export function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-heading text-[clamp(2.6rem,5.6vw,5rem)] leading-[0.92] font-medium tracking-[-0.045em] ${className}`}>
      {children}
    </h2>
  );
}

/* ----------------------------------------------------------------- marquee */

const USES = [
  "Customer feedback",
  "Event RSVPs",
  "Lead capture",
  "Job applications",
  "Product research",
  "Personality quizzes",
  "Waitlists",
  "Bug reports",
  "Course evaluations",
  "Onboarding surveys",
];

export function UseCaseMarquee() {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {USES.map((u) => (
        <span key={u} className="flex items-center">
          <span className="px-7 font-heading text-[clamp(1.6rem,3.2vw,2.6rem)] font-medium tracking-[-0.03em] whitespace-nowrap text-ink-3 transition-colors hover:text-ink">
            {u}
          </span>
          <span className="text-accent">✳</span>
        </span>
      ))}
    </div>
  );
  return (
    <section aria-label="What people build" className="overflow-hidden border-b border-line py-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="fl-marquee flex w-max">
        {row()}
        {row(true)}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ how it works */

const STEPS = [
  {
    t: "Pick a start",
    b: "A blank canvas or one of six templates — NPS, RSVP, lead gen, hiring, research, quiz. Or import a form as JSON.",
    k: "6 templates",
  },
  {
    t: "Write & branch",
    b: "Type questions straight onto the canvas. Add jump rules, recall earlier answers, set hidden fields.",
    k: "↵ / tab",
  },
  {
    t: "Theme & publish",
    b: "Eight presets, twelve fonts, your own colours and background image. Edits stay in draft until you publish again.",
    k: "/f/slug",
  },
  {
    t: "Share & learn",
    b: "Link, QR, embed or popup. Responses land in a live dashboard and fire your signed webhooks.",
    k: "→ webhook",
  },
];

export function HowItWorks({ n }: { n: string }) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Label n={n}>How it works</Label>
            <H2 className="mt-5 max-w-[15ch]">Blank page to live link in four moves.</H2>
          </div>
          <p className="max-w-[34ch] text-ink-2">Most forms take about two minutes. No seats, no plan limits, no &ldquo;upgrade to unlock logic&rdquo;.</p>
        </div>
      </Reveal>
      <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div aria-hidden className="absolute top-[7px] right-0 left-0 hidden h-px bg-linear-to-r from-accent via-line-2 via-60% to-line lg:block" />
        {STEPS.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.07}>
            <li className="relative">
              <span className={`relative block size-[15px] rounded-full border-[3px] border-paper ${i === 0 ? "bg-accent" : "bg-ink-3"} ring-1 ring-line-2`} />
              <div className="mt-8 font-heading text-7xl font-medium tracking-[-0.06em] text-ink/10 tabular-nums">0{i + 1}</div>
              <h3 className="mt-3 font-heading text-2xl font-medium tracking-tight">{s.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{s.b}</p>
              <span className="mt-5 inline-flex rounded-md border border-line-2 bg-surface px-2 py-1 font-tech text-[10px] text-ink-3">{s.k}</span>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ themes */

export const THEME_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [...new Set(Object.values(THEME_PRESETS).map((t) => t.font))]
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600`)
    .join("&") +
  "&display=swap";

export const RADII = { none: "0px", small: "6px", large: "14px", pill: "999px" } as const;

export function ThemeShowcase({ n }: { n: string }) {
  return (
    <section id="themes" className="relative scroll-mt-24 border-y border-line bg-surface">
      <link rel="stylesheet" href={THEME_FONTS_HREF} precedence="default" />
      <div className="mx-auto max-w-[1240px] px-5 py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Label n={n}>Themes</Label>
              <H2 className="mt-5 max-w-[14ch]">Make it look like you.</H2>
            </div>
            <p className="max-w-[38ch] text-ink-2">
              Start from a preset, then change the font, colours, corner radius, alignment and background image.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(THEME_PRESETS).map(([key, t], i) => (
            <Reveal key={key} delay={(i % 4) * 0.05}>
              <figure
                className="group relative flex aspect-[4/3.4] flex-col overflow-hidden rounded-2xl p-5 ring-1 ring-white/10 transition duration-500 hover:-translate-y-1"
                style={{ background: t.background, color: t.question, fontFamily: fontStack(t.font) }}
              >
                <div className="flex items-center justify-between text-[11px] opacity-60">
                  <span>2 → 5</span>
                  <span>{t.font}</span>
                </div>
                <div className="mt-auto">
                  <p className="text-[19px] leading-tight font-semibold tracking-tight">How was your stay?</p>
                  <div className="mt-3 space-y-1.5">
                    {["Wonderful", "It was fine"].map((c, j) => (
                      <div
                        key={c}
                        className="flex items-center gap-2 border px-2 py-1.5 text-[12px]"
                        style={{
                          borderColor: t.answer,
                          color: t.answer,
                          borderRadius: RADII[t.radius] === "999px" ? "18px" : RADII[t.radius],
                          background: j === 0 ? `color-mix(in oklab, ${t.answer} 16%, transparent)` : undefined,
                        }}
                      >
                        <span className="rounded-[3px] border border-current px-1 text-[9px]">{String.fromCharCode(65 + j)}</span>
                        {c}
                      </div>
                    ))}
                  </div>
                  <span
                    className="mt-3 inline-flex px-3 py-1.5 text-[12px] font-semibold"
                    style={{ background: t.button, color: t.buttonText, borderRadius: RADII[t.radius] }}
                  >
                    OK ✓
                  </span>
                </div>
                <figcaption className="absolute right-4 bottom-4 font-tech text-[10px] tracking-wide uppercase opacity-60">{t.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- templates */

export function TemplateGallery({ n, cta }: { n: string; cta: string }) {
  const items = TEMPLATES.filter((t) => t.key !== "blank").map((t) => {
    const def = t.build();
    const types = [...new Set(def.fields.map((f) => f.type))] as FieldType[];
    const logic = def.fields.some((f) => (f.logic?.length ?? 0) > 0 || f.fallbackTo);
    return { ...t, title: def.fields[0]?.title ?? def.title, count: def.fields.length, endings: def.endings.length, types, logic };
  });
  return (
    <section id="templates" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Label n={n}>Templates</Label>
            <H2 className="mt-5 max-w-[16ch]">Don&apos;t start from nothing.</H2>
          </div>
          <Link href={cta} className="inline-flex items-center gap-2 font-tech text-[12px] tracking-wide text-accent uppercase hover:underline">
            Use a template <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </Reveal>
      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.key} delay={(i % 3) * 0.05} className="bg-paper">
            <Link href={cta} className="group flex h-full flex-col p-7 transition hover:bg-surface">
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {t.types.slice(0, 5).map((ty) => (
                    <span key={ty} className="rounded-md ring-2 ring-paper transition group-hover:ring-surface">
                      <TypeIcon type={ty} />
                    </span>
                  ))}
                </div>
                <ArrowUpRight className="size-4 text-ink-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
              </div>
              <h3 className="mt-10 font-heading text-2xl font-medium tracking-tight">{t.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{t.description}</p>
              <p className="mt-6 border-l-2 border-accent/60 pl-3 text-[13px] text-ink-3 italic">&ldquo;{t.title.replace(/\{\{[^}]+\}\}/g, "…")}&rdquo;</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-6 font-tech text-[10px] tracking-wide text-ink-3 uppercase">
                <span>{t.count} {t.count === 1 ? "question" : "questions"}</span>
                {t.logic ? <span className="text-accent">logic</span> : null}
                <span>{t.endings} {t.endings === 1 ? "ending" : "endings"}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- privacy */

const PRIVACY = [
  { i: EyeOff, t: "No trackers", b: "No analytics scripts, ad pixels or fingerprinting on your forms. Counts come from your own server." },
  { i: Lock, t: "Your database", b: "Every response lives in one SQLite file on your disk. Copy it and you have a backup." },
  { i: Download, t: "Export anything", b: "Responses as CSV or JSON, forms as JSON you can re-import elsewhere." },
  { i: Trash2, t: "Delete for real", b: "Removing a response or a form deletes the rows. Skipped logic branches are never stored." },
  { i: KeyRound, t: "Sane auth", b: "scrypt-hashed passwords, httpOnly session cookies, and revocable API keys." },
  { i: Webhook, t: "Signed delivery", b: "Webhooks carry an HMAC signature so you can prove a payload came from you." },
];

export function Privacy({ n }: { n: string }) {
  return (
    <section id="privacy" className="relative isolate scroll-mt-24 overflow-hidden border-y border-line">
      <Halftone
        aria-hidden
        source="radial"
        center={[0.88, 0.2]}
        radius={0.9}
        color="orange"
        background="transparent"
        size={14}
        intensity={0.7}
        drift={0.25}
        className="absolute inset-0 -z-10 opacity-35"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-paper from-35% to-paper/40" />
      <div className="[&>*]:min-w-0 mx-auto grid max-w-[1240px] gap-16 px-5 py-28 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <Label n={n}>Privacy</Label>
          <H2 className="mt-5">Respondents trust you. Keep it that way.</H2>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-ink-2">
            Hosted form builders sit between you and the people you ask. Formloom doesn&apos;t — the data goes from their
            browser to your server and stops there.
          </p>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
          {PRIVACY.map(({ i: Icon, t, b }, k) => (
            <Reveal key={t} delay={(k % 2) * 0.05} className="bg-paper/90 backdrop-blur">
              <div className="h-full p-6">
                <Icon className="size-5 text-accent" strokeWidth={1.75} />
                <h3 className="mt-5 font-heading text-lg font-medium tracking-tight">{t}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- open source */

const TREE: [string, string?][] = [
  ["formloom/"],
  ["├─ src/"],
  ["│  ├─ app/", "routes, API, public /f/[slug]"],
  ["│  ├─ components/"],
  ["│  │  ├─ builder/", "canvas, logic, theme editor"],
  ["│  │  ├─ player/", "the respondent experience"],
  ["│  │  └─ results/", "charts, table, exports"],
  ["│  └─ lib/"],
  ["│     ├─ engine.ts", "logic + recall"],
  ["│     ├─ db.ts", "node:sqlite"],
  ["│     └─ webhooks.ts", "signed, retried"],
  ["├─ Dockerfile"],
  ["└─ LICENSE", "MIT"],
];

export function OpenSource({ n, repo }: { n: string; repo: string }) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-28">
      <div className="[&>*]:min-w-0 grid items-center gap-16 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <Label n={n}>Open source</Label>
          <H2 className="mt-5 max-w-[13ch]">Read it. Fork it. Ship it.</H2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-ink-2">
            Plain TypeScript on Next.js and React, with a schema you can read in one sitting. MIT licensed — use it
            commercially, white-label it, change anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 font-tech text-[11px] tracking-wide text-ink-2 uppercase">
            {["next.js 16", "react 19", "typescript", "node:sqlite", "tailwind v4", "mit"].map((t) => (
              <span key={t} className="rounded-full border border-line-2 px-3 py-1.5">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            <a href={repo} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-paper transition hover:bg-white">
              View source <ArrowUpRight className="size-4" />
            </a>
            <a href={`${repo}/issues`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full border border-line-2 px-5 text-[14px] text-ink-2 transition hover:text-ink">
              Report an issue
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-2xl border border-line-2 bg-[#080807]">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-tech text-[10px] text-ink-3">
              <span>tree -L 3</span>
              <span className="text-accent">● main</span>
            </div>
            <pre className="scrollbar-thin overflow-x-auto p-5 font-tech text-[12px] leading-6 text-ink-2">
              {TREE.map(([path, note]) => (
                <span key={path} className="block whitespace-pre">
                  {path}
                  {note ? <span className="text-ink-3">{" ".repeat(Math.max(2, 22 - path.length))}{note}</span> : null}
                </span>
              ))}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
