import {
  AlignLeft,
  AtSign,
  Calendar,
  CheckSquare,
  ChevronDownSquare,
  Gauge,
  Hash,
  Image as ImageIcon,
  Link2,
  ListChecks,
  Phone,
  Quote,
  Scale,
  ShieldCheck,
  Star,
  ToggleLeft,
  Type,
} from "lucide-react";
import type { ComponentType } from "react";
import { FIELD_META, type FieldType } from "@/lib/schema";

const ICONS: Record<FieldType, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  short_text: Type,
  long_text: AlignLeft,
  email: AtSign,
  phone: Phone,
  url: Link2,
  number: Hash,
  multiple_choice: ListChecks,
  picture_choice: ImageIcon,
  dropdown: ChevronDownSquare,
  yes_no: ToggleLeft,
  legal: ShieldCheck,
  rating: Star,
  opinion_scale: Scale,
  nps: Gauge,
  date: Calendar,
  statement: Quote,
};

export function TypeIcon({ type, size = "md" }: { type: FieldType; size?: "sm" | "md" }) {
  const Icon = ICONS[type] ?? CheckSquare;
  const meta = FIELD_META[type];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md ${size === "sm" ? "size-5" : "size-7"}`}
      style={{ background: `${meta.color}1f`, color: meta.color }}
    >
      <Icon className={size === "sm" ? "size-3" : "size-4"} strokeWidth={2.2} />
    </span>
  );
}
