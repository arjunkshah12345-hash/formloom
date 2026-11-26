"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/lib/actions/auth";
import { BarChart3, Bot, GitBranch, MessageSquareText, Palette, Webhook, type LucideIcon } from "lucide-react";
import { HeroBackdrop } from "@/components/landing/fx";
import { LogoMark } from "./Logo";

export function AuthForm({
  mode,
  next,
  signupsOpen,
  google,
  error,
  note,
}: {
  mode: "login" | "signup";
  note?: string;
  next?: string;
  signupsOpen: boolean;
  google: boolean;
  error?: string;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const isLogin = mode === "login";
  return (
    <div className="dark grid min-h-dvh bg-paper text-ink lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-medium tracking-tight">
          <LogoMark className="size-6" />
          <span className="font-heading">formloom</span>
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-heading text-5xl leading-[0.95] font-medium tracking-[-0.04em]">
            {isLogin ? "Welcome back" : "Make forms people enjoy"}
          </h1>
          <p className="mt-4 text-ink-2">
            {isLogin ? "Log in to your Formloom workspace." : "Create your account. It's free and open source."}
          </p>
          {note ? (
            <p className="mt-4 rounded-xl border border-accent/40 bg-accent/[0.08] px-4 py-3 text-sm text-ink">{note}</p>
          ) : null}
          {google ? (
            <>
              <a
                href={`/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="mt-8 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-line-2 bg-white/[0.04] text-sm font-medium text-ink transition hover:border-ink-3 hover:bg-white/[0.07]"
              >
                <GoogleMark />
                Continue with Google
              </a>
              <div className="mt-6 flex items-center gap-3 font-tech text-[10px] tracking-[0.14em] text-ink-3 uppercase">
                <span className="h-px flex-1 bg-line" />
                or with email
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          ) : null}
          <form action={action} className={`${google ? "mt-6" : "mt-8"} space-y-4`}>
            {next ? <input type="hidden" name="next" value={next} /> : null}
            {!isLogin ? (
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input id="name" name="name" className="input h-10" defaultValue={state?.name} autoComplete="name" required />
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input h-10" defaultValue={state?.email} autoComplete="email" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input h-10"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 8}
                required
              />
            </div>
            {state?.error || error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                {state?.error ?? error}
              </p>
            ) : null}
            <button className="btn h-11 w-full rounded-full bg-accent text-white hover:brightness-110" disabled={pending}>
              {pending ? "Just a sec…" : isLogin ? "Log in" : "Create account"}
            </button>
          </form>
          {signupsOpen || isLogin === false ? (
            <p className="mt-6 text-sm text-ink-2">
              {isLogin ? "New here? " : "Already have an account? "}
              <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-accent hover:underline underline-offset-4">
                {isLogin ? "Create an account" : "Log in"}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
      <AuthArt />
    </div>
  );
}

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MessageSquareText, title: "One question at a time", body: "Conversational forms with 16 question types." },
  { icon: GitBranch, title: "Logic that branches", body: "Skip, jump and score based on earlier answers." },
  { icon: Palette, title: "9 themes, or your own", body: "Fonts, colours and radius that match your brand." },
  { icon: BarChart3, title: "Results that read well", body: "Live summaries, drop-off and CSV export." },
  { icon: Webhook, title: "Webhooks and a REST API", body: "Signed webhooks, API keys and one-line embeds." },
  { icon: Bot, title: "Agent-ready", body: "Copy one prompt and your coding agent wires it in." },
];

function AuthArt() {
  return (
    <div className="relative hidden overflow-hidden border-l border-line lg:block">
      <HeroBackdrop />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_11_10/.7),rgb(11_11_10/.35)_45%,rgb(11_11_10/.8))]" />
      <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
        <p className="font-tech text-[11px] tracking-[0.16em] text-accent uppercase">Why formloom</p>
        <h2 className="mt-4 max-w-[16ch] font-heading text-[2.6rem] leading-[1] font-medium tracking-[-0.04em] text-white">
          Forms people actually finish.
        </h2>
        <ul className="mt-10 grid max-w-xl grid-cols-2 gap-x-8 gap-y-7">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className="flex size-8 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05]">
                <Icon className="size-4 text-accent" />
              </span>
              <p className="mt-3 text-[15px] font-medium text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-12 font-tech text-[10px] tracking-[0.14em] text-white/40 uppercase">
          Free · MIT licensed · self-host any time
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
