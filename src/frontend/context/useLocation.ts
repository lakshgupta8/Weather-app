import { createContext, useContext } from "react";
import type { SavedLocation } from "../types";

export interface LocationContextType {
    recentSearches: SavedLocation[];
    addRecentSearch: (location: SavedLocation) => void;
    clearHistory: () => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

/** Hook to access location history */
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) throw new Error("useLocation must be used within a LocationProvider");
    return context;
};
