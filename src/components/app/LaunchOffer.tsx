"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

const KEY = "formloom:launch-offer-dismissed";
const SNOOZE_MS = 2 * 24 * 60 * 60 * 1000;

/** The launch discount, offered once every couple of days to free accounts. Shown only while the offer runs. */
export function LaunchOffer({ endsLabel, year, month, lifetime }: { endsLabel: string; year: number; month: number; lifetime: number }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const last = Number(localStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < SNOOZE_MS) return;
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);
  const close = () => {
    localStorage.setItem(KEY, String(Date.now()));
    setOpen(false);
  };
  if (!open) return null;
  const $ = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="offer-title" onClick={close}>
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={close} className="absolute top-4 right-4 rounded-full p-1.5 text-ink-3 transition hover:bg-paper hover:text-ink" aria-label="Close">
          <X className="size-4" />
        </button>
        <p className="font-tech text-[11px] tracking-[0.14em] text-accent uppercase">Launch offer · ends {endsLabel}</p>
        <h2 id="offer-title" className="mt-3 font-heading text-3xl leading-[1.05] font-medium tracking-[-0.03em]">
          Pro is half off your first year
        </h2>
        <p className="mt-3 text-ink-2">
          <span className="text-ink-3 line-through">{$(year)}</span> <span className="font-medium text-ink">{$(year / 2)}</span> for your
          first year. That&apos;s {$(year / 24)} a month.
        </p>
        <ul className="mt-5 space-y-2 text-[15px] text-ink-2">
          {["Unlimited responses, no monthly cap", "No “Made with Formloom” badge", "Every feature, no seat pricing"].map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <Check className="size-4 text-accent" strokeWidth={2.5} /> {f}
            </li>
          ))}
        </ul>
        <a href="/upgrade?plan=year" className="btn-accent mt-6 h-12 w-full justify-center text-[15px]">
          Get Pro for {$(year / 2)}
        </a>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-3">
          <a href="/upgrade?plan=month" className="hover:text-ink">
            Or {$(month / 2)} for your first month
          </a>
          <a href="/upgrade?plan=lifetime" className="hover:text-ink">
            Lifetime, {$(lifetime)} once
          </a>
        </div>
        <button type="button" onClick={close} className="mt-5 w-full text-sm text-ink-3 transition hover:text-ink-2">
          Maybe later. Free is 1,000 responses a month.
        </button>
      </div>
    </div>
  );
}
