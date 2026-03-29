import type { WeatherData, ForecastData, CitySuggestion } from "./types";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Fetch current weather by city name */
export async function getWeatherByCity(city: string): Promise<WeatherData> {
    const res = await fetch(`${BASE_URL}/weather/city?city=${city}`);
    if (!res.ok) throw new Error("City not found");
    return res.json();
}

/** Fetch 5-day forecast by city name */
export async function getForecastByCity(city: string): Promise<ForecastData[]> {
    const res = await fetch(`${BASE_URL}/weather/forecast?city=${city}`);
    if (!res.ok) throw new Error("Forecast not found");
    return res.json();
}

/** Fetch current weather by coordinates */
export async function getWeatherByLocation(
    lat: number,
    lon: number
): Promise<WeatherData> {
    const res = await fetch(
        `${BASE_URL}/weather/location?lat=${lat}&lon=${lon}`
    );
    if (!res.ok) throw new Error("Location error");
    return res.json();
}

/** Fetch city name suggestions for autocomplete */
export async function getCitySuggestions(q: string): Promise<CitySuggestion[]> {
    const res = await fetch(`${BASE_URL}/weather/search/cities?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    return res.json();
}