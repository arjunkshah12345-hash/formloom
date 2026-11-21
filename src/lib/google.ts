import "server-only";
import crypto from "node:crypto";

/**
 * "Sign in with Google" via the OAuth 2.0 authorization-code flow with PKCE.
 * Turned on by setting GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
 */
export const GOOGLE_STATE_COOKIE = "fl_google";

export function googleEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export const callbackUrl = (base: string) => `${base}/api/auth/google/callback`;

export function googleAuthRequest(redirectUri: string) {
  const state = crypto.randomBytes(16).toString("base64url");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), state, verifier };
}

export type GoogleProfile = { sub: string; email: string; emailVerified: boolean; name: string };

export async function googleProfile(code: string, verifier: string, redirectUri: string): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      code_verifier: verifier,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token exchange failed (${tokenRes.status})`);
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) throw new Error("Google returned no access token");

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${access_token}` },
  });
  if (!infoRes.ok) throw new Error(`Google profile request failed (${infoRes.status})`);
  const info = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string };
  if (!info.sub || !info.email) throw new Error("Google profile is missing an id or email");
  return {
    sub: info.sub,
    email: info.email,
    emailVerified: info.email_verified === true,
    name: info.name || info.email.split("@")[0],
  };
}
