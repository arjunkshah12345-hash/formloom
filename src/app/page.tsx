import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Minus } from "lucide-react";
import { AsciiBackground } from "@/components/ascii/ascii-background";
import { LogoMark } from "@/components/app/Logo";
import { TypeIcon } from "@/components/builder/TypeIcon";
import { GradientBorder } from "@/components/gradients/gradient-border";
import { CodeTabs } from "@/components/landing/CodeTabs";
import { CODE, COMPARE, FAQ } from "@/components/landing/content";
import {
  AnalyticsPanel,
  AsciiWordmark,
  CtaBackdrop,
  Globe,
} from "@/components/landing/fx";
import { Reveal } from "@/components/landing/Reveal";
import {
  H2,
  HowItWorks,
  Label,
  OpenSource,
  Privacy,
  TemplateGallery,
  ThemeShowcase,
  UseCaseMarquee,
} from "@/components/landing/sections";
import { HeroHorizon } from "@/components/landing/hero-horizon";
import { ThemedDemo } from "@/components/landing/ThemedDemo";
import { getCurrentUser } from "@/lib/auth";
import { demoForm } from "@/lib/demo";
import { FIELD_META, FIELD_TYPES } from "@/lib/schema";
import { appUrl, REPO_URL } from "@/lib/url";


