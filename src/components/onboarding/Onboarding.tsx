"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Bot, Check, Copy, KeyRound, Link2, PenLine } from "lucide-react";
import { LogoMark } from "@/components/app/Logo";
import { ThemeThumb } from "@/components/app/ThemeThumb";
import { agentPrompt } from "@/lib/agent-prompt";
import { createApiKey } from "@/lib/actions/forms";
import { startWithTemplate } from "@/lib/actions/onboarding";
import type { Theme } from "@/lib/schema";

type TemplateInfo = { key: string; name: string; description: string; theme: Theme; sample: string };
type Created = { id: string; slug: string; title: string };
type Path = "agent" | "share";

const STEPS = ["Pick a starting form", "Choose how it goes live", "You're set"];

export function Onboarding({
  firstName,
  base,
  templates,
  offer,
  justUpgraded,
}: {
  firstName: string;
  base: string;
  templates: TemplateInfo[];
  offer: { endsLabel: string; year: number } | null;
  justUpgraded: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState("nps");
  const [form, setForm] = useState<Created | null>(null);
  const [path, setPath] = useState<Path>("agent");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const prompt = agentPrompt({ base, apiKey: apiKey ?? undefined, form: form ?? undefined });

  const createFirstForm = () =>
    start(async () => {
      setError(null);
      try {
        setForm(await startWithTemplate(picked));
        setStep(1);
      } catch {
        setError("Couldn't create the form. Please try again.");
      }
    });

  const makeKey = () =>
    start(async () => {
      setError(null);
      try {
        setApiKey((await createApiKey("Coding agent")).token);
      } catch {
        setError("Couldn't create an API key. Please try again.");
      }
    });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Your browser blocked the clipboard. Select the text and copy it by hand.");
    }
  };

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-[1040px] items-center justify-between px-5 py-6">
        <span className="flex items-center gap-2 text-[15px] font-medium tracking-tight">
          <LogoMark className="size-6" />
          <span className="font-heading">formloom</span>
        </span>
        <Link href="/forms" className="text-sm text-ink-3 transition hover:text-ink-2">
          Skip to dashboard
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1040px] px-5 pt-6 pb-24">
        <ol className="flex flex-wrap gap-x-6 gap-y-2 font-tech text-[11px] tracking-[0.12em] uppercase">
          {STEPS.map((label, i) => (
            <li key={label} className={`flex items-center gap-2 ${i === step ? "text-ink" : i < step ? "text-ink-2" : "text-ink-3"}`}>
              <span
                className={`flex size-5 items-center justify-center rounded-full border text-[10px] ${
                  i < step ? "border-accent bg-accent text-white" : i === step ? "border-accent text-accent" : "border-line-2"
                }`}
              >
                {i < step ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        {justUpgraded && step === 0 ? (
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/[0.08] px-4 py-2 text-sm text-ink">
            <Check className="size-4 text-accent" strokeWidth={3} /> You&rsquo;re on Pro: unlimited responses, no badge. Let&rsquo;s make your first form.
          </p>
        ) : null}

        {step === 0 ? (
          <section className="mt-12">
            <h1 className="font-heading text-[clamp(2.2rem,5vw,3.5rem)] leading-[1] font-medium tracking-[-0.04em]">
              Welcome, {firstName}. What are you collecting?
            </h1>
            <p className="mt-4 max-w-[52ch] text-lg text-ink-2">
              Pick a starting point. You can change every question and the theme in the builder later.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => {
                const on = t.key === picked;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setPicked(t.key)}
                    aria-pressed={on}
                    className={`group overflow-hidden rounded-2xl border text-left transition ${
                      on ? "border-accent ring-1 ring-accent" : "border-line hover:border-line-2"
                    }`}
                  >
                    <ThemeThumb theme={t.theme} title={t.sample} className="h-28" />
                    <div className="flex items-start justify-between gap-3 bg-surface px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium">{t.name}</p>
                        <p className="mt-0.5 text-sm text-ink-3">{t.description}</p>
                      </div>
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          on ? "border-accent bg-accent text-white" : "border-line-2"
                        }`}
                      >
                        {on ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-10 flex items-center gap-4">
              <button type="button" onClick={createFirstForm} disabled={pending} className="btn-accent h-11 px-6">
                {pending ? "Creating…" : "Continue"} <ArrowRight className="size-4" />
              </button>
            </div>
          </section>
        ) : null}

        {step === 1 && form ? (
          <section className="mt-12">
            <h1 className="font-heading text-[clamp(2.2rem,5vw,3.5rem)] leading-[1] font-medium tracking-[-0.04em]">
              How should &ldquo;{form.title}&rdquo; go live?
            </h1>
            <p className="mt-4 max-w-[56ch] text-lg text-ink-2">
              Building an app? Hand your coding agent one prompt and it embeds the form and receives responses for you.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <PathCard
                on={path === "agent"}
                onClick={() => setPath("agent")}
                icon={<Bot className="size-4" />}
                title="Set up with my coding agent"
                body="Claude Code, Cursor, Codex… Embed, webhooks and API in one paste."
              />
              <PathCard
                on={path === "share"}
                onClick={() => setPath("share")}
                icon={<Link2 className="size-4" />}
                title="Share a link or embed it myself"
                body="Publish from the builder, then copy a link, QR code or snippet."
              />
            </div>

            {path === "agent" ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <p className="font-medium">Agent setup prompt</p>
                    <p className="mt-0.5 text-sm text-ink-3">
                      {apiKey
                        ? "Your new API key is in the prompt. Treat it like a password."
                        : "Add an API key so your agent can read responses too."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {apiKey ? null : (
                      <button type="button" onClick={makeKey} disabled={pending} className="btn-outline h-9">
                        <KeyRound className="size-4" /> {pending ? "Creating…" : "Add API key"}
                      </button>
                    )}
                    <button type="button" onClick={() => copy(prompt)} className="btn-accent h-9">
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied" : "Copy prompt"}
                    </button>
                  </div>
                </div>
                <pre className="max-h-80 overflow-auto px-5 py-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink-2">
                  {prompt}
                </pre>
              </div>
            ) : null}

            <div className="mt-10 flex items-center gap-4">
              <button type="button" onClick={() => setStep(2)} className="btn-accent h-11 px-6">
                Continue <ArrowRight className="size-4" />
              </button>
            </div>
          </section>
        ) : null}

        {step === 2 && form ? (
          <section className="mt-12 max-w-2xl">
            <h1 className="font-heading text-[clamp(2.2rem,5vw,3.5rem)] leading-[1] font-medium tracking-[-0.04em]">
              You&rsquo;re set, {firstName}.
            </h1>
            <p className="mt-4 text-lg text-ink-2">
              {path === "agent"
                ? "Paste the prompt into your agent. When it gives you a webhook URL, add it under Share → Webhook, then publish the form."
                : "Open the builder to make the form yours, then publish it to get a link."}
            </p>
            <div className="mt-10 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => router.push("/forms")} className="btn-accent h-11 px-6">
                Go to dashboard <ArrowRight className="size-4" />
              </button>
              <Link href={`/forms/${form.id}/edit`} className="btn-outline h-11 px-5">
                <PenLine className="size-4" /> Edit &ldquo;{form.title}&rdquo;
              </Link>
            </div>
            {offer ? (
              <div className="mt-12 rounded-2xl border border-accent/40 bg-accent/[0.06] p-6">
                <p className="font-tech text-[11px] tracking-[0.14em] text-accent uppercase">Launch offer · ends {offer.endsLabel}</p>
                <p className="mt-2 font-heading text-2xl font-medium tracking-tight">Pro is half off your first year</p>
                <p className="mt-2 text-ink-2">
                  Free covers 1,000 responses a month. Pro removes the cap and the badge:{" "}
                  <span className="text-ink-3 line-through">${offer.year / 100}</span>{" "}
                  <span className="font-medium text-ink">${offer.year / 200}</span> for the first year ($
                  {(offer.year / 2400).toFixed(0)} a month).
                </p>
                <a href="/upgrade?plan=year" className="btn-accent mt-5 h-11 px-6">
                  Get Pro for ${offer.year / 200} <ArrowRight className="size-4" />
                </a>
              </div>
            ) : null}
          </section>
        ) : null}

        {error ? (
          <p className="mt-6 max-w-xl rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function PathCard({
  on,
  onClick,
  icon,
  title,
  body,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex gap-4 rounded-2xl border p-5 text-left transition ${
        on ? "border-accent bg-accent/[0.06] ring-1 ring-accent" : "border-line hover:border-line-2"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${
          on ? "border-accent/40 text-accent" : "border-line-2 text-ink-2"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-1 block text-sm text-ink-3">{body}</span>
      </span>
    </button>
  );
}
