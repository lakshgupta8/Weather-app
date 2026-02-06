import { CitySearch } from "../components/CitySearch";
import { useWeatherContext } from "../context/useWeatherContext";
import { Loader2, Droplets, Wind, ArrowRight } from "lucide-react";
import { WeatherIcon } from "../components/WeatherIcon";
import { Link } from "react-router-dom";

export const SearchPage = () => {
    // Shared context state for search results
    const { weather, loading, error } = useWeatherContext();

    return (
        <div className="space-y-6">
            <h1 className="font-bold text-slate-800 dark:text-slate-100 text-2xl">Find City</h1>

            <div className="z-10 relative">
                <CitySearch />
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-center">
                    {error}
                </div>
            )}

            {weather && !loading && (
                <Link
                    to={`/weather/${weather.city}`}
                    className="group block slide-in-from-bottom-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all animate-in duration-500 fade-in"
                >
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white text-center">
                        <div className="flex justify-between items-start w-full">
                            <h2 className="font-bold text-2xl decoration-white/50 group-hover:underline underline-offset-4">{weather.city}</h2>
                            <ArrowRight className="opacity-0 group-hover:opacity-100 w-6 h-6 text-white transition-all group-hover:translate-x-1" />
                        </div>
                        <div className="flex justify-center items-center py-2">
                            <WeatherIcon
                                code={weather.icon}
                                className="bg-white/10 backdrop-blur-sm p-4 rounded-full w-24 h-24 text-white"
                            />
                        </div>
                        <p className="mb-1 font-bold text-4xl">{Math.round(weather.temperature)}°</p>
                        <p className="font-medium text-blue-100 capitalize">{weather.weather}</p>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700">
                        <div className="flex flex-col items-center gap-1 p-4">
                            <Droplets className="mb-1 w-5 h-5 text-blue-500" />
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase">Humidity</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{weather.humidity}%</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-4">
                            <Wind className="mb-1 w-5 h-5 text-blue-500" />
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase">Wind Speed</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{weather.windSpeed} m/s</span>
                        </div>
                    </div>
                </Link>
            )}
        </div>
    );
};
