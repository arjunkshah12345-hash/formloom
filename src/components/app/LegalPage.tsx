import Link from "next/link";
import { LogoMark } from "@/components/app/Logo";

/** Plain text page for the privacy policy and terms. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-paper px-5 text-ink">
      <header className="mx-auto flex w-full max-w-[720px] items-center py-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-medium tracking-tight" aria-label="Formloom home">
          <LogoMark className="size-6" />
          <span className="font-heading">formloom</span>
        </Link>
      </header>
      <article className="mx-auto w-full max-w-[720px] pt-10 pb-24">
        <p className="font-tech text-[11px] tracking-[0.16em] text-accent uppercase">Last updated {updated}</p>
        <h1 className="mt-4 font-heading text-[clamp(2.2rem,5vw,3.25rem)] leading-[1] font-medium tracking-[-0.04em]">
          {title}
        </h1>
        <div className="mt-10 space-y-5 text-[16px] leading-relaxed text-ink-2 [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-2 [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </main>
  );
}
