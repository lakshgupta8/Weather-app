import { useEffect, useState } from "react";
import { LocationContext, type LocationContextType } from "./useLocation";
import type { SavedLocation } from "../types";

const STORAGE_KEY = "recentSearches";
const MAX_RECENT = 5;

/**
 * Read saved history, accepting both the current object shape and the
 * plain-string entries written by earlier versions of the app.
 */
const loadRecent = (): SavedLocation[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return [];
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((entry): SavedLocation | null => {
                if (typeof entry === "string") return { name: entry };
                if (entry && typeof entry === "object" && typeof (entry as SavedLocation).name === "string") {
                    const { name, lat, lon } = entry as SavedLocation;
                    return { name, lat, lon };
                }
                return null;
            })
            .filter((entry): entry is SavedLocation => entry !== null)
            .slice(0, MAX_RECENT);
    } catch {
        return [];
    }
};

/**
 * Location Provider
 * Manages search history and selected city.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [recentSearches, setRecentSearches] = useState<SavedLocation[]>(loadRecent);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
        } catch {
            // Storage may be unavailable (private mode, quota); history is best-effort
        }
    }, [recentSearches]);

    const addRecentSearch = (location: SavedLocation) => {
        const name = location.name.trim();
        if (!name) return;
        const entry: SavedLocation = { name, lat: location.lat, lon: location.lon };
        setRecentSearches((prev) => {
            const filtered = prev.filter((item) => item.name.toLowerCase() !== name.toLowerCase());
            return [entry, ...filtered].slice(0, MAX_RECENT);
        });
    };

    const clearHistory = () => {
        setRecentSearches([]);
    };

    const value: LocationContextType = {
        recentSearches,
        addRecentSearch,
        clearHistory
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
}
