export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#171612" />
      <path d="M9 10h14" stroke="#f6f5f1" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M9 16h9" stroke="#f6f5f1" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M9 22h5" stroke="#f6f5f1" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="22.5" cy="21.5" r="3.2" fill="#ff5b2e" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight ${className}`}>
      <LogoMark />
      Formloom
    </span>
  );
}