export default async function Home() {
  const user = await getCurrentUser();
  const cta = user ? "/forms" : "/signup";

  return (
    <div className="dark min-h-dvh overflow-x-clip bg-paper font-sans text-ink selection:bg-accent selection:text-white">
      {/* ================================================================ nav */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-3 flex h-12 max-w-[1240px] items-center justify-between rounded-full border border-white/10 bg-black/40 pr-1.5 pl-4 backdrop-blur-xl sm:mx-5 lg:mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-medium tracking-tight"
            aria-label="Formloom home"
          >
            <LogoMark className="size-6" />
            <span className="font-heading">formloom</span>
          </Link>
          <nav className="flex items-center gap-0.5 font-tech text-[11px] tracking-wide uppercase">
            {[
              ["Product", "#product"],
              ["Templates", "#templates"],
              ["Results", "#results"],
              ["Developers", "#developers"],
              ["Self-host", "#self-host"],
            ].map(([l, h]) => (
              <a
                key={l}
                href={h}
                className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink max-lg:hidden"
              >
                {l}
              </a>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink max-sm:hidden"
            >
              GitHub ↗
            </a>
            {user ? null : (
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink max-sm:hidden"
              >
                Log in
              </Link>
            )}
            <Link
              href={cta}
              className="ml-1 rounded-full bg-ink px-4 py-2 font-medium text-paper transition hover:bg-white"
            >
              {user ? "Dashboard" : "Get started"}
            </Link>
          </nav>
        </div>
      </header>

      {/* =============================================================== hero */}
      <HeroHorizon cta={cta} repo={REPO_URL} base={await appUrl()} />

      {/* =============================================================== demo */}
      <section id="demo" className="relative scroll-mt-24 px-5 pt-10 pb-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-6 flex items-end justify-between gap-6">
            <Label n="00">Live demo</Label>
            <span className="fl-shimmer font-tech text-[11px] tracking-[0.12em] text-ink-3 uppercase max-sm:hidden">
              This is a real form — go ahead, type
            </span>
          </div>
          <Reveal>
            <GradientBorder
              radius={22}
              borderWidth={1}
              colors={["#ff5b2e", "#ffb069", "#3a0f05", "#ff5b2e"]}
              className="shadow-[0_60px_160px_-60px_rgba(255,91,46,.45)]"
            >
              <div className="overflow-hidden rounded-[21px]">
                <ThemedDemo definition={demoForm()} />
              </div>
            </GradientBorder>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ numbers */}
      <section className="border-y border-line">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 md:grid-cols-4">
          {[
            ["16", "question types"],
            ["09", "themes · 12 fonts"],
            ["01", "sqlite file to back up"],
            ["00", "trackers, ever"],
          ].map(([n, l], i) => (
            <div
              key={l}
              className={`px-5 py-10 ${i > 0 ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""} border-line`}
            >
              <div className="font-heading text-6xl font-medium tracking-[-0.05em] tabular-nums sm:text-7xl">
                {n}
              </div>
              <div className="mt-2 font-tech text-[11px] tracking-[0.12em] text-ink-3 uppercase">
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      <UseCaseMarquee />

      {/* ============================================================ product */}
      <section
        id="product"
        className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-28"
      >
        <Reveal>
          <Label n="01">Build · Share · Learn</Label>
          <H2 className="mt-5 max-w-[16ch]">
            One question at a time. Zero friction.
          </H2>
        </Reveal>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {[
            {
              t: "Build",
              b: "Type straight onto the canvas. Drag to reorder, switch types without losing content, undo anything. Autosaves as you go.",
              art: <BuilderArt />,
            },
            {
              t: "Share",
              b: "A link, a QR code, an inline embed or a popup button. Close on a date or after a set number of responses.",
              art: <ShareArt />,
            },
            {
              t: "Learn",
              b: "Completion rate, time to finish, drop-off per question, NPS and a chart for every answer. Export anytime.",
              art: <LearnArt />,
            },
          ].map(({ t, b, art }, i) => (
            <Reveal key={t} delay={i * 0.06} className="bg-paper">
              <div className="flex h-full flex-col">
                <div className="relative h-60 overflow-hidden border-b border-line">
                  {art}
                </div>
                <div className="p-7">
                  <div className="flex items-baseline gap-3">
                    <span className="font-tech text-[11px] text-accent">
                      0{i + 1}
                    </span>
                    <h3 className="font-heading text-2xl font-medium tracking-tight">
                      {t}
                    </h3>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                    {b}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <HowItWorks n="02" />

      {/* ============================================================== logic */}
      <section className="relative border-y border-line bg-surface">
        <div className="[&>*]:min-w-0 mx-auto grid max-w-[1240px] items-center gap-16 px-5 py-28 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <Label n="03">Logic & recall</Label>
            <H2 className="mt-5">Ask the right next question.</H2>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-ink-2">
              Branch on any answer with and/or rules, skip what doesn&apos;t
              apply, and route people to different endings. Greet them by name,
              and carry campaign data in through hidden URL fields.
            </p>
            <ul className="mt-8 grid gap-3 font-tech text-[12px] text-ink-2">
              {[
                "jump → any question or ending",
                "conditions on text, numbers, choices",
                "{{field:name}} recall in any title",
                "hidden fields like ?source=newsletter",
                "skipped answers never stored",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="text-accent">▪</span> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <LogicDiagram />
          </Reveal>
        </div>
      </section>

      {/* ============================================================== types */}
      <section className="mx-auto max-w-[1240px] px-5 py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Label n="04">Question types</Label>
              <H2 className="mt-5">Sixteen ways to ask.</H2>
            </div>
            <p className="max-w-[36ch] text-ink-2">
              Keyboard shortcuts on every one: <Kbd>↵</Kbd> to continue,{" "}
              <Kbd>A</Kbd>–<Kbd>Z</Kbd> to choose, <Kbd>Y</Kbd>/<Kbd>N</Kbd>,
              numbers for scales.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4">
            {FIELD_TYPES.map((t, i) => (
              <div
                key={t}
                className="group relative bg-paper p-5 transition hover:bg-surface sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <TypeIcon type={t} />
                  <span className="font-tech text-[10px] text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-8 font-heading text-lg font-medium tracking-tight">
                  {FIELD_META[t].label}
                </div>
                <div className="mt-0.5 text-[13px] text-ink-3">
                  {FIELD_META[t].hint}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <ThemeShowcase n="05" />
      <TemplateGallery n="06" cta={cta} />

      {/* ============================================================ results */}
      <section id="results" className="scroll-mt-24 border-t border-line">
        <div className="[&>*]:min-w-0 mx-auto grid max-w-[1240px] gap-16 px-5 py-28 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <Label n="07">Results</Label>
            <H2 className="mt-5">See exactly where people stop.</H2>
            <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-ink-2">
              Views, starts, completions and time to finish. A drop-off funnel
              that points at the question to fix, NPS worked out for you, and
              every response searchable.
            </p>
            <Link
              href={cta}
              className="mt-8 inline-flex items-center gap-2 font-tech text-[12px] tracking-wide text-accent uppercase hover:underline"
            >
              Try it on your own form <ArrowUpRight className="size-3.5" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <AnalyticsPanel />
          </Reveal>
        </div>
      </section>

      {/* ========================================================= developers */}
      <section
        id="developers"
        className="relative isolate scroll-mt-24 overflow-hidden border-y border-line bg-[#080807]"
      >
        <AsciiBackground
          variant="topography"
          speed={0.4}
          className="absolute inset-0 -z-10 size-full text-accent/25"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_30%_50%,#080807_20%,transparent_100%)]" />
        <div className="[&>*]:min-w-0 mx-auto grid max-w-[1240px] items-center gap-16 px-5 py-28 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Label n="08">Developers</Label>
            <H2 className="mt-5">Plugs into everything.</H2>
            <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-ink-2">
              HMAC-signed webhooks with retries and a delivery log. A REST API
              with personal keys. A one-line popup embed. And all of it is
              TypeScript you can read and fork.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 font-tech text-[11px] tracking-wide text-ink-2 uppercase">
              {[
                "webhooks",
                "rest api",
                "api keys",
                "iframe",
                "popup.js",
                "csv / json",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line-2 bg-black/40 px-3 py-1.5 backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CodeTabs tabs={CODE} />
          </Reveal>
        </div>
      </section>

      <Privacy n="09" />

      {/* ============================================================ compare */}
      <section className="mx-auto max-w-[1240px] px-5 py-28">
        <Reveal>
          <Label n="10">Why formloom</Label>
          <H2 className="mt-5 max-w-[18ch]">
            All the polish. None of the lock-in.
          </H2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-14 overflow-x-auto rounded-3xl border border-line">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-line font-tech text-[11px] tracking-[0.12em] uppercase">
                  <th className="px-6 py-5 font-normal text-ink-3" />
                  <th className="bg-accent/[0.07] px-6 py-5 font-normal text-accent">
                    formloom
                  </th>
                  <th className="px-6 py-5 font-normal text-ink-3">
                    Hosted builders
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, us, them]) => (
                  <tr
                    key={label}
                    className="border-t border-line first:border-t-0"
                  >
                    <td className="px-6 py-4 text-ink-2">{label}</td>
                    <td className="bg-accent/[0.07] px-6 py-4 font-medium">
                      <Cell v={us} strong />
                    </td>
                    <td className="px-6 py-4 text-ink-3">
                      <Cell v={them} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ========================================================== self-host */}
      <section
        id="self-host"
        className="scroll-mt-24 border-t border-line bg-surface"
      >
        <div className="[&>*]:min-w-0 mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-28 lg:grid-cols-2">
          <Reveal>
            <Label n="11">Self-host</Label>
            <H2 className="mt-5">Your server. Anywhere on earth.</H2>
            <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-ink-2">
              One Next.js process and one SQLite file. No Postgres, no Redis, no
              queue to babysit. Docker or any host with Node 22.13+.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-line-2 bg-[#080807]">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-tech text-[10px] text-ink-3">
                <span className="size-2 rounded-full bg-white/15" />
                <span className="size-2 rounded-full bg-white/15" />
                <span className="size-2 rounded-full bg-white/15" />
                <span className="ml-2">~/formloom</span>
              </div>
              <pre className="overflow-x-auto p-5 font-tech text-[12px] leading-7 text-ink-2">
                <span className="text-accent">$</span> docker build -t formloom
                .{"\n"}
                <span className="text-accent">$</span> docker run -p 3000:3000
                -v formloom:/app/data formloom{"\n"}
                <span className="text-emerald-400">✓</span> ready on
                http://localhost:3000
                <span className="fl-caret ml-1 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-accent" />
              </pre>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Globe />
          </Reveal>
        </div>
      </section>

      <OpenSource n="12" repo={REPO_URL} />

      {/* ================================================================ faq */}
      <section
        id="faq"
        className="[&>*]:min-w-0 mx-auto grid max-w-[1240px] scroll-mt-24 gap-12 px-5 py-28 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <Reveal>
          <Label n="13">FAQ</Label>
          <H2 className="mt-5">Questions, answered.</H2>
          <p className="mt-5 text-ink-2">
            Something else?{" "}
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Open an issue ↗
            </a>
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="border-t border-line">
            {FAQ.map(({ q, a }, i) => (
              <details key={q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center gap-5 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-tech text-[11px] text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-heading text-xl font-medium tracking-tight">
                    {q}
                  </span>
                  <span className="relative size-4 shrink-0 text-ink-3">
                    <Minus className="absolute inset-0 size-4" />
                    <Minus className="absolute inset-0 size-4 rotate-90 transition group-open:rotate-0" />
                  </span>
                </summary>
                <p className="max-w-[60ch] pb-6 pl-11 leading-relaxed text-ink-2">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================================================================ cta */}
      <section className="px-5 pb-10">
        <Reveal>
          <div className="relative isolate mx-auto max-w-[1240px] overflow-hidden rounded-[32px] border border-white/10">
            <CtaBackdrop />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(10_5_3/.85)_0%,rgb(10_5_3/.45)_50%,transparent_100%)]" />
            <div className="relative px-8 py-24 sm:px-16 sm:py-32">
              <H2 className="max-w-[14ch] text-white">
                Your next form deserves better.
              </H2>
              <p className="mt-6 max-w-[40ch] text-lg text-white/75">
                Build one in two minutes, or start from a template. Free and
                open source.
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                <Link
                  href={cta}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-black transition hover:bg-white/90"
                >
                  Create a form <ArrowRight className="size-4" />
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center rounded-full border border-white/30 bg-black/20 px-6 text-[15px] text-white backdrop-blur transition hover:bg-black/30"
                >
                  Star on GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================================================= footer */}
      <footer className="mx-auto max-w-[1240px] px-5 pt-16 pb-10">
        <div className="[&>*]:min-w-0 grid gap-10 border-b border-line pb-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark className="size-6" />
              <span className="font-heading text-lg font-medium tracking-tight">
                formloom
              </span>
            </div>
            <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-ink-3">
              Open-source conversational forms. Beautiful for respondents,
              simple to run, yours to keep.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Features", "#product"],
              ["Templates", "#templates"],
              ["Results", "#results"],
              ["Privacy", "#privacy"],
              ["Self-host", "#self-host"],
              ["FAQ", "#faq"],
            ]}
          />
          <FooterCol
            title="Developers"
            links={[
              ["Webhooks", "#developers"],
              ["REST API", "#developers"],
              ["Embeds", "#developers"],
              ["Source", REPO_URL],
            ]}
          />
          <FooterCol
            title="Account"
            links={
              user
                ? [
                    ["Dashboard", "/forms"],
                    ["API keys", "/account"],
                  ]
                : [
                    ["Sign up", "/signup"],
                    ["Log in", "/login"],
                  ]
            }
          />
        </div>
        <div className="py-10">
          <AsciiWordmark text="formloom" />
        </div>
        <div className="flex flex-wrap justify-between gap-3 font-tech text-[10px] tracking-wide text-ink-3 uppercase">
          <p>
            © {new Date().getFullYear()} formloom contributors · MIT ·{" "}
            <Link href="/privacy" className="hover:text-ink-2">Privacy</Link> ·{" "}
            <Link href="/terms" className="hover:text-ink-2">Terms</Link>
          </p>
          <p>
            Not affiliated with Typeform. NPS® is a trademark of its owners.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================== primitives */

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-2 bg-surface px-1 align-[1px] font-tech text-[10px] text-ink">
      {children}
    </span>
  );
}

function Cell({ v, strong }: { v: string | boolean; strong?: boolean }) {
  if (v === true)
    return (
      <Check
        className={`size-4 ${strong ? "text-accent" : "text-ink-3"}`}
        strokeWidth={2.5}
      />
    );
  if (v === false) return <Minus className="size-4 text-ink-3/60" />;
  return <>{v}</>;
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="font-tech text-[10px] tracking-[0.14em] text-ink-3 uppercase">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-ink-2 transition hover:text-ink"
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================ illustrations */

function BuilderArt() {
  return (
    <div className="absolute inset-6 flex overflow-hidden rounded-xl border border-line-2 bg-surface">
      <div className="w-[40%] space-y-1 border-r border-line p-2.5">
        {(["short_text", "email", "multiple_choice", "rating"] as const).map(
          (t, i) => (
            <div
              key={t}
              className={`flex items-center gap-2 rounded-md px-1.5 py-1.5 ${i === 2 ? "bg-white/[0.06] ring-1 ring-line-2" : ""}`}
            >
              <TypeIcon type={t} />
              <span className="h-1.5 flex-1 rounded-full bg-white/10" />
            </div>
          ),
        )}
        <div className="flex items-center gap-1.5 px-1.5 pt-2 font-tech text-[9px] text-ink-3">
          saving{" "}
          <span className="fl-dots">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center bg-[#16241a] px-4">
        <div className="font-heading text-[12px] text-[#f4ecd8]">
          What brings you here?
        </div>
        {["A", "B", "C"].map((k, i) => (
          <div
            key={k}
            className={`mt-1.5 flex items-center gap-1.5 rounded border px-1.5 py-1 text-[9px] ${
              i === 1
                ? "border-[#e9c46a] bg-[#e9c46a]/20 text-[#f4ecd8]"
                : "border-[#e9c46a]/35 text-[#e9c46a]"
            }`}
          >
            <span className="rounded-sm border border-current px-0.5 font-tech text-[7px]">
              {k}
            </span>
            <span className="h-1 w-12 rounded bg-current opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareArt() {
  const cells = Array.from({ length: 121 }, (_, i) => {
    const x = i % 11;
    const y = Math.floor(i / 11);
    const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    return finder || (x * 7 + y * 13 + x * y) % 5 < 2;
  });
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-5 p-6">
      <div className="grid size-28 shrink-0 grid-cols-11 gap-px rounded-xl bg-ink p-2.5">
        {cells.map((on, i) => (
          <span key={i} className={on ? "bg-paper" : ""} />
        ))}
      </div>
      <div className="w-40 space-y-2 font-tech text-[10px]">
        <div className="rounded-md border border-line-2 bg-surface px-2.5 py-2 text-ink-2">
          <span className="text-accent">↗</span> /f/feedback
        </div>
        <div className="rounded-md border border-line-2 bg-surface px-2.5 py-2 leading-snug text-ink-3">
          &lt;iframe src=&quot;…?embed=1&quot;&gt;
        </div>
        <div className="inline-flex rounded-full bg-accent px-3 py-1.5 text-white">
          give feedback
        </div>
      </div>
    </div>
  );
}

function LearnArt() {
  const bars = [100, 92, 81, 77, 58];
  return (
    <div className="absolute inset-6 rounded-xl border border-line-2 bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-heading text-3xl font-medium tracking-tight">
          58%
        </span>
        <span className="font-tech text-[9px] text-ink-3 uppercase">
          completion
        </span>
      </div>
      <div className="mt-4 flex h-24 items-end gap-2">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <div
              className={`w-full rounded-sm ${i === 4 ? "bg-accent" : "bg-white/15"}`}
              style={{
                height: `${b}%`,
                backgroundImage:
                  i === 4
                    ? undefined
                    : "radial-gradient(circle at 1px 1px, rgb(255 255 255 / .35) 1px, transparent 0)",
                backgroundSize: "3px 3px",
              }}
            />
            <span className="font-tech text-[8px] text-ink-3">Q{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowNode({
  sub,
  label,
  tone = "default",
}: {
  sub: string;
  label: string;
  tone?: "default" | "low" | "high" | "end";
}) {
  const tones = {
    default: "border-line-2 bg-paper",
    low: "border-rose-400/30 bg-rose-500/10",
    high: "border-emerald-400/30 bg-emerald-500/10",
    end: "border-accent bg-accent text-white",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div
        className={`font-tech text-[9px] tracking-wide uppercase ${tone === "end" ? "text-white/70" : "text-ink-3"}`}
      >
        {sub}
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  );
}

function LogicDiagram() {
  return (
    <div className="relative rounded-3xl border border-line-2 bg-paper p-6 sm:p-8">
      <div className="absolute inset-0 rounded-3xl [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/.07)_1px,transparent_0)] [background-size:16px_16px]" />
      <div className="relative">
        <div className="mx-auto max-w-xs">
          <FlowNode
            sub="Q1 · NPS"
            label="How likely are you to recommend Acme?"
          />
        </div>
        <svg
          viewBox="0 0 400 70"
          preserveAspectRatio="none"
          className="block h-[70px] w-full"
          fill="none"
          aria-hidden
        >
          <path
            d="M200 0 C200 35 100 30 100 70"
            stroke="#fb7185"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M200 0 C200 35 300 30 300 70"
            stroke="#34d399"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="relative grid grid-cols-2 gap-4">
          <span className="absolute -top-11 left-[25%] -translate-x-1/2 rounded-full border border-rose-400/30 bg-paper px-2 py-0.5 font-tech text-[9px] text-rose-300">
            score &lt; 7
          </span>
          <span className="absolute -top-11 left-[75%] -translate-x-1/2 rounded-full border border-emerald-400/30 bg-paper px-2 py-0.5 font-tech text-[9px] text-emerald-300">
            otherwise
          </span>
          <FlowNode tone="low" sub="Q2" label="What should we fix first?" />
          <FlowNode tone="high" sub="Q3" label="What do you love most?" />
        </div>
        <svg
          viewBox="0 0 400 50"
          preserveAspectRatio="none"
          className="block h-[50px] w-full"
          fill="none"
          aria-hidden
        >
          <path
            d="M100 0 C100 30 200 20 200 50"
            stroke="#7d7b74"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M300 0 C300 30 200 20 200 50"
            stroke="#7d7b74"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mx-auto max-w-xs">
          <FlowNode
            sub="Q4 · Email"
            label="Thanks, {{name}} — can we follow up?"
          />
        </div>
        <div className="mx-auto h-6 w-px border-l border-dashed border-ink-3" />
        <div className="mx-auto max-w-[220px]">
          <FlowNode tone="end" sub="Ending" label="Thank you!" />
        </div>
      </div>
    </div>
  );
}
