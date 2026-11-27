import { ImageResponse } from "next/og";
import { OG, OgBrand, OgHorizon, ogAssets } from "@/lib/og";

export const dynamic = "force-static";

export const alt = "Formloom: forms people actually finish. The open-source Typeform alternative.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { fonts, horizon, mark } = await ogAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          background: OG.bg,
          color: OG.ink,
          fontFamily: "Funnel Display",
        }}
      >
        <OgHorizon src={horizon} />
        <div style={{ display: "flex", marginTop: 48 }}>
          <OgBrand mark={mark} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 44,
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: -4.5,
          }}
        >
          <span>Forms people</span>
          <span>actually finish.</span>
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: OG.ink2, letterSpacing: -0.5 }}>
          The open-source Typeform alternative.
          <span style={{ color: OG.accent, marginLeft: 10 }}>Free to start.</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
