import { useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useWeatherContext } from "../context/useWeatherContext";
import { useSettings } from "../context/useSettings";
import { WeatherIcon } from "../components/WeatherIcon";
import { TemperatureChart } from "../components/TemperatureChart";
import { HourlyStrip } from "../components/HourlyStrip";
import { CardSkeleton, ListSkeleton, LoadingSkeleton } from "../components/LoadingSkeleton";
import { formatForecastDate, formatLocalTime } from "../utils/format";
import { conditionGradient } from "../utils/weatherTheme";
import { ArrowLeft, Droplets, Wind, Gauge, Eye, Calendar, Clock, Thermometer, Sunrise, Sunset, ArrowUpDown } from "lucide-react";

export const WeatherDetailsPage = () => {
    const { city } = useParams();
    const [searchParams] = useSearchParams();
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const { weather, forecast, loading, error, fetchWeatherByCity, fetchWeatherByLocation } = useWeatherContext();
    const { formatTemp, formatSpeed, formatDistance } = useSettings();

    // Fetch data when the URL changes. Prefer coordinates when present so
    // ambiguous names (e.g. "Springfield") resolve to the place the user picked.
    useEffect(() => {
        const lat = latParam === null ? NaN : Number(latParam);
        const lon = lonParam === null ? NaN : Number(lonParam);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            fetchWeatherByLocation(lat, lon);
        } else if (city) {
            fetchWeatherByCity(city);
        }
    }, [city, latParam, lonParam, fetchWeatherByCity, fetchWeatherByLocation]);

    if (loading) {
        return (
            <div className="space-y-6 pt-6">
                <LoadingSkeleton className="w-32 h-6" /> {/* Back link skeleton */}
                <CardSkeleton /> {/* Main weather card */}
                <div className="gap-px grid grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-slate-700 rounded-2xl h-32 overflow-hidden animate-pulse" />
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <LoadingSkeleton className="mb-4 w-40 h-6" />
                    <ListSkeleton count={5} />
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="py-10 text-center">
                <div className="inline-block bg-red-50 dark:bg-red-900/20 mb-4 p-4 rounded-xl text-red-600 dark:text-red-400">
                    {error || "Weather data unavailable"}
                </div>
                <br />
                <Link to="/" className="text-blue-500 hover:underline">Return Home</Link>
            </div>
        );
    }

    const localTime = (unix: number | null) => (unix === null ? "N/A" : formatLocalTime(unix, weather.timezone));
    const daily = forecast?.daily ?? [];
    const hourly = forecast?.hourly ?? [];

    return (
        <div className="space-y-6 animate-in duration-500 fade-in">
            <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

            {/* Main Weather Card */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
                <div className={`sm:flex sm:justify-between sm:items-center bg-linear-to-br ${conditionGradient(weather.icon)} p-8 text-white sm:text-left text-center`}>
                    <div>
                        <h1 className="mb-1 font-bold text-3xl">
                            {weather.city}
                            {weather.country && <span className="ml-2 font-normal text-white/70 text-lg">{weather.country}</span>}
                        </h1>
                        <p className="flex justify-center sm:justify-start items-center gap-2 text-white/80 text-lg capitalize">
                            {weather.description || weather.weather}
                            <span className="text-white/60">•</span>
                            Today
                        </p>
                    </div>
                    <div className="flex flex-col items-center mt-4 sm:mt-0">
                        <WeatherIcon
                            code={weather.icon}
                            className="bg-white/10 shadow-lg backdrop-blur-sm mb-2 p-4 rounded-full w-24 h-24 text-white"
                        />
                        <div className="font-bold text-5xl tracking-tight">{formatTemp(weather.temperature)}</div>
                    </div>
                </div>

                {/* Grid Metrics */}
                <div className="gap-px grid grid-cols-2 md:grid-cols-4 bg-slate-100 dark:bg-slate-700">
                    <DetailItem icon={<Thermometer className="w-5 h-5 text-blue-500" />} label="Feels Like" value={formatTemp(weather.feelsLike)} />
                    <DetailItem icon={<ArrowUpDown className="w-5 h-5 text-blue-500" />} label="High / Low" value={`${formatTemp(weather.tempMax)} / ${formatTemp(weather.tempMin)}`} />
                    <DetailItem icon={<Droplets className="w-5 h-5 text-blue-500" />} label="Humidity" value={`${weather.humidity}%`} />
                    <DetailItem icon={<Wind className="w-5 h-5 text-blue-500" />} label="Wind Speed" value={formatSpeed(weather.windSpeed)} />
                    <DetailItem icon={<Gauge className="w-5 h-5 text-blue-500" />} label="Pressure" value={`${weather.pressure} hPa`} />
                    <DetailItem icon={<Eye className="w-5 h-5 text-blue-500" />} label="Visibility" value={formatDistance(weather.visibility)} />
                    <DetailItem icon={<Sunrise className="w-5 h-5 text-amber-500" />} label="Sunrise" value={localTime(weather.sunrise)} />
                    <DetailItem icon={<Sunset className="w-5 h-5 text-orange-500" />} label="Sunset" value={localTime(weather.sunset)} />
                </div>
            </div>

            {/* Hourly Section */}
            {hourly.length > 0 && forecast && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <h3 className="flex items-center gap-2 mb-4 font-semibold text-slate-700 dark:text-slate-300">
                        <Clock className="w-4 h-4" />
                        Next 24 Hours
                        <span className="font-normal text-slate-400 text-xs">local time</span>
                    </h3>
                    <HourlyStrip hourly={hourly} timezone={forecast.timezone} />
                </div>
            )}

            {/* Forecast Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <h3 className="flex items-center gap-2 mb-4 font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4" />
                    5-Day Forecast
                </h3>

                {/* Forecast Chart */}
                {daily.length > 0 && (
                    <div className="mb-8">
                        <TemperatureChart data={daily} />
                    </div>
                )}

                <div className="space-y-3">
                    {daily.length > 0 ? (
                        daily.map((day) => (
                            <div key={day.date} className="flex justify-between items-center bg-white dark:bg-slate-800 shadow-sm p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                                <span className="w-24 font-medium text-slate-600 dark:text-slate-300">{formatForecastDate(day.date)}</span>
                                <div className="flex flex-1 justify-center items-center gap-2">
                                    <WeatherIcon
                                        code={day.icon}
                                        className="w-8 h-8 text-blue-500"
                                    />
                                    <span className="text-slate-500 dark:text-slate-400 text-sm capitalize">{day.description}</span>
                                </div>
                                <span className="w-24 text-right">
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatTemp(day.tempMax)}</span>
                                    <span className="ml-1 text-slate-400 dark:text-slate-500 text-sm">{formatTemp(day.tempMin)}</span>
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="py-4 text-slate-400 text-sm text-center">Forecast data unavailable</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex flex-col justify-center items-center gap-2 bg-white dark:bg-slate-800 p-6">
        {icon}
        <span className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider">{label}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200 text-lg text-center">{value}</span>
    </div>
);
