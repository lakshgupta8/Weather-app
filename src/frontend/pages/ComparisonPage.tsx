import { useState, useCallback } from "react";
import { Loader2, ArrowRightLeft, Thermometer, Droplets, Wind, MapPin } from "lucide-react";
import { CitySearch } from "../components/CitySearch";
import { WeatherIcon } from "../components/WeatherIcon";
import { TemperatureChart } from "../components/TemperatureChart";
import { useSettings } from "../context/useSettings";
import { getForecastByCity, getWeatherByCity } from "../api";
import type { WeatherData, ForecastData } from "../types";

export const ComparisonPage = () => {
    const [leftCity, setLeftCity] = useState<{ weather: WeatherData | null; forecast: ForecastData[] | null; loading: boolean; error: string | null }>({
        weather: null, forecast: null, loading: false, error: null
    });

    const [rightCity, setRightCity] = useState<{ weather: WeatherData | null; forecast: ForecastData[] | null; loading: boolean; error: string | null }>({
        weather: null, forecast: null, loading: false, error: null
    });

    /** Handlers fetching weather data for left or right panel. */
    const fetchData = useCallback(async (city: string, side: "left" | "right") => {
        const setTarget = side === "left" ? setLeftCity : setRightCity;

        setTarget(prev => ({ ...prev, loading: true, error: null }));

        try {
            const [weather, forecast] = await Promise.all([
                getWeatherByCity(city),
                getForecastByCity(city)
            ]);
            setTarget({ weather, forecast, loading: false, error: null });
        } catch {
            setTarget(prev => ({ ...prev, loading: false, error: "Failed to fetch data" }));
        }
    }, []);

    return (
        <div className="space-y-8 animate-in duration-500 fade-in">
            <header className="space-y-2 text-center">
                <h1 className="flex justify-center items-center gap-3 font-bold text-slate-800 dark:text-slate-100 text-3xl">
                    <ArrowRightLeft className="w-8 h-8 text-blue-500" />
                    Compare Cities
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Compare weather conditions and forecasts side by side</p>
            </header>

            <div className="gap-6 grid md:grid-cols-2">
                {/* Left City Input */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300 text-sm">City A</label>
                        <CitySearch onCitySelect={(city) => fetchData(city, "left")} />
                    </div>
                    <CityCard data={leftCity} />
                </div>

                {/* Right City Input */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300 text-sm">City B</label>
                        <CitySearch onCitySelect={(city) => fetchData(city, "right")} />
                    </div>
                    <CityCard data={rightCity} />
                </div>
            </div>
        </div>
    );
};

const CityCard = ({ data }: { data: { weather: WeatherData | null; forecast: ForecastData[] | null; loading: boolean; error: string | null } }) => {
    const { unit, formatTemp, formatSpeed } = useSettings();

    if (data.loading) {
        return (
            <div className="flex justify-center items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl h-96">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="flex justify-center items-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-2xl h-96">
                <p className="text-red-500">{data.error}</p>
            </div>
        );
    }

    if (!data.weather) {
        return (
            <div className="flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl h-96 text-slate-400">
                <MapPin className="opacity-50 mb-2 w-10 h-10" />
                <p>Select a city to see details</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Current Weather */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg p-6 rounded-2xl text-white">
                <h2 className="mb-1 font-bold text-2xl">{data.weather.city}</h2>
                <p className="mb-4 text-blue-100 capitalize">{data.weather.weather}</p>

                <div className="flex justify-between items-center">
                    <div className="font-bold text-5xl tracking-tight">{formatTemp(data.weather.temperature)}</div>
                    <WeatherIcon code={data.weather.icon} className="w-20 h-20 text-white" />
                </div>

                <div className="gap-2 grid grid-cols-3 bg-white/10 backdrop-blur-sm mt-6 p-3 rounded-xl">
                    <div className="text-center">
                        <Droplets className="opacity-70 mx-auto mb-1 w-4 h-4" />
                        <span className="font-medium text-sm">{data.weather.humidity}%</span>
                    </div>
                    <div className="text-center">
                        <Wind className="opacity-70 mx-auto mb-1 w-4 h-4" />
                        <span className="font-medium text-sm">{formatSpeed(data.weather.windSpeed)}</span>
                    </div>
                    <div className="text-center">
                        <Thermometer className="opacity-70 mx-auto mb-1 w-4 h-4" />
                        <span className="font-medium text-sm">{formatTemp(data.weather.temperature)}</span>
                    </div>
                </div>
            </div>

            {/* Forecast Chart */}
            {data.forecast && (
                <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <h3 className="mb-4 font-semibold text-slate-500 text-sm">5-Day Trend</h3>
                    <TemperatureChart data={data.forecast} unit={unit} />
                </div>
            )}
        </div>
    );
};
