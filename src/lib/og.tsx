import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared bits for the share cards: the dark brand, the hero's dithered horizon
 * and the ring mark. Share cards are prerendered at build time, so reading
 * from the source tree is fine.
 */
export const OG = { bg: "#0b0b0a", ink: "#efeee9", ink2: "#a9a79f", ink3: "#6f6d66", accent: "#ff5b2e" };

const root = () => process.cwd();

export async function ogAssets() {
  const [font, horizon, mark] = await Promise.all([
    readFile(join(root(), "src/assets/og/FunnelDisplay-Medium.ttf")),
    readFile(join(root(), "src/assets/og/horizon.png")),
    readFile(join(root(), "src/app/icon.svg")),
  ]);
  return {
    fonts: [{ name: "Funnel Display", data: font, weight: 500 as const, style: "normal" as const }],
    horizon: `data:image/png;base64,${horizon.toString("base64")}`,
    mark: `data:image/svg+xml;base64,${mark.toString("base64")}`,
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
