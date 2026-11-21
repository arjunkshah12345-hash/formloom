"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  findUserByEmail,
  insertUser,
  userCount,
  verifyPassword,
} from "@/lib/auth";
import { createForm } from "@/lib/forms";
import { TEMPLATES } from "@/lib/templates";

export type AuthState = { error?: string; email?: string; name?: string } | undefined;

export async function signupsAllowed() {
  return process.env.ALLOW_SIGNUPS !== "false" || await userCount() === 0;
}

export async function signup(_: AuthState, data: FormData): Promise<AuthState> {
  const email = String(data.get("email") ?? "").trim();
  const name = String(data.get("name") ?? "").trim();
  const password = String(data.get("password") ?? "");
  if (!(await signupsAllowed())) return { error: "Sign-ups are disabled on this instance.", email, name };
  if (!name) return { error: "Please tell us your name.", email, name };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address.", email, name };
  if (password.length < 8) return { error: "Use at least 8 characters for your password.", email, name };
  if (await findUserByEmail(email)) return { error: "An account with this email already exists.", email, name };

  const user = await insertUser(email, name, password);
  // Give new accounts something to look at.
  await createForm(user.id, TEMPLATES.find((t) => t.key === "nps")!.build());
  await createSession(user.id);
  redirect("/forms");
}

export async function login(_: AuthState, data: FormData): Promise<AuthState> {
  const email = String(data.get("email") ?? "").trim();
  const password = String(data.get("password") ?? "");
  const user = await findUserByEmail(email);
  if (!user || !await verifyPassword(password, user.password_hash)) {
    return { error: "That email and password don't match.", email };
  }
  await createSession(user.id);
  const next = String(data.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/forms");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
