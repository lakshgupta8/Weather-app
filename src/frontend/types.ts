export interface WeatherData {
    city: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    weather: string;
    icon: string;
}

export interface ForecastData {
    date: string;
    temp: number;
    description: string;
    icon: string;
}

export interface CitySuggestion {
    name: string;
    state: string | null;
    country: string;
    lat: number;
    lon: number;
}