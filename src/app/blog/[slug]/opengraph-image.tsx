import { ImageResponse } from "next/og";
import { getPost, POSTS } from "@/content/blog";

export const dynamicParams = false;
export const alt = "A Formloom blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

/** Each post gets its own share card: the title, big, so it reads in a feed. */
export default async function PostImage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const title = post?.title ?? "The Formloom blog";
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
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 600 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: "#171612", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: 15, width: 24, height: 4, borderRadius: 4, background: "#f6f5f1" }} />
            <div style={{ position: "absolute", left: 14, top: 24, width: 15, height: 4, borderRadius: 4, background: "#f6f5f1" }} />
            <div style={{ position: "absolute", left: 14, top: 33, width: 8, height: 4, borderRadius: 4, background: "#f6f5f1" }} />
            <div style={{ position: "absolute", left: 31, top: 30, width: 11, height: 11, borderRadius: 11, background: "#ff5b2e" }} />
          </div>
          Formloom
          <span style={{ marginLeft: 8, color: "#8a877d", fontWeight: 400 }}>· Blog</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 68 : 84,
            lineHeight: 1.04,
            letterSpacing: -2,
            fontWeight: 600,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#4a4840" }}>
          The open-source Typeform alternative · <span style={{ color: "#ff5b2e", marginLeft: 10 }}>free to start</span>
        </div>
      </div>
    ),
    size,
  );
}
