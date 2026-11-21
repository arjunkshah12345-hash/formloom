import { ImageResponse } from "next/og";

export const alt = "Formloom: open-source conversational forms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#f6f5f1",
          color: "#171612",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "sans-serif", fontSize: 34, fontWeight: 600 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: "#171612", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: 15, width: 24, height: 4, borderRadius: 4, background: "#f6f5f1" }} />
            <div style={{ position: "absolute", left: 14, top: 24, width: 15, height: 4, borderRadius: 4, background: "#f6f5f1" }} />
            <div style={{ position: "absolute", left: 14, top: 33, width: 8, height: 4, borderRadius: 4, background: "#f6f5f1" }} />
            <div style={{ position: "absolute", left: 31, top: 30, width: 11, height: 11, borderRadius: 11, background: "#ff5b2e" }} />
          </div>
          Formloom
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, lineHeight: 0.95, letterSpacing: -3, display: "flex", flexWrap: "wrap" }}>
            Forms people&nbsp;<span style={{ color: "#ff5b2e", fontStyle: "italic" }}>actually</span>&nbsp;finish.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#4a4840", fontFamily: "sans-serif" }}>
            The open-source, self-hostable alternative to Typeform.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
