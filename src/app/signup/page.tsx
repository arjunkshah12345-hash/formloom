import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { signupsAllowed } from "@/lib/actions/auth";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/forms");
  if (!(await signupsAllowed())) redirect("/login");
  return <AuthForm mode="signup" signupsOpen />;
}
