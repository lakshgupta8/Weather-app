import { useState, useCallback, useRef } from "react";
import { Loader2, ArrowRightLeft, Thermometer, Droplets, Wind, MapPin } from "lucide-react";
import { CitySearch } from "../components/CitySearch";
import { WeatherIcon } from "../components/WeatherIcon";
import { TemperatureChart } from "../components/TemperatureChart";
import { useSettings } from "../context/useSettings";
import { ApiError, getForecastByCity, getForecastByLocation, getWeatherByCity, getWeatherByLocation } from "../api";
import { hasCoords, type WeatherData, type ForecastData, type SavedLocation } from "../types";

type Side = "left" | "right";

interface CityState {
    weather: WeatherData | null;
    forecast: ForecastData[] | null;
    loading: boolean;
    error: string | null;
}

const EMPTY: CityState = { weather: null, forecast: null, loading: false, error: null };

export const ComparisonPage = () => {
    const [leftCity, setLeftCity] = useState<CityState>(EMPTY);
    const [rightCity, setRightCity] = useState<CityState>(EMPTY);

    // Per-side request counters so a slow earlier response cannot overwrite a newer one
    const requestIds = useRef<Record<Side, number>>({ left: 0, right: 0 });

    /** Handlers fetching weather data for left or right panel. */
    const fetchData = useCallback(async (location: SavedLocation, side: Side) => {
        const setTarget = side === "left" ? setLeftCity : setRightCity;
        const requestId = ++requestIds.current[side];

        setTarget(prev => ({ ...prev, loading: true, error: null }));

        try {
            const [weather, forecast] = hasCoords(location)
                ? await Promise.all([getWeatherByLocation(location.lat, location.lon), getForecastByLocation(location.lat, location.lon)])
                : await Promise.all([getWeatherByCity(location.name), getForecastByCity(location.name)]);

            if (requestIds.current[side] !== requestId) return;
            setTarget({ weather, forecast, loading: false, error: null });
        } catch (err) {
            if (requestIds.current[side] !== requestId) return;
            const message = err instanceof ApiError ? err.message : "Failed to fetch data";
            setTarget(prev => ({ ...prev, loading: false, error: message }));
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
                        <CitySearch onCitySelect={(location) => fetchData(location, "left")} />
                    </div>
                    <CityCard data={leftCity} />
                </div>

                {/* Right City Input */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300 text-sm">City B</label>
                        <CitySearch onCitySelect={(location) => fetchData(location, "right")} />
                    </div>
                    <CityCard data={rightCity} />
                </div>
            </div>
        </div>
    );
};

const CityCard = ({ data }: { data: CityState }) => {
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
            <div className="bg-linear-to-br from-blue-500 to-blue-600 shadow-lg p-6 rounded-2xl text-white">
                <h2 className="mb-1 font-bold text-2xl">
                    {data.weather.city}
                    {data.weather.country && <span className="ml-2 font-normal text-blue-100 text-base">{data.weather.country}</span>}
                </h2>
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
                        <span className="font-medium text-sm">{formatTemp(data.weather.feelsLike)}</span>
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
