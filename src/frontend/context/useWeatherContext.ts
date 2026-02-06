import { createContext, useContext } from "react";
import { type UseWeatherResult } from "../domains/weather/hooks/useWeather";

export const WeatherContext = createContext<UseWeatherResult | undefined>(undefined);

export const useWeatherContext = () => {
    const context = useContext(WeatherContext);
    if (!context) throw new Error("useWeatherContext must be used within a WeatherProvider");
    return context;
};
