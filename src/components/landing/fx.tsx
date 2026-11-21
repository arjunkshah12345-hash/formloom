"use client";

import { useSyncExternalStore } from "react";
import { AsciiText } from "@/components/ascii/ascii-text";
import { BarChart } from "@/components/dithercn/bar-chart";
import { DitherGlobe } from "@/components/dithercn/dither-globe";
import { DonutChart } from "@/components/dithercn/donut-chart";
import { StatCard } from "@/components/dithercn/stat-card";
import { Aurora } from "@/components/gradients/aurora";
import { GrainGradient } from "@/components/gradients/grain-gradient";

const EMBER = ["#ff5b2e", "#ff9442", "#8f2410", "#3a0f05"] as const;

/** gradients.sh aurora, dithered, behind the hero. */
export function HeroBackdrop() {
  return (
    <Aurora
      aria-hidden
      className="absolute inset-0"
      colors={[...EMBER]}
      background="#0b0b0a"
      speed={0.45}
      grain={0.08}
      blur={0.3}
      dither={{ enabled: true, cell: 3, levels: 5 }}
      interaction={{ pointer: 0.25, scroll: 0.15 }}
    />
  );
}

/** gradients.sh grain gradient for the closing call to action. */
export function CtaBackdrop() {
  return (
    <GrainGradient
      aria-hidden
      className="absolute inset-0"
      colors={["#ff5b2e", "#ffb069", "#c2340f", "#1a0904"]}
      background="#120704"
      speed={0.35}
      dither={{ enabled: true, cell: 4, levels: 4 }}
    />
  );
}

const noop = () => () => {};

/** Giant asciicn wordmark in the display font. */
export function AsciiWordmark({ text, aspect = "aspect-[5/1]" }: { text: string; aspect?: string }) {
  const family = useSyncExternalStore(
    noop,
    () => getComputedStyle(document.documentElement).getPropertyValue("--font-funnel").trim() || "ui-sans-serif, sans-serif",
    () => null,
  );
  if (!family) return <div className={`${aspect} w-full`} />;
  return (
    <AsciiText
      text={text}
      font={`700 220px ${family}`}
      fontSize={9}
      charset="blocks"
      className={`block ${aspect} w-full text-accent`}
      aria-hidden
    />
  );
}

export function Globe() {
  return (
    <DitherGlobe
      className="mx-auto aspect-square w-full max-w-[520px]"
      color="grey"
      accent="orange"
      speed={0.6}
      tilt={18}
      markers={[
        { at: [52.52, 13.4] },
        { at: [37.77, -122.42] },
        { at: [35.68, 139.69] },
        { at: [-33.87, 151.21] },
        { at: [19.08, 72.88] },
        { at: [-23.55, -46.63] },
      ]}
      arcs={[
        { from: [52.52, 13.4], to: [37.77, -122.42] },
        { from: [35.68, 139.69], to: [19.08, 72.88] },
        { from: [-23.55, -46.63], to: [52.52, 13.4] },
      ]}
    />
  );
}

const FUNNEL = [
  { q: "Q1", reached: 100 },
  { q: "Q2", reached: 94 },
  { q: "Q3", reached: 88 },
  { q: "Q4", reached: 61 },
  { q: "Q5", reached: 58 },
];

/** Results preview built from dithercn charts. */
export function AnalyticsPanel() {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Views" value={4812} delta={12.4} trend={[22, 30, 28, 41, 38, 52, 61]} color="orange" />
        <StatCard label="Completion" value="58%" delta={6.1} trend={[40, 44, 43, 50, 49, 55, 58]} color="green" />
        <StatCard label="Avg. time" value="1:14" delta={-8.2} good="down" trend={[96, 90, 88, 84, 80, 77, 74]} color="grey" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-tech text-[10px] tracking-[0.14em] text-ink-3 uppercase">Drop-off by question</span>
            <span className="font-tech text-[10px] text-accent">Q4 −27%</span>
          </div>
          <BarChart
            className="mt-4"
            data={FUNNEL}
            x="q"
            series={[{ label: "Reached", value: "reached", color: "orange" }]}
            highlight={3}
            height={230}
            format={(v: number) => `${v}%`}
          />
        </div>
        <div className="flex flex-col rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-tech text-[10px] tracking-[0.14em] text-ink-3 uppercase">Net Promoter Score</span>
            <span className="font-heading text-2xl font-medium tracking-tight text-emerald-400">+42</span>
          </div>
          <div className="flex flex-1 items-center justify-center py-2">
            <DonutChart
              label="Responses"
              size={180}
              data={[
                { label: "Promoters", value: 290, color: "green" },
                { label: "Passives", value: 130, color: "grey" },
                { label: "Detractors", value: 80, color: "orange" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
