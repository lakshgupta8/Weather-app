import { describe, expect, it } from "vitest";
import { formatForecastDate, formatLocalHour, formatLocalTime } from "./format";

describe("formatForecastDate", () => {
    it("formats a YYYY-MM-DD string as the same calendar day, without timezone drift", () => {
        expect(formatForecastDate("2026-09-26", { day: "numeric" })).toBe("26");
        expect(formatForecastDate("2026-09-26", { weekday: "long" })).toBe("Saturday");
        expect(formatForecastDate("2026-01-01", { month: "long" })).toBe("January");
    });

    it("returns the input untouched when it is not a date", () => {
        expect(formatForecastDate("today")).toBe("today");
    });
});

describe("formatLocalTime", () => {
    it("renders wall-clock time in the city's zone regardless of the viewer's zone", () => {
        // Unix epoch is 00:00 UTC; with a +1h offset the city reads 01:00
        expect(formatLocalTime(0, 3600, { hour: "2-digit", minute: "2-digit", hour12: false })).toBe("01:00");
        // -5h wraps to the previous evening
        expect(formatLocalTime(0, -5 * 3600, { hour: "2-digit", minute: "2-digit", hour12: false })).toBe("19:00");
    });

    it("has an hour-only variant", () => {
        expect(formatLocalHour(0, 0)).toMatch(/12|0/);
    });
});
