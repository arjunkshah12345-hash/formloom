import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uid } from "@/lib/schema";
import { MAX_UPLOAD_BYTES, MIME_EXT, saveUpload } from "@/lib/uploads";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const data = await req.formData().catch(() => null);
  const file = data?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const ext = MIME_EXT[file.type];
  if (!ext) return NextResponse.json({ error: "Use a PNG, JPG, GIF, WebP or AVIF image." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Images must be under 8 MB." }, { status: 413 });
  const name = `${uid()}${uid()}.${ext}`;
  await saveUpload(name, await file.arrayBuffer());
  return NextResponse.json({ url: `/api/uploads/${name}` });
}
