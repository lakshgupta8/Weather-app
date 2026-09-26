import type { WeatherData, ForecastData, CitySuggestion } from "./types";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

/** Build a URL under BASE_URL with every query param properly encoded */
const buildUrl = (path: string, params: Record<string, string | number>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        query.set(key, String(value));
    }
    return `${BASE_URL}${path}?${query.toString()}`;
};

/** Perform a GET and surface the backend's error message when the response is not OK */
async function request<T>(path: string, params: Record<string, string | number>, fallback: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(buildUrl(path, params), { signal });
    if (!res.ok) {
        let message = fallback;
        try {
            const body = await res.json();
            if (body && typeof body.error === "string") message = body.error;
        } catch {
            // Non-JSON error body; keep the fallback message
        }
        throw new ApiError(message, res.status);
    }
    return res.json();
}

/** Fetch current weather by city name */
export function getWeatherByCity(city: string, signal?: AbortSignal): Promise<WeatherData> {
    return request<WeatherData>("/weather/city", { city }, "City not found", signal);
}

/** Fetch 5-day forecast by city name */
export function getForecastByCity(city: string, signal?: AbortSignal): Promise<ForecastData[]> {
    return request<ForecastData[]>("/weather/forecast", { city }, "Forecast not found", signal);
}

/** Fetch current weather by coordinates */
export function getWeatherByLocation(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
    return request<WeatherData>("/weather/location", { lat, lon }, "Location error", signal);
}

/** Fetch 5-day forecast by coordinates */
export function getForecastByLocation(lat: number, lon: number, signal?: AbortSignal): Promise<ForecastData[]> {
    return request<ForecastData[]>("/weather/forecast", { lat, lon }, "Forecast not found", signal);
}

/** Fetch city name suggestions for autocomplete */
export async function getCitySuggestions(q: string, signal?: AbortSignal): Promise<CitySuggestion[]> {
    try {
        return await request<CitySuggestion[]>("/weather/search/cities", { q }, "Search failed", signal);
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        return [];
    }
}
