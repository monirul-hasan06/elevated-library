import { clsx, type ClassValue } from "clsx";
import type { Lang } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function money(value: number | string | null | undefined) {
  const n = Number(value || 0);
  return `৳${n.toFixed(0)}`;
}

export function pickLang(lang: Lang, bn?: string | null, en?: string | null) {
  if (lang === "en") return en || bn || "";
  return bn || en || "";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
