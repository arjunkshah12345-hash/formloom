import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import type { User } from "@/lib/auth";
import { Logo } from "./Logo";

export function AppHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/forms">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/forms" className="btn-ghost">Forms</Link>
          <Link href="/account" className="btn-ghost">API &amp; account</Link>
          <a href="https://github.com/" className="btn-ghost hidden sm:inline-flex" target="_blank" rel="noreferrer">GitHub</a>
          <form action={logout}>
            <button className="btn-ghost" title={user.email}>
              <span className="flex size-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
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
