import { useState, useCallback } from "react";
import { getWeatherByCity, getWeatherByLocation, getForecastByCity } from "../../../api";
import type { WeatherData, ForecastData } from "../../../types";

export interface UseWeatherResult {
    weather: WeatherData | null;
    forecast: ForecastData[] | null;
    loading: boolean;
    error: string;
    fetchWeatherByCity: (city: string) => Promise<void>;
    fetchWeatherByLocation: (lat: number, lon: number) => Promise<void>;
}

/**
 * Custom hook to manage weather state and API calls.
 * Handles fetching, loading states, and error management.
 */
export const useWeather = (): UseWeatherResult => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastData[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchWeatherByCity = useCallback(async (city: string) => {
        if (!city.trim()) return;
        setLoading(true);
        setError("");
        setWeather(null);
        setForecast(null);

        try {
            // Fetch both current weather and forecast in parallel
            const [weatherData, forecastData] = await Promise.all([
                getWeatherByCity(city),
                getForecastByCity(city)
            ]);

            setWeather(weatherData);
            setForecast(forecastData);
        } catch {
            setError("City not found or network error");
            setWeather(null);
            setForecast(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
        setLoading(true);
        setError("");
        try {
            const data = await getWeatherByLocation(lat, lon);
            setWeather(data);
        } catch {
            setError("Unable to fetch location weather");
        } finally {
            setLoading(false);
        }
    }, []);

    return { weather, forecast, loading, error, fetchWeatherByCity, fetchWeatherByLocation };
};
