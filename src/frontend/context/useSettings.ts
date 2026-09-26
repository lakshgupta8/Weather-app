import { createContext, useContext } from "react";

export type Unit = "metric" | "imperial";

export interface SettingsContextType {
    unit: Unit;
    toggleUnit: () => void;
    convertTemp: (celsius: number) => number;
    convertSpeed: (ms: number) => number;
    formatTemp: (celsius: number) => string;
    formatSpeed: (ms: number) => string;
    /** Format a distance given in metres (e.g. visibility) as km or miles */
    formatDistance: (metres: number | null) => string;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/** Hook to access user settings (units) */
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
};
