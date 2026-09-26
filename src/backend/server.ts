/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import rateLimit from "express-rate-limit";
import { getCached, cacheBackend } from "./cache";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const apiRouter = express.Router();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const OWM_BASE = "https://api.openweathermap.org";

/** Cache TTLs: 10 mins for weather, 24hr for search */
const WEATHER_TTL = 600;
const SEARCH_TTL = 86400;

/** Rate Limit: 100 req / 15 mins */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    legacyHeaders: false,
    standardHeaders: true,
    keyGenerator: (req) => {
        const raw = req.headers['x-nf-client-connection-ip'] ||
                    req.headers['x-forwarded-for'] ||
                    req.socket.remoteAddress ||
                    'unknown';
        const value = Array.isArray(raw) ? raw[0] : raw;
        // x-forwarded-for may be a comma-separated chain; the first entry is the client.
        return value.split(",")[0].trim() || 'unknown';
    },
    validate: { xForwardedForHeader: false },
    message: { error: "Too many requests, please try again later." }
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8888', 'https://horizonhue.netlify.app']
}));
app.use(express.json());
app.use(limiter);

/** Helper: Build an OpenWeatherMap URL with properly encoded query params */
const owmUrl = (path: string, params: Record<string, string | number>) => {
    const url = new URL(path, OWM_BASE);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
    }
    url.searchParams.set("appid", API_KEY ?? "");
    return url.toString();
};

/** Helper: Parse and validate lat/lon query params. Returns null when invalid. */
const parseCoords = (lat: unknown, lon: unknown): { lat: number; lon: number } | null => {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;
    // Round to 3 decimals (~100m) so nearby requests share a cache entry
    return { lat: Math.round(latNum * 1000) / 1000, lon: Math.round(lonNum * 1000) / 1000 };
};

/** Helper: Normalize a city name for cache keys */
const cityKey = (city: unknown) => String(city).trim().toLowerCase();

/** GET /health - System status */
apiRouter.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), cache: cacheBackend() });
});

/** GET /weather/search/cities - City name autocomplete suggestions */
apiRouter.get("/weather/search/cities", async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
        res.status(400).json({ error: "Query 'q' must be at least 2 characters" });
        return;
    }

    try {
        const suggestions = await getCached(`city_search_${cityKey(q)}`, SEARCH_TTL, async () => {
            const url = owmUrl("/geo/1.0/direct", { q: String(q).trim(), limit: 5 });
            const response = await axios.get(url);
            return response.data.map((item: GeocodingResult) => ({
                name: item.name,
                state: item.state || null,
                country: item.country,
                lat: item.lat,
                lon: item.lon,
            }));
        });
        res.json(suggestions);
    } catch (error) {
        next(error);
    }
});

