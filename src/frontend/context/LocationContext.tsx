import { useEffect, useState } from "react";
import { LocationContext, type LocationContextType } from "./useLocation";

/**
 * Location Provider
 * Manages search history and selected city.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem("recentSearches");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }, [recentSearches]);

    const addRecentSearch = (city: string) => {
        setRecentSearches((prev) => {
            const normalized = city.trim();
            const filtered = prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
            return [normalized, ...filtered].slice(0, 5); // Keep last 5
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
