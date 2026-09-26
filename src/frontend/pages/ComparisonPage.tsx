import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ArrowRightLeft, Thermometer, Droplets, Wind, MapPin } from "lucide-react";
import { CitySearch } from "../components/CitySearch";
import { WeatherIcon } from "../components/WeatherIcon";
import { TemperatureChart } from "../components/TemperatureChart";
import { useSettings } from "../context/useSettings";
import { ApiError, getForecastByCity, getForecastByLocation, getWeatherByCity, getWeatherByLocation } from "../api";
import { conditionGradient } from "../utils/weatherTheme";
import { hasCoords, type WeatherData, type ForecastResponse, type SavedLocation } from "../types";

type Side = "a" | "b";

interface CityState {
    weather: WeatherData | null;
    forecast: ForecastResponse | null;
    loading: boolean;
    error: string | null;
}

const EMPTY: CityState = { weather: null, forecast: null, loading: false, error: null };

/** Build a side's location from its URL params (?a=London&alat=51.5&alon=-0.1) */
const locationFromParams = (name: string | null, lat: string | null, lon: string | null): SavedLocation | null => {
    const trimmed = name?.trim();
    if (!trimmed) return null;
    const latNum = Number(lat);
    const lonNum = Number(lon);
    return lat !== null && lon !== null && Number.isFinite(latNum) && Number.isFinite(lonNum)
        ? { name: trimmed, lat: latNum, lon: lonNum }
        : { name: trimmed };
};

export const ComparisonPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cityA, setCityA] = useState<CityState>(EMPTY);
    const [cityB, setCityB] = useState<CityState>(EMPTY);

    // Per-side request counters so a slow earlier response cannot overwrite a newer one
    const requestIds = useRef<Record<Side, number>>({ a: 0, b: 0 });

    /** Fetch weather data for one panel. */
    const fetchData = useCallback(async (location: SavedLocation, side: Side) => {
        const setTarget = side === "a" ? setCityA : setCityB;
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

    /** Selecting a city writes it to the URL; the effects below do the fetching */
    const selectCity = (location: SavedLocation, side: Side) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set(side, location.name);
            if (hasCoords(location)) {
                next.set(`${side}lat`, String(location.lat));
                next.set(`${side}lon`, String(location.lon));
            } else {
                next.delete(`${side}lat`);
                next.delete(`${side}lon`);
            }
            return next;
        });
    };

    // The URL is the source of truth, which makes comparisons shareable and
    // survives reloads. Each side re-fetches only when its own params change.
    const a = searchParams.get("a");
    const alat = searchParams.get("alat");
    const alon = searchParams.get("alon");
    const b = searchParams.get("b");
    const blat = searchParams.get("blat");
    const blon = searchParams.get("blon");

    // Fetching in response to URL changes is the intended pattern here; the
    // lint rule flags the synchronous "loading" flag that fetchData sets first.
    useEffect(() => {
        const location = locationFromParams(a, alat, alon);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (location) fetchData(location, "a");
    }, [a, alat, alon, fetchData]);

    useEffect(() => {
        const location = locationFromParams(b, blat, blon);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (location) fetchData(location, "b");
    }, [b, blat, blon, fetchData]);

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
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300 text-sm">
                            City A
                            {searchParams.get("a") && <span className="ml-2 font-normal text-slate-400">{searchParams.get("a")}</span>}
                        </label>
                        <CitySearch onCitySelect={(location) => selectCity(location, "a")} />
                    </div>
                    <CityCard data={cityA} />
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300 text-sm">
                            City B
                            {searchParams.get("b") && <span className="ml-2 font-normal text-slate-400">{searchParams.get("b")}</span>}
                        </label>
                        <CitySearch onCitySelect={(location) => selectCity(location, "b")} />
                    </div>
                    <CityCard data={cityB} />
                </div>
            </div>
        </div>
    );
};

const CityCard = ({ data }: { data: CityState }) => {
    const { formatTemp, formatSpeed } = useSettings();

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

    const daily = data.forecast?.daily ?? [];

    return (
        <div className="space-y-4">
            {/* Current Weather */}
            <div className={`bg-linear-to-br ${conditionGradient(data.weather.icon)} shadow-lg p-6 rounded-2xl text-white`}>
                <h2 className="mb-1 font-bold text-2xl">
                    {data.weather.city}
                    {data.weather.country && <span className="ml-2 font-normal text-white/70 text-base">{data.weather.country}</span>}
                </h2>
                <p className="mb-4 text-white/80 capitalize">{data.weather.description || data.weather.weather}</p>

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
                    <div className="text-center" title="Feels like">
                        <Thermometer className="opacity-70 mx-auto mb-1 w-4 h-4" />
                        <span className="font-medium text-sm">{formatTemp(data.weather.feelsLike)}</span>
                    </div>
                </div>
            </div>

            {/* Forecast Chart */}
            {daily.length > 0 && (
                <div className="bg-white dark:bg-slate-800 shadow-sm p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <h3 className="mb-4 font-semibold text-slate-500 text-sm">5-Day Trend</h3>
                    <TemperatureChart data={daily} />
                </div>
            )}
        </div>
    );
};
