import { describe, expect, it } from "vitest";
import { conditionGradient } from "./weatherTheme";

describe("conditionGradient", () => {
    it("distinguishes day and night for the same condition", () => {
        expect(conditionGradient("01d")).not.toBe(conditionGradient("01n"));
        expect(conditionGradient("01n")).toContain("indigo");
    });

    it("gives rain and clear sky different palettes", () => {
        expect(conditionGradient("10d")).not.toBe(conditionGradient("01d"));
    });

    it("falls back to the brand blue for unknown or missing codes", () => {
        expect(conditionGradient("99x")).toBe("from-blue-500 to-blue-600");
        expect(conditionGradient(undefined)).toBe("from-blue-500 to-blue-600");
    });

    it("always returns a from-/to- pair", () => {
        for (const code of ["01d", "02n", "04d", "09n", "11d", "13d", "50d"]) {
            expect(conditionGradient(code)).toMatch(/^from-\S+ to-\S+$/);
        }
    });
});
