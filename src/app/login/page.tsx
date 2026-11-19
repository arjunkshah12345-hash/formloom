import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { signupsAllowed } from "@/lib/actions/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/forms");
  const { next } = await searchParams;
  return <AuthForm mode="login" next={typeof next === "string" ? next : undefined} signupsOpen={await signupsAllowed()} />;
}
