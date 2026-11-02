import { describe, expect, it } from "vitest";
import { monthOf, currentMonth, monthStart, monthEnd, dayIndex, GRID_DAYS, MONTHS } from "./month";

// Reunion is UTC+4, no DST: 2026-10-01 00:00 local = 2026-09-30 20:00 UTC.
const utc = (s: string) => Date.parse(s);

describe("monthOf", () => {
  it("starts month 00 on 1 October 2026, 00:00 Reunion", () => {
    expect(monthOf(utc("2026-09-30T20:00:00Z"))).toBe(0);
    expect(monthOf(utc("2026-09-30T19:59:59Z"))).toBe(-1);
  });
  it("switches at midnight Reunion, not UTC", () => {
    expect(monthOf(utc("2026-10-31T19:59:00Z"))).toBe(0); // 31 Oct 23:59 Reunion
    expect(monthOf(utc("2026-10-31T20:30:00Z"))).toBe(1); // 1 Nov 00:30 Reunion
  });
  it("crosses the new year", () => {
    expect(monthOf(utc("2027-01-15T12:00:00Z"))).toBe(3);
    expect(monthOf(utc("2027-09-15T12:00:00Z"))).toBe(11);
  });
});

describe("currentMonth", () => {
  it("clamps to the 12 months of the challenge", () => {
    expect(MONTHS).toBe(12);
    expect(currentMonth(utc("2026-01-01T00:00:00Z"))).toBe(0);
    expect(currentMonth(utc("2026-11-05T12:00:00Z"))).toBe(1);
    expect(currentMonth(utc("2028-01-01T00:00:00Z"))).toBe(11);
  });
});

describe("monthStart / monthEnd", () => {
  it("gives the first and last instant of a month, Reunion time", () => {
    expect(new Date(monthStart(1)).toISOString()).toBe("2026-10-31T20:00:00.000Z");
    expect(new Date(monthEnd(1)).toISOString()).toBe("2026-11-30T19:59:59.999Z");
    expect(new Date(monthEnd(2)).toISOString()).toBe("2026-12-31T19:59:59.999Z");
  });
});

describe("dayIndex", () => {
  it("counts Reunion days from the Monday before 1 October 2026", () => {
    expect(GRID_DAYS).toBe(371); // 53 weeks
    expect(dayIndex(utc("2026-09-27T20:00:00Z"))).toBe(0); // Monday 28 Sep, 00:00 Reunion
    expect(dayIndex(utc("2026-09-30T20:00:00Z"))).toBe(3); // Thursday 1 Oct
  });
});
