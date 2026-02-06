import { useEffect, useState } from "react";
import { SettingsContext } from "./useSettings";
import type { Unit } from "./useSettings";

/**
 * Settings Provider
 * Manages user preferences like temperature unit (Metric/Imperial).
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [unit, setUnit] = useState<Unit>(() => {
        return (localStorage.getItem("weather-app-settings-unit") as Unit) || "metric";
    });

    useEffect(() => {
        localStorage.setItem("weather-app-settings-unit", unit);
    }, [unit]);

    const toggleUnit = () => {
        setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
    };

    const convertTemp = (celsius: number): number => {
        if (unit === "metric") return celsius;
        return (celsius * 9) / 5 + 32;
    };

    const convertSpeed = (ms: number): number => {
        if (unit === "metric") return ms;
        return ms * 2.237; // m/s to mph
    };

    const formatTemp = (celsius: number): string => {
        const val = convertTemp(celsius);
        return `${Math.round(val)}°${unit === "metric" ? "C" : "F"}`;
    };

    const formatSpeed = (ms: number): string => {
        const val = convertSpeed(ms);
        return `${Math.round(val)} ${unit === "metric" ? "m/s" : "mph"}`;
    };

    return (
        <SettingsContext.Provider value={{ unit, toggleUnit, convertTemp, convertSpeed, formatTemp, formatSpeed }}>
            {children}
        </SettingsContext.Provider>
    );
}
