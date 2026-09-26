export interface WeatherData {
    city: string;
    country: string | null;
    lat: number;
    lon: number;
    /** All temperatures are in Celsius; the client converts for display */
    temperature: number;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    /** Atmospheric pressure in hPa */
    pressure: number;
    /** Visibility in metres, or null when the provider omits it */
    visibility: number | null;
    /** Wind speed in m/s */
    windSpeed: number;
    weather: string;
    description: string;
    icon: string;
    /** Unix seconds, or null when unavailable */
    sunrise: number | null;
    sunset: number | null;
    /** Offset from UTC in seconds */
    timezone: number;
}

export interface ForecastData {
    /** Calendar day in the city's local timezone, formatted YYYY-MM-DD */
    date: string;
    /** Headline temperature (slot closest to local noon), Celsius */
    temp: number;
    tempMin: number;
    tempMax: number;
    description: string;
    icon: string;
}

export interface HourlyForecast {
    /** Unix seconds */
    time: number;
    temp: number;
    description: string;
    icon: string;
    /** Precipitation probability, 0..100 */
    pop: number;
}

export interface ForecastResponse {
    /** Offset from UTC in seconds for the forecast location */
    timezone: number;
    daily: ForecastData[];
    /** The next 24 hours in 3-hour steps */
    hourly: HourlyForecast[];
}

export interface CitySuggestion {
    name: string;
    state: string | null;
    country: string;
    lat: number;
    lon: number;
}

/**
 * A place the user has searched for or picked from autocomplete.
 * Coordinates are present when the entry came from a geocoded suggestion,
 * which lets us fetch the exact city rather than the first name match.
 */
export interface SavedLocation {
    name: string;
    lat?: number;
    lon?: number;
}

export const hasCoords = (loc: SavedLocation): loc is SavedLocation & { lat: number; lon: number } =>
    typeof loc.lat === "number" && Number.isFinite(loc.lat) &&
    typeof loc.lon === "number" && Number.isFinite(loc.lon);
