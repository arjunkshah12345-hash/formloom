"use client";

import dynamic from "next/dynamic";

/** The interactive demo pulls in the whole form player, so load it after the page has painted. */
export const ThemedDemoLazy = dynamic(() => import("./ThemedDemo").then((m) => m.ThemedDemo), {
  ssr: false,
  loading: () => <div className="h-[640px] rounded-2xl border border-line bg-surface sm:h-[720px]" aria-hidden />,
});