/** GET /weather/city - Current weather by city name */
apiRouter.get("/weather/city", async (req: Request, res: Response, next: NextFunction) => {
    const { city } = req.query;
    if (!city || !String(city).trim()) {
        res.status(400).json({ error: "City is required" });
        return;
    }

    try {
        const data = await getCached(`weather_city_${cityKey(city)}`, WEATHER_TTL, async () => {
            const url = owmUrl("/data/2.5/weather", { q: String(city).trim(), units: "metric" });
            const response = await axios.get(url);
            return formatWeather(response.data);
        });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/** GET /weather/location - Current weather by coordinates */
apiRouter.get("/weather/location", async (req: Request, res: Response, next: NextFunction) => {
    const coords = parseCoords(req.query.lat, req.query.lon);
    if (!coords) {
        res.status(400).json({ error: "Valid latitude and longitude are required" });
        return;
    }

    try {
        const data = await getCached(`weather_loc_${coords.lat}_${coords.lon}`, WEATHER_TTL, async () => {
            const url = owmUrl("/data/2.5/weather", { lat: coords.lat, lon: coords.lon, units: "metric" });
            const response = await axios.get(url);
            return formatWeather(response.data);
        });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/** GET /weather/forecast - 5-day daily + 24h hourly forecast by city name, or by lat/lon */
apiRouter.get("/weather/forecast", async (req: Request, res: Response, next: NextFunction) => {
    const { city } = req.query;
    const coords = parseCoords(req.query.lat, req.query.lon);

    if (!coords && (!city || !String(city).trim())) {
        res.status(400).json({ error: "City or valid latitude and longitude are required" });
        return;
    }

    try {
        const cacheKey = coords
            ? `forecast_loc_${coords.lat}_${coords.lon}`
            : `forecast_city_${cityKey(city)}`;
        const params = coords
            ? { lat: coords.lat, lon: coords.lon, units: "metric" }
            : { q: String(city).trim(), units: "metric" };

        const data = await getCached(cacheKey, WEATHER_TTL, async () => {
            const url = owmUrl("/data/2.5/forecast", params);
            const response = await axios.get(url);
            return formatForecast(response.data);
        });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Mount the API Router on all relevant paths
app.use(["/.netlify/functions/api", "/api", "/"], apiRouter);


/** Global Error Handler */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    void _next; // Important for Express 4/5 error signature
    console.error("API Error:", err.message || err);
    const status = err.response?.status || err.status || 500;
    const message = err.response?.data?.message || err.message || "Internal Server Error";
    res.status(status).json({ error: message, code: err.code });
});

// --- Types & Helpers ---

interface GeocodingResult {
    name: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
}

interface OpenWeatherResponse {
    name: string;
    coord: {
        lat: number;
        lon: number;
    };
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    visibility?: number;
    wind: {
        speed: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    sys: {
        country?: string;
        sunrise: number;
        sunset: number;
    };
    timezone: number;
}

interface ForecastItem {
    dt: number;
    main: {
        temp: number;
    };
    weather: Array<{
        main: string;
        description: string;
        icon: string;
    }>;
    /** Probability of precipitation, 0..1 */
    pop?: number;
    dt_txt: string;
}

interface OpenWeatherForecastResponse {
    list: ForecastItem[];
    city: {
        name: string;
        /** Offset from UTC in seconds */
        timezone: number;
    }
}

const formatWeather = (data: OpenWeatherResponse) => {
    return {
        city: data.name,
        country: data.sys?.country ?? null,
        lat: data.coord.lat,
        lon: data.coord.lon,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        /** Visibility in metres; OpenWeatherMap caps this at 10 km */
        visibility: data.visibility ?? null,
        windSpeed: data.wind.speed,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: data.sys?.sunrise ?? null,
        sunset: data.sys?.sunset ?? null,
        timezone: data.timezone,
    };
};

/** Number of 3-hour slots that make up the "next 24 hours" strip */
const HOURLY_SLOTS = 8;

/**
 * Shape the raw 3-hourly forecast into:
 *  - `hourly`: the next 24 hours as-is (8 slots), for an hour-by-hour strip
 *  - `daily`: one entry per calendar day in the city's local timezone, with
 *    min/max across all slots and the slot closest to local noon for the
 *    headline temp/condition. The date is a plain YYYY-MM-DD string so the
 *    client can format it in the user's locale without timezone drift.
 */
const formatForecast = (data: OpenWeatherForecastResponse) => {
    const tzOffset = data.city?.timezone ?? 0;

    const hourly = data.list.slice(0, HOURLY_SLOTS).map((item) => ({
        time: item.dt,
        temp: item.main.temp,
        description: item.weather[0].main,
        icon: item.weather[0].icon,
        /** Precipitation probability as a whole percentage */
        pop: Math.round((item.pop ?? 0) * 100),
    }));

    const days = new Map<string, { items: ForecastItem[]; localHours: number[] }>();

    for (const item of data.list) {
        const local = new Date((item.dt + tzOffset) * 1000);
        const key = local.toISOString().slice(0, 10);
        const entry = days.get(key) ?? { items: [], localHours: [] };
        entry.items.push(item);
        entry.localHours.push(local.getUTCHours());
        days.set(key, entry);
    }

    const daily = Array.from(days.entries())
        .slice(0, 5)
        .map(([date, { items, localHours }]) => {
            let repIndex = 0;
            let bestDistance = Infinity;
            localHours.forEach((hour, index) => {
                const distance = Math.abs(hour - 12);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    repIndex = index;
                }
            });
            const rep = items[repIndex];
            const temps = items.map((i) => i.main.temp);

            return {
                date,
                temp: rep.main.temp,
                tempMin: Math.min(...temps),
                tempMax: Math.max(...temps),
                description: rep.weather[0].main,
                icon: rep.weather[0].icon,
            };
        });

    return { timezone: tzOffset, daily, hourly };
};

export { app, formatWeather, formatForecast };

// For Bun/Node ESM compatibility
const isMain = (import.meta as any).main || (process.argv[1] && import.meta.url && process.argv[1] === new URL(import.meta.url).pathname);

if (isMain) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
