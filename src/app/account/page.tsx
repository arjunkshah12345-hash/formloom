import { AppHeader } from "@/components/app/AppHeader";
import { ApiKeys } from "@/components/app/ApiKeys";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/url";

export const metadata = { title: "API & account" };

export default async function AccountPage() {
  const user = await requireUser();
  const keys = db()
    .prepare("SELECT id, name, preview, created_at AS createdAt, last_used_at AS lastUsedAt FROM api_keys WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as { id: string; name: string; preview: string; createdAt: number; lastUsedAt: number | null }[];
  return (
    <div className="min-h-dvh">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-10">
        <div>
          <h1 className="font-heading text-5xl font-medium tracking-[-0.04em]">Account</h1>
          <p className="mt-2 text-sm text-ink-2">
            Signed in as <b className="font-medium text-ink">{user.name}</b> · {user.email}
          </p>
        </div>
        <ApiKeys keys={keys} baseUrl={await appUrl()} />
      </main>
    </div>
  );
}
