import Link from "next/link";
import { LogoMark } from "@/components/app/Logo";
import { AsciiWordmark } from "@/components/landing/fx";

export default function NotFound() {
  return (
    <main className="dark flex min-h-dvh flex-col bg-paper px-5 text-ink">
      <header className="mx-auto flex w-full max-w-[1240px] items-center py-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-medium tracking-tight" aria-label="Formloom home">
          <LogoMark className="size-6" />
          <span className="font-heading">formloom</span>
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center py-16">
        <div className="max-w-xl">
          <AsciiWordmark text="404" aspect="aspect-[2.6/1]" />
        </div>
        <p className="mt-10 font-tech text-[11px] tracking-[0.16em] text-accent uppercase">[404] Not found</p>
        <h1 className="mt-4 font-heading text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] font-medium tracking-[-0.045em]">
          This page skipped ahead.
        </h1>
        <p className="mt-5 max-w-[44ch] text-lg text-ink-2">
          The link may be mistyped, or the form was unpublished or deleted by its owner.
        </p>
        <div className="mt-9 flex flex-wrap gap-2">
          <Link href="/" className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-[15px] font-medium text-white hover:brightness-110">
            Go home
          </Link>
          <Link href="/forms" className="inline-flex h-12 items-center rounded-full border border-white/15 bg-white/5 px-6 text-[15px] hover:bg-white/10">
            Your forms
          </Link>
        </div>
      </div>
    </main>
  );
}
