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