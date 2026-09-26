import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LocationProvider } from "./LocationContext";
import { useLocation } from "./useLocation";

const renderLocation = () => renderHook(() => useLocation(), { wrapper: LocationProvider });

describe("LocationProvider", () => {
    it("migrates legacy string entries and skips junk", () => {
        localStorage.setItem("recentSearches", JSON.stringify(["Old City", { name: "New City", lat: 1, lon: 2 }, 42, null]));
        const { result } = renderLocation();
        expect(result.current.recentSearches).toEqual([
            { name: "Old City", lat: undefined, lon: undefined },
            { name: "New City", lat: 1, lon: 2 },
        ]);
    });

    it("dedupes case-insensitively, keeps the newest first, and caps at five", () => {
        const { result } = renderLocation();

        act(() => result.current.addRecentSearch({ name: "London" }));
        act(() => result.current.addRecentSearch({ name: "Paris" }));
        act(() => result.current.addRecentSearch({ name: "london", lat: 51.5, lon: -0.1 }));
        expect(result.current.recentSearches.map((l) => l.name)).toEqual(["london", "Paris"]);
        expect(result.current.recentSearches[0]).toEqual({ name: "london", lat: 51.5, lon: -0.1 });

        for (const name of ["A", "B", "C", "D"]) {
            act(() => result.current.addRecentSearch({ name }));
        }
        expect(result.current.recentSearches).toHaveLength(5);
        expect(result.current.recentSearches[0].name).toBe("D");
    });

    it("persists to localStorage and clears", () => {
        const { result } = renderLocation();
        act(() => result.current.addRecentSearch({ name: "  Berlin  " }));
        expect(JSON.parse(localStorage.getItem("recentSearches") ?? "[]")).toEqual([{ name: "Berlin" }]);

        act(() => result.current.clearHistory());
        expect(localStorage.getItem("recentSearches")).toBe("[]");
    });

    it("recovers from corrupt storage", () => {
        localStorage.setItem("recentSearches", "{not json");
        const { result } = renderLocation();
        expect(result.current.recentSearches).toEqual([]);
    });
});
