import { describe, expect, it } from "vitest";
import { weatherPath } from "./routes";

describe("weatherPath", () => {
    it("encodes the city name", () => {
        expect(weatherPath({ name: "São Paulo" })).toBe("/weather/S%C3%A3o%20Paulo");
    });

    it("carries coordinates as query params when present", () => {
        expect(weatherPath({ name: "Springfield", lat: 39.8, lon: -89.6 })).toBe("/weather/Springfield?lat=39.8&lon=-89.6");
    });

    it("ignores partial or invalid coordinates", () => {
        expect(weatherPath({ name: "X", lat: 1 })).toBe("/weather/X");
        expect(weatherPath({ name: "X", lat: NaN, lon: 2 })).toBe("/weather/X");
    });
});
