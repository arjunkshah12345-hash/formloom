import { notFound } from "next/navigation";
import { TopBar } from "@/components/builder/TopBar";
import { WorkspaceProvider } from "@/components/builder/workspace";
import { requireUser } from "@/lib/auth";
import { getForm } from "@/lib/forms";
import { appUrl } from "@/lib/url";

export default async function FormLayout({ children, params }: LayoutProps<"/forms/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const form = await getForm(id, user.id);
  if (!form) notFound();
  return (
    <WorkspaceProvider
      key={form.id}
      formId={form.id}
      slug={form.slug}
      initial={form.draft}
      published={form.published}
      appUrl={await appUrl()}
    >
      <div className="flex h-dvh flex-col overflow-hidden">
        <TopBar />
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </WorkspaceProvider>
  );
}
