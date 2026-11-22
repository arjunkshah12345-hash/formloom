import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import type { User } from "@/lib/auth";
import { REPO_URL } from "@/lib/url";
import { Logo } from "./Logo";

const LINK = "rounded-full px-3 py-2 text-ink-3 transition hover:text-ink";

/** Same floating pill as the landing nav. */
export function AppHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-30 px-5 pt-3">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/40 pr-1.5 pl-4 backdrop-blur-xl">
        <Link href="/forms" aria-label="Your forms">
          <Logo />
        </Link>
        <nav className="flex items-center gap-0.5 font-tech text-[11px] tracking-wide uppercase">
          <Link href="/forms" className={LINK}>
            Forms
          </Link>
          <Link href="/account" className={LINK}>
            Account
          </Link>
          <a href={REPO_URL} className={`${LINK} max-sm:hidden`} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <form action={logout}>
            <button
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pr-3.5 pl-1 text-ink-2 uppercase transition hover:text-ink"
              title={user.email}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-accent font-sans text-[11px] font-semibold text-white normal-case">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
