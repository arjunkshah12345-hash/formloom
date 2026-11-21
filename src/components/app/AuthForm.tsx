"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/lib/actions/auth";
import { HeroBackdrop } from "@/components/landing/fx";
import { LogoMark } from "./Logo";

export function AuthForm({ mode, next, signupsOpen }: { mode: "login" | "signup"; next?: string; signupsOpen: boolean }) {
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
          <form action={action} className="mt-8 space-y-4">
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
            {state?.error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{state.error}</p>
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

function AuthArt() {
  return (
    <div className="relative hidden overflow-hidden border-l border-line lg:block">
      <HeroBackdrop />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_11_10/.55),transparent_40%,rgb(11_11_10/.6))]" />
      <div className="relative flex h-full flex-col justify-center px-16">
        <div className="max-w-md rounded-3xl border border-white/10 bg-black/45 p-8 shadow-2xl backdrop-blur-xl">
          <p className="mb-3 font-tech text-[11px] tracking-[0.14em] text-accent uppercase">02 → </p>
          <p className="font-heading text-3xl leading-tight font-medium tracking-tight text-white">How did you hear about us?</p>
          <div className="mt-7 space-y-2">
            {["A friend told me", "Searching GitHub", "Saw it on social", "Other"].map((l, i) => (
              <div
                key={l}
                className={`flex items-center gap-3 rounded-xl border px-2.5 py-2 text-sm ${
                  i === 1 ? "border-accent bg-accent/20 text-white" : "border-white/12 bg-white/[0.04] text-white/75"
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-md border font-tech text-[10px] ${
                    i === 1 ? "border-accent bg-accent text-white" : "border-white/20"
                  }`}
                >
                  {"ABCD"[i]}
                </span>
                {l}
              </div>
            ))}
          </div>
          <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
