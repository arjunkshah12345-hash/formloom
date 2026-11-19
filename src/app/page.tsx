import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Code2,
  GitBranch,
  GitFork,
  Keyboard,
  Link2,
  Paintbrush,
  Server,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import Player from "@/components/player/Player";
import { Logo } from "@/components/app/Logo";
import { getCurrentUser } from "@/lib/auth";
import { demoForm } from "@/lib/demo";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Keyboard, title: "One question at a time", body: "Full-screen, keyboard-first flow with smooth transitions. Letters pick choices, Enter moves on." },
  { icon: GitBranch, title: "Logic jumps", body: "Branch on any answer with and/or rules. Send people to different questions or endings." },
  { icon: Link2, title: "Answer recall & hidden fields", body: "Greet people by name mid-form and pass UTM or user data through the URL." },
  { icon: Paintbrush, title: "Themes that look designed", body: "Eight presets, Google Fonts, custom colors, background images and split-screen media." },
  { icon: BarChart3, title: "Results that answer questions", body: "Completion rates, drop-off per question, NPS, charts for every field and CSV export." },
  { icon: Webhook, title: "Webhooks & REST API", body: "Signed webhooks with retries, plus an API-key protected REST API for your data." },
  { icon: Code2, title: "Embed anywhere", body: "Inline iframe, full page, or a popup button with a one-line script." },
  { icon: ShieldCheck, title: "Your data, your server", body: "A single Node process and a SQLite file. No tracking, no per-response pricing." },
];

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="flex items-center gap-1 text-sm">
          <a href="#features" className="btn-ghost max-sm:hidden">Features</a>
          <a href="#self-host" className="btn-ghost max-sm:hidden">Self-host</a>
          <a href="https://github.com/" className="btn-ghost" target="_blank" rel="noreferrer">
            <GitFork className="size-4" /> <span className="max-sm:hidden">GitHub</span>
          </a>
          {user ? (
            <Link href="/forms" className="btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/signup" className="btn-primary">Get started</Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-14 pb-20 sm:pt-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1 text-xs text-ink-2">
            <span className="size-1.5 rounded-full bg-accent" /> Open source · MIT licensed · Self-hostable
          </span>
          <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
            Forms people <em className="text-accent">actually</em> finish.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Formloom is an open-source alternative to Typeform. Build beautiful, conversational forms with logic, themes and
            analytics — and keep every response on your own server.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={user ? "/forms" : "/signup"} className="btn-primary h-11 px-5 text-[15px]">
              Start building <ArrowRight className="size-4" />
            </Link>
            <a href="#self-host" className="btn-outline h-11 px-5 text-[15px]">
              <Server className="size-4" /> Deploy your own
            </a>
          </div>
        </div>

        <div className="relative mt-16">
          <div className="absolute -inset-x-10 -top-10 -bottom-10 -z-10 rounded-[40px] dot-grid opacity-70" />
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-black/10 bg-surface shadow-[0_40px_100px_-40px_rgba(0,0,0,.45)]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 truncate rounded-md bg-paper px-3 py-1 font-mono text-xs text-ink-3">yourdomain.com/f/demo</span>
              <span className="ml-auto text-xs text-ink-3 max-sm:hidden">Try it — it&apos;s live ↓</span>
            </div>
            <div className="h-[560px]">
              <Player definition={demoForm()} mode="preview" contained hidePreviewTag />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-2xl font-display text-5xl leading-none tracking-tight">Everything you liked about Typeform. Minus the bill.</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-surface p-6">
                <span className="flex size-9 items-center justify-center rounded-lg bg-paper text-ink">
                  <Icon className="size-4.5" />
                </span>
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-3">
            16 question types: short & long text, email, phone, website, number, multiple choice, picture choice, dropdown, yes/no,
            legal, rating, opinion scale, NPS®, date and statements.
          </p>
        </div>
      </section>

      <section id="self-host" className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-5xl leading-none tracking-tight">Up and running in a minute.</h2>
          <p className="mt-4 max-w-md leading-relaxed text-ink-2">
            Formloom is a single Next.js app backed by SQLite — no Redis, no Postgres, no queue to babysit. Run it with Docker or
            any Node 22.5+ host and back up one file.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink-2">
            {["Unlimited forms & responses", "No telemetry, no third-party trackers", "Export everything as CSV or JSON"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-ink p-6 font-mono text-[13px] leading-relaxed text-paper/90 shadow-xl">
{`# Docker
docker build -t formloom .
docker run -p 3000:3000 -v formloom:/app/data formloom

# or straight from source
pnpm install
pnpm build && pnpm start`}
        </pre>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ink-3">
          <Logo />
          <p>MIT licensed. Built in the open.</p>
        </div>
      </footer>
    </div>
  );
}
