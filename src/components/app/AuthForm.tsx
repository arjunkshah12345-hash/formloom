"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/lib/actions/auth";
import { Logo } from "./Logo";

export function AuthForm({ mode, next, signupsOpen }: { mode: "login" | "signup"; next?: string; signupsOpen: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const isLogin = mode === "login";
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-5xl leading-none tracking-tight">
            {isLogin ? "Welcome back" : "Make forms people enjoy"}
          </h1>
          <p className="mt-3 text-ink-2">
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
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>
            ) : null}
            <button className="btn-primary h-10 w-full" disabled={pending}>
              {pending ? "Just a sec…" : isLogin ? "Log in" : "Create account"}
            </button>
          </form>
          {signupsOpen || isLogin === false ? (
            <p className="mt-6 text-sm text-ink-2">
              {isLogin ? "New here? " : "Already have an account? "}
              <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-ink underline underline-offset-4">
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
    <div className="relative hidden overflow-hidden bg-[#16301f] lg:block">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="relative flex h-full flex-col justify-center px-16 text-[#f3efe0]" style={{ fontFamily: "Georgia, serif" }}>
        <div className="max-w-md">
          <p className="mb-3 flex items-center gap-2 text-sm text-[#e8c872]">2 → </p>
          <p className="text-3xl leading-snug">How did you hear about us?</p>
          <div className="mt-8 space-y-2.5 font-sans">
            {["A friend told me", "Searching GitHub", "Saw it on social", "Other"].map((l, i) => (
              <div
                key={l}
                className={`flex max-w-xs items-center gap-3 rounded-[10px] border px-2 py-1.5 text-[#e8c872] ${
                  i === 1 ? "border-[#e8c872] bg-[#e8c872]/25" : "border-[#e8c872]/45 bg-[#e8c872]/10"
                }`}
              >
                <span className={`flex size-6 items-center justify-center rounded-md border border-[#e8c872]/50 text-xs font-semibold ${i === 1 ? "bg-[#e8c872] text-[#16301f]" : ""}`}>
                  {"ABCD"[i]}
                </span>
                {l}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-[#e8c872]/20">
          <div className="h-full w-2/5 bg-[#e8c872]" />
        </div>
      </div>
    </div>
  );
}
