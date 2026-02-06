import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeather } from "../domains/weather/hooks/useWeather";
import { useLocation } from "../context/useLocation";
import { useSettings } from "../context/useSettings";
import { CitySearch } from "../components/CitySearch";
import { WeatherIcon } from "../components/WeatherIcon";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { MapPin, Clock, Droplets, Wind } from "lucide-react";

export const HomePage = () => {
    const { weather, loading, error, fetchWeatherByLocation } = useWeather();
    const { recentSearches, clearHistory } = useLocation();
    const { formatTemp, formatSpeed } = useSettings();

    // Auto-fetch weather if location access is granted
    useEffect(() => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude);
            }
        );
    }, [fetchWeatherByLocation]);

    return (
        <div className="flex flex-col gap-6">
            <section className="space-y-2 text-center">
                <h1 className="font-bold text-slate-800 text-2xl">Hello there!</h1>
                <p className="text-slate-500">Check the weather around you or search for a city.</p>
            </section>

            {loading ? (
                <div className="w-full">
                    <CardSkeleton />
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 border border-red-100 rounded-lg text-red-600 text-center">
                    {error}
                </div>
            ) : weather ? (
                <div className="flex flex-col items-center bg-white shadow-sm p-6 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium text-sm uppercase tracking-wide">Current Location</span>
                    </div>
                    <h2 className="mb-1 font-bold text-slate-800 text-3xl">{weather.city}</h2>
                    <div className="py-4">
                        <WeatherIcon
                            code={weather.icon}
                            className="w-32 h-32 text-blue-500"
                        />
                    </div>
                    <div className="mb-2 font-bold text-slate-900 text-5xl">{formatTemp(weather.temperature)}</div>
                    <p className="text-slate-500 text-lg capitalize">{weather.weather}</p>

                    <div className="gap-8 grid grid-cols-2 mt-6 px-4 w-full">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Droplets className="w-3 h-3 text-blue-400" />
                                <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Humidity</p>
                            </div>
                            <p className="font-semibold text-slate-700">{weather.humidity}%</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Wind className="w-3 h-3 text-blue-400" />
                                <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Wind</p>
                            </div>
                            <p className="font-semibold text-slate-700">{formatSpeed(weather.windSpeed)}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 p-8 border border-blue-100 rounded-2xl text-center">
                    <MapPin className="mx-auto mb-3 w-10 h-10 text-blue-400" />
                    <p className="font-medium text-blue-800">Allow location access to see local weather</p>
                </div>
            )}

            <div className="space-y-3 mx-auto w-full max-w-sm">
                <CitySearch />
                <Link to="/compare" className="block font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 text-sm text-center">
                    Compare Cities
                </Link>
            </div>

            {recentSearches.length > 0 && (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-semibold text-slate-500 text-sm uppercase tracking-wider">Recent Cities</h3>
                        <button
                            onClick={clearHistory}
                            className="hover:bg-red-50 px-2 py-1 rounded font-medium text-red-500 hover:text-red-600 text-xs transition-colors"
                        >
                            Clear History
                        </button>
                    </div>
                    <div className="gap-3 grid grid-cols-2">
                        {recentSearches.map((city) => (
                            <Link
                                key={city}
                                to={`/weather/${city}`}
                                className="flex items-center gap-2 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md p-3 border border-slate-200 hover:border-blue-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-all"
                            >
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="font-medium truncate">{city}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
