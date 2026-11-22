import Link from "next/link";
import { FREE_MONTHLY_RESPONSES } from "@/lib/plans";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Shown when a free account has responses held past its monthly allowance. */
export function HeldNotice({ held, scope = "account" }: { held: number; scope?: "account" | "form" }) {
  if (held <= 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/[0.08] px-5 py-4">
      <p className="text-sm text-ink-2">
        <b className="font-medium text-ink">
          {fmt(held)} {held === 1 ? "response is" : "responses are"} waiting
        </b>{" "}
        {scope === "form" ? "for this form" : "across your forms"}. You went past the free{" "}
        {fmt(FREE_MONTHLY_RESPONSES)} a month. Nothing was lost and no one was turned away. Upgrade to see them all.
      </p>
      <Link href="/account#plan" className="btn-accent shrink-0">
        See them with Pro
      </Link>
    </div>
  );
}
