// The challenge calendar: month 00 = October 2026, one product per month, in Reunion time.
import { site } from "../site.config";

const DAY = 86_400_000;
const OFFSET = 4 * 3_600_000; // Indian/Reunion is UTC+4, no DST
const [Y0, M0] = site.month0.split("-").map(Number) as [number, number];

export const MONTHS = site.months;

/** Index of the month of instant `t` (0 = October 2026), in Reunion local time. */
export function monthOf(t: number): number {
  const d = new Date(t + OFFSET);
  return (d.getUTCFullYear() - Y0) * 12 + (d.getUTCMonth() + 1 - M0);
}
export const currentMonth = (now: number) => Math.min(MONTHS - 1, Math.max(0, monthOf(now)));
export const monthStart = (n: number) => Date.UTC(Y0, M0 - 1 + n, 1) - OFFSET;
/** Last ms of the month: the ship deadline. */
export const monthEnd = (n: number) => monthStart(n + 1) - 1;

/** Activity grid: 53 weeks of days, starting on the Monday on or before 1 October 2026. */
export const GRID_DAYS = 53 * 7;
const first = Date.UTC(Y0, M0 - 1, 1);
export const GRID0 = first - ((new Date(first).getUTCDay() + 6) % 7) * DAY - OFFSET;
export const dayIndex = (t: number) => Math.floor((t - GRID0) / DAY);
