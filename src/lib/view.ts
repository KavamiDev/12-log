// Small formatting helpers shared by the pages.
import { site } from "../site.config";
import type { Milestone, Status } from "./types";

export const pad = (w: number) => String(w).padStart(2, "0");
export const href = (path = "") => `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
export const fmtDate = (t: number, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: site.timeZone, ...opts }).format(t);
export const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export const statusLabel: Record<Status, { text: string; cls: string }> = {
  in_progress: { text: "in progress", cls: "l-wait" },
  shipped: { text: "shipped", cls: "l-ship" },
  skipped: { text: "skipped", cls: "l-cut" },
  planned: { text: "planned", cls: "l-muted" },
};

/** Body plus trailers, as the commit message reads. */
export const fullBody = (m: Milestone) =>
  [m.body, Object.entries(m.trailers).map(([k, v]) => `${k}: ${v}`).join("\n")].filter(Boolean).join("\n\n");

/** 12 fixed star positions (one per month), picked along the mockup's original path. */
export const STARS: [number, number][] = (
  "44,58 363,63 657,27 983,30 741,127 435,116 139,134 193,203 446,167 745,198 906,268 587,249"
).split(" ").map((p) => p.split(",").map(Number) as [number, number]);
