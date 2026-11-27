import { FUNNEL_MEDIUM_B64, HORIZON_PNG_B64, MARK_SVG_B64 } from "@/assets/og/embedded";

/**
 * Shared bits for the share cards: the dark brand, the hero's dithered horizon
 * and the ring mark. Assets are inlined so this works on Workers with no filesystem.
 */
export const OG = { bg: "#0b0b0a", ink: "#efeee9", ink2: "#a9a79f", ink3: "#6f6d66", accent: "#ff5b2e" };

function bytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

export async function ogAssets() {
  return {
    fonts: [{ name: "Funnel Display", data: bytes(FUNNEL_MEDIUM_B64), weight: 500 as const, style: "normal" as const }],
    horizon: `data:image/png;base64,${HORIZON_PNG_B64}`,
    mark: `data:image/svg+xml;base64,${MARK_SVG_B64}`,
  };
}

export function OgBrand({ mark, suffix }: { mark: string; suffix?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, color: OG.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mark} width={52} height={52} alt="" />
      formloom
      {suffix ? <span style={{ marginLeft: 6, color: OG.ink3 }}>· {suffix}</span> : null}
    </div>
  );
}

export function OgHorizon({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={1200} height={330} alt="" style={{ position: "absolute", left: 0, bottom: 0 }} />
  );
}
