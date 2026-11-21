import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { secureCookies } from "@/lib/auth";
import { callbackUrl, GOOGLE_STATE_COOKIE, googleAuthRequest, googleEnabled } from "@/lib/google";
import { appUrl } from "@/lib/url";

/** Starts "Continue with Google": remembers state + PKCE verifier, then hands off to Google. */
export async function GET(req: Request) {
  const base = await appUrl();
  if (!googleEnabled()) return NextResponse.redirect(`${base}/login`);
  const next = new URL(req.url).searchParams.get("next") ?? "";
  const { url, state, verifier } = googleAuthRequest(callbackUrl(base));
  (await cookies()).set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, verifier, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/api/auth/google",
    maxAge: 600,
  });
  return NextResponse.redirect(url);
}
