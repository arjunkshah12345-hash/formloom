import { redirect } from "next/navigation";

export default async function FormIndex({ params }: PageProps<"/forms/[id]">) {
  const { id } = await params;
  redirect(`/forms/${id}/edit`);
}
