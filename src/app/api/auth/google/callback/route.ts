import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signupsAllowed } from "@/lib/actions/auth";
import { createSession, findUserByEmail, findUserByGoogleId, insertUser, linkGoogle } from "@/lib/auth";
import { createForm } from "@/lib/forms";
import { callbackUrl, GOOGLE_STATE_COOKIE, googleEnabled, googleProfile } from "@/lib/google";
import { TEMPLATES } from "@/lib/templates";
import { appUrl } from "@/lib/url";

export async function GET(req: Request) {
  const base = await appUrl();
  const fail = (message: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`);
  if (!googleEnabled()) return fail("Google sign-in isn't set up on this instance.");

  const params = new URL(req.url).searchParams;
  const jar = await cookies();
  const saved = jar.get(GOOGLE_STATE_COOKIE)?.value;
  jar.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
  if (params.get("error")) return fail("Google sign-in was cancelled.");

  let flow: { state?: string; verifier?: string; next?: string } = {};
  try {
    flow = saved ? JSON.parse(saved) : {};
  } catch {}
  const code = params.get("code");
  if (!code || !flow.state || !flow.verifier || params.get("state") !== flow.state) {
    return fail("That sign-in link expired. Please try again.");
  }

  let profile;
  try {
    profile = await googleProfile(code, flow.verifier, callbackUrl(base));
  } catch (e) {
    console.error("google sign-in", e);
    return fail("Couldn't reach Google. Please try again.");
  }
  if (!profile.emailVerified) return fail("Your Google email isn't verified yet.");

  let user = await findUserByGoogleId(profile.sub);
  if (!user) {
    const existing = await findUserByEmail(profile.email);
    if (existing) {
      // Same verified email: attach Google to the existing account.
      await linkGoogle(existing.id, profile.sub);
      user = existing;
    } else {
      if (!(await signupsAllowed())) return fail("Sign-ups are disabled on this instance.");
      user = await insertUser(profile.email, profile.name, null, profile.sub);
      await createForm(user.id, TEMPLATES.find((t) => t.key === "nps")!.build());
    }
  }

  await createSession(user.id);
  const next = flow.next ?? "";
  return NextResponse.redirect(`${base}${next.startsWith("/") && !next.startsWith("//") ? next : "/forms"}`);
}
