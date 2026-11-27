import { useId } from "react";

/**
 * The mark: three form lines and a small glowing ring with a dotted halo,
 * a pocket-sized version of the dithered horizon in the hero.
 */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const dots = `${id}d`;
  const halo = `${id}h`;
  const mask = `${id}m`;
  const glow = `${id}g`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <pattern id={dots} width="1.2" height="1.2" patternUnits="userSpaceOnUse">
          <rect x="0.25" y="0.25" width="0.7" height="0.7" fill="#ff5b2e" />
        </pattern>
        <radialGradient id={halo} cx="23" cy="22" r="7.2" gradientUnits="userSpaceOnUse">
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={mask}>
          <circle cx="23" cy="22" r="7.2" fill={`url(#${halo})`} />
          <circle cx="23" cy="22" r="4" fill="#000" />
        </mask>
        <radialGradient id={glow} cx="23" cy="19.5" r="5" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff5b2e" stopOpacity=".35" />
          <stop offset="1" stopColor="#ff5b2e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#171612" />
      <path d="M9 10h14M9 16h7M9 22h3" stroke="#f6f5f1" strokeWidth="2.6" strokeLinecap="round" />
      <rect width="32" height="32" rx="8" fill={`url(#${dots})`} mask={`url(#${mask})`} opacity=".85" />
      <circle cx="23" cy="22" r="3.4" fill={`url(#${glow})`} stroke="#ff5b2e" strokeWidth="1.1" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[15px] font-medium tracking-tight ${className}`}>
      <LogoMark />
      <span className="font-heading">formloom</span>
    </span>
  );
}
