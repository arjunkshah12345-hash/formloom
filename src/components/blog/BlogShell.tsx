import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/app/Logo";
import { REPO_URL } from "@/lib/url";

/** Header and footer shared by the blog and other public content pages. */
export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-dvh bg-paper font-sans text-ink selection:bg-accent selection:text-white">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-medium tracking-tight" aria-label="Formloom home">
            <LogoMark className="size-6" />
            <span className="font-heading">formloom</span>
          </Link>
          <nav className="flex items-center gap-1 font-tech text-[11px] tracking-wide uppercase">
            <Link href="/templates" className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink max-sm:hidden">
              Templates
            </Link>
            <Link href="/blog" className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink">
              Blog
            </Link>
            <Link href="/#pricing" className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink max-sm:hidden">
              Pricing
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-full px-3 py-2 text-ink-3 transition hover:text-ink max-sm:hidden">
              GitHub ↗
            </a>
            <Link href="/signup" className="ml-1 rounded-full bg-ink px-4 py-2 text-paper transition hover:bg-white">
              Start free
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-ink-3">
          <p>Formloom · the open-source Typeform alternative · MIT</p>
          <p className="flex flex-wrap gap-4">
            <Link href="/typeform-alternative" className="hover:text-ink">Free Typeform alternative</Link>
            <Link href="/blog" className="hover:text-ink">Blog</Link>
            <Link href="/templates" className="hover:text-ink">Templates</Link>
            <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/docs/agents" className="hover:text-ink">For AI agents</Link>
            <a href="/llms.txt" className="hover:text-ink">llms.txt</a>
            <a href={REPO_URL} className="hover:text-ink">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Closing call to action under every article. */
export function BlogCta() {
  return (
    <aside className="mt-16 rounded-3xl border border-accent/40 bg-accent/[0.07] p-8">
      <p className="font-heading text-2xl font-medium tracking-tight">Try Formloom free</p>
      <p className="mt-2 text-ink-2">
        1,000 responses a month on the free plan, Pro from $6 a month, or self-host it with no limits. Open source,
        MIT licensed.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/signup" className="inline-flex h-11 items-center rounded-full bg-accent px-6 font-medium text-white transition hover:brightness-110">
          Start free
        </Link>
        <a href={REPO_URL} className="inline-flex h-11 items-center rounded-full border border-line-2 px-6 transition hover:border-ink-3">
          View the source ↗
        </a>
      </div>
    </aside>
  );
}
