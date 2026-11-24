"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Check, ChevronRight } from "lucide-react";
import { DitherShader } from "@/lib/dither";
import { agentPrompt } from "@/lib/agent-prompt";

/** A planet rim rising from the bottom edge, with a thin atmosphere and a few stars. */
const HORIZON = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float R = aspect * 1.15;
  vec2 c = vec2(0.0, 0.26 - R);
  float d = length(p - c) - R;
  float tone;
  if (d < 0.0) {
    tone = 0.32 * exp(d * 4.0);
  } else {
    tone = 0.34 * exp(-d * 15.0);
  }
  float rim = exp(-abs(d) * 70.0);
  float drift = 0.5 + 0.5 * sin(p.x * 2.4 - t * 0.4);
  tone += rim * (0.6 + 0.35 * drift);
  vec2 cellId = floor(uv * res);
  float s = hash(cellId);
  if (d > 0.08 && s > 0.998) {
    tone = max(tone, 0.55 + 0.45 * sin(t * 1.5 + s * 80.0));
  }
  return clamp(tone, 0.0, 1.0);
}
`;

function CopyPrompt({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked: nothing to do */
        }
      }}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-[14px] text-ink-2 transition hover:border-white/25 hover:text-ink"
    >
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Bot className="size-3.5" />}
      {copied ? "Copied. Paste it to your agent" : "Copy agent setup prompt"}
    </button>
  );
}

/** Quiet centred hero: small headline, two actions, a dithered horizon underneath. */
export function HeroHorizon({
  cta,
  repo,
  base,
  launchEnds,
}: {
  cta: string;
  repo: string;
  base: string;
  /** Set while the launch offer runs, e.g. "December 15". */
  launchEnds: string | null;
}) {
  const prompt = agentPrompt({ base });

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[48%] [mask-image:linear-gradient(180deg,transparent_0%,#000_30%,#000_85%,transparent_100%)]">
        <DitherShader
          field={HORIZON}
          palette={["#0b0b0a", "#ff5b2e"]}
          cell={3}
          speed={1}
          className="absolute inset-0"
        />
      </div>

      <div className="fl-hero-in mx-auto flex w-full max-w-[760px] flex-col items-center px-5 pt-36 text-center sm:pt-44">
        <a
          href={launchEnds ? "#pricing" : "#themes"}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pr-2.5 pl-1 text-[12.5px] text-ink-3 transition hover:text-ink-2"
        >
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
            {launchEnds ? "Launch" : "New"}
          </span>
          {launchEnds ? `Pro is half off until ${launchEnds}` : "9 themes and 16 question types"}
          <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </a>

        <h1 className="mt-7 font-heading text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.04em] text-balance">
          Forms people actually finish.
        </h1>

        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink-2 text-balance">
          The open-source Typeform alternative. Conversational forms with logic, themes and analytics. Hand your coding
          agent one prompt and they&rsquo;re live in your app.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href={cta}
            className="group inline-flex h-10 items-center gap-1 rounded-full bg-accent pr-3 pl-4.5 text-[14px] font-medium text-white transition hover:brightness-110"
          >
            Build a form free
            <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <CopyPrompt text={prompt} />
        </div>

        <p className="mt-6 text-[13px] text-ink-3">
          1,000 responses a month free · No credit card · MIT licensed ·{" "}
          <a
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline decoration-line-2 underline-offset-4 transition hover:text-ink-2"
          >
            view the source <ArrowUpRight className="size-3" />
          </a>
        </p>
      </div>
    </section>
  );
}
