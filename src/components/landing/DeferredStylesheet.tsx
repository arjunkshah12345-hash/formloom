"use client";

import { useEffect } from "react";

/** Adds a stylesheet after hydration so it never blocks the first paint. */
export function DeferredStylesheet({ href }: { href: string }) {
  useEffect(() => {
    if (document.querySelector(`link[data-deferred="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.deferred = href;
    document.head.appendChild(link);
  }, [href]);
  return null;
}
