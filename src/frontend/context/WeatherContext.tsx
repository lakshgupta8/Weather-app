import { type ReactNode } from "react";
import { useWeather } from "../domains/weather/hooks/useWeather";
import { WeatherContext } from "./useWeatherContext";

/**
 * Weather Provider
 * Exposes weather data and fetch actions globally.
 */
export function WeatherProvider({ children }: { children: ReactNode }) {
    const weatherState = useWeather();

    return (
        <WeatherContext.Provider value={weatherState}>
            {children}
        </WeatherContext.Provider>
    );
}
