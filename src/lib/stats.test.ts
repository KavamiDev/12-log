import { describe, expect, it } from "vitest";
import type { Milestone, Product } from "./types";
import { productStatus, productFields, streak, counters, activityLevels, formatCommitDate } from "./stats";

const utc = (s: string) => Date.parse(s);
let n = 0;
const ms = (type: Milestone["type"], month: number, at: string, trailers: Record<string, string> = {}): Milestone => ({
  sha: `sha${n++}`, repo: "KavamiDev/p", type, month, subject: "s", body: "", trailers,
  committedAt: utc(at), url: null,
});
const product = (month: number, milestones: Milestone[]): Product => ({
  month, slug: `p${month}`, name: `P${month}`, repo: `KavamiDev/p${month}`, isPublic: true,
  homepage: null, description: null, milestones,
});

const DEC = utc("2026-12-15T12:00:00Z"); // month 02 (December)

describe("productStatus", () => {
  it("is shipped as soon as there is a ship", () => {
    expect(productStatus(product(0, [ms("init", 0, "2026-10-15T08:00:00Z"), ms("ship", 0, "2026-10-28T10:00:00Z")]), DEC)).toBe("shipped");
  });
  it("is in_progress for the current month with milestones", () => {
    expect(productStatus(product(2, [ms("init", 2, "2026-12-02T08:00:00Z")]), DEC)).toBe("in_progress");
  });
  it("is in_progress when work started ahead of its month", () => {
    expect(productStatus(product(3, [ms("init", 3, "2026-12-10T08:00:00Z")]), DEC)).toBe("in_progress");
  });
  it("is skipped when its month is past without ship", () => {
    expect(productStatus(product(1, [ms("init", 1, "2026-11-03T08:00:00Z")]), DEC)).toBe("skipped");
  });
  it("is planned otherwise", () => {
    expect(productStatus(product(5, []), DEC)).toBe("planned");
    expect(productStatus(product(2, []), DEC)).toBe("planned");
  });
});

describe("productFields", () => {
  it("takes the latest ship and verdict trailers", () => {
    const f = productFields(product(0, [
      ms("ship", 0, "2026-10-18T10:00:00Z", { Price: "5 EUR", Demo: "https://old", Hours: "6" }),
      ms("ship", 0, "2026-10-18T12:00:00Z", { Price: "9 EUR", Demo: "https://new", Video: "https://v", Hours: "7" }),
      ms("verdict", 0, "2026-11-17T10:00:00Z", { Visitors: "120", Signups: "10", Paying: "3", Revenue: "27 EUR", Lesson: "Price higher" }),
    ]));
    expect(f).toEqual({
      price: { amount: 9, currency: "EUR" }, demoUrl: "https://new", videoUrl: "https://v", hours: 7,
      verdict: { visitors: 120, signups: 10, paying: 3, revenue: 27, lesson: "Price higher" },
    });
  });
  it("is empty without ship or verdict", () => {
    expect(productFields(product(0, [ms("init", 0, "2026-10-15T08:00:00Z")]))).toEqual({});
  });
});

describe("streak", () => {
  it("counts consecutive shipped months ending at the last finished month", () => {
    expect(streak(new Set([0, 1]), 2)).toBe(2);
    expect(streak(new Set([0, 2]), 3)).toBe(1);
  });
  it("includes the current month when it is shipped", () => {
    expect(streak(new Set([0, 1, 2]), 2)).toBe(3);
  });
  it("is 0 at the start or after a miss", () => {
    expect(streak(new Set(), 0)).toBe(0);
    expect(streak(new Set([0]), 2)).toBe(0);
  });
});

describe("counters", () => {
  it("computes shipped, streak, revenue and current month", () => {
    const products = [
      product(0, [ms("ship", 0, "2026-10-16T10:00:00Z"), ms("verdict", 0, "2026-11-17T10:00:00Z", { Revenue: "15 EUR" })]),
      product(1, [ms("ship", 1, "2026-11-28T10:00:00Z"), ms("verdict", 1, "2026-12-28T10:00:00Z", { Revenue: "10,50 EUR" })]),
      product(2, [ms("init", 2, "2026-12-02T08:00:00Z")]),
    ];
    expect(counters(products, DEC)).toEqual({ currentMonth: 2, shipped: 2, streak: 2, revenue: 25.5 });
  });
  it("is honest when empty", () => {
    expect(counters([], utc("2026-10-16T12:00:00Z"))).toEqual({ currentMonth: 0, shipped: 0, streak: 0, revenue: 0 });
  });
});

describe("activityLevels", () => {
  it("returns one cell per grid day with levels 0..4", () => {
    const list = [
      ms("init", 0, "2026-10-01T08:00:00Z"),
      ...Array.from({ length: 6 }, () => ms("progress", 0, "2026-10-03T08:00:00Z")),
      ms("init", 0, "2026-09-01T08:00:00Z"), // before the grid, dropped
    ];
    const levels = activityLevels(list);
    expect(levels).toHaveLength(371);
    expect(levels[3]).toBe(1); // Thursday 1 October
    expect(levels[5]).toBe(4);
    expect(levels.reduce((a, b) => a + b, 0)).toBe(5);
  });
});

describe("formatCommitDate", () => {
  const now = utc("2026-10-20T12:00:00Z");
  it.each([
    ["2026-10-20T11:59:40Z", "just now"],
    ["2026-10-20T11:59:00Z", "1 minute ago"],
    ["2026-10-20T09:00:00Z", "3 hours ago"],
    ["2026-10-19T12:00:00Z", "1 day ago"],
    ["2026-10-15T08:00:00Z", "5 days ago"],
    ["2026-10-13T11:00:00Z", "on Oct 13"],
    ["2025-10-13T11:00:00Z", "on Oct 13, 2025"],
  ])("%s → %s", (at, out) => {
    expect(formatCommitDate(utc(at), now)).toBe(out);
  });
  it("uses the Reunion calendar day", () => {
    // 2026-10-12 21:00 UTC = Oct 13 01:00 Reunion
    expect(formatCommitDate(utc("2026-10-12T21:00:00Z"), now)).toBe("on Oct 13");
  });
});
