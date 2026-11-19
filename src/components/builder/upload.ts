"use client";

export async function uploadImage(file: File): Promise<string | null> {
  const body = new FormData();
  body.set("file", file);
  try {
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      alert(data.error ?? "Upload failed");
      return null;
    }
    return data.url;
  } catch {
    alert("Upload failed");
    return null;
  }
}
