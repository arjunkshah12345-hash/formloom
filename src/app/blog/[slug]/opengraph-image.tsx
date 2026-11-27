import { ImageResponse } from "next/og";
import { getPost, POSTS } from "@/content/blog";
import { OG, OgBrand, OgHorizon, ogAssets } from "@/lib/og";

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
  const { fonts, horizon, mark } = await ogAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "64px 80px",
          background: OG.bg,
          color: OG.ink,
          fontFamily: "Funnel Display",
        }}
      >
        <OgHorizon src={horizon} />
        <OgBrand mark={mark} suffix="Blog" />
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: title.length > 60 ? 64 : 80,
            lineHeight: 1.04,
            letterSpacing: -2.5,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: OG.ink2 }}>
          The open-source Typeform alternative ·<span style={{ color: OG.accent, marginLeft: 10 }}>free to start</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
