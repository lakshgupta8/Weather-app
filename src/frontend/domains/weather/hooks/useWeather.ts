import { useState, useCallback, useRef, useEffect } from "react";
import {
    ApiError,
    getWeatherByCity,
    getWeatherByLocation,
    getForecastByCity,
    getForecastByLocation,
} from "../../../api";
import type { WeatherData, ForecastData } from "../../../types";

export interface UseWeatherResult {
    weather: WeatherData | null;
    forecast: ForecastData[] | null;
    loading: boolean;
    error: string;
    /** Resolves to true when the fetch succeeded and the state now holds its result */
    fetchWeatherByCity: (city: string) => Promise<boolean>;
    /** Resolves to true when the fetch succeeded and the state now holds its result */
    fetchWeatherByLocation: (lat: number, lon: number) => Promise<boolean>;
}

type Fetcher = (signal: AbortSignal) => Promise<[WeatherData, ForecastData[]]>;

/**
 * Custom hook to manage weather state and API calls.
 * Handles fetching, loading states, and error management.
 *
 * Each new fetch aborts the previous in-flight one, so a slow response for
 * an earlier city can never overwrite the result of a later one.
 */
export const useWeather = (): UseWeatherResult => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastData[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const controllerRef = useRef<AbortController | null>(null);

    // Abort anything still in flight when the owner unmounts
    useEffect(() => () => controllerRef.current?.abort(), []);

    const run = useCallback(async (fetcher: Fetcher, fallbackError: string): Promise<boolean> => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true);
        setError("");
        setWeather(null);
        setForecast(null);

        try {
            const [weatherData, forecastData] = await fetcher(controller.signal);
            if (controller.signal.aborted) return false;
            setWeather(weatherData);
            setForecast(forecastData);
            return true;
        } catch (err) {
            if (controller.signal.aborted) return false;
            setError(err instanceof ApiError ? err.message : fallbackError);
            return false;
        } finally {
            // Only the most recent request may clear the loading flag
            if (controllerRef.current === controller) setLoading(false);
        }
    }, []);

    /** Forecast is best-effort: a missing forecast should not hide current conditions */
    const withForecast = (
        weatherPromise: Promise<WeatherData>,
        forecastPromise: Promise<ForecastData[]>
    ): Promise<[WeatherData, ForecastData[]]> =>
        Promise.all([weatherPromise, forecastPromise.catch(() => [] as ForecastData[])]);

    const fetchWeatherByCity = useCallback(async (city: string) => {
        const name = city.trim();
        if (!name) return false;
        return run(
            (signal) => withForecast(getWeatherByCity(name, signal), getForecastByCity(name, signal)),
            "City not found or network error"
        );
    }, [run]);

    const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
        return run(
            (signal) => withForecast(getWeatherByLocation(lat, lon, signal), getForecastByLocation(lat, lon, signal)),
            "Unable to fetch location weather"
        );
    }, [run]);

    return { weather, forecast, loading, error, fetchWeatherByCity, fetchWeatherByLocation };
};
