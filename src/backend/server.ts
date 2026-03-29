/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

/** Cache: 10 mins TTL for weather, 24hr for search */
const cache = new NodeCache({ stdTTL: 600 });
const searchCache = new NodeCache({ stdTTL: 86400 });

/** Rate Limit: 100 req / 15 mins */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    legacyHeaders: false,
    standardHeaders: true,
    message: { error: "Too many requests, please try again later." }
});

app.use(cors());
app.use(express.json());
app.use(limiter);

/** Helper: Wrap async calls with cache */
const getCachedResponse = async (key: string, fetcher: () => Promise<any>) => {
    const cachedData = cache.get(key);
    if (cachedData) {
        return cachedData;
    }
    const data = await fetcher();
    cache.set(key, data);
    return data;
};

/** GET /health - System status */
app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/** GET /weather/search/cities - City name autocomplete suggestions */
app.get("/weather/search/cities", async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;
    if (!q || String(q).trim().length < 2) {
        res.status(400).json({ error: "Query 'q' must be at least 2 characters" });
        return;
    }

    try {
        const cacheKey = `city_search_${String(q).toLowerCase()}`;
        const cachedData = searchCache.get(cacheKey);
        if (cachedData) {
            res.json(cachedData);
            return;
        }

        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(String(q))}&limit=5&appid=${API_KEY}`;
        const response = await axios.get(url);

        const suggestions = response.data.map((item: GeocodingResult) => ({
            name: item.name,
            state: item.state || null,
            country: item.country,
            lat: item.lat,
            lon: item.lon,
        }));

        searchCache.set(cacheKey, suggestions);
        res.json(suggestions);
    } catch (error) {
        next(error);
    }
});

/** GET /weather/city - Current weather by city name */
app.get("/weather/city", async (req: Request, res: Response, next: NextFunction) => {
    const { city } = req.query;
    if (!city) {
        res.status(400).json({ error: "City is required" });
        return;
    }

    try {
        const data = await getCachedResponse(`weather_city_${city}`, async () => {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
            const response = await axios.get(url);
            return formatWeather(response.data);
        });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/** GET /weather/location - Current weather by coordinates */
app.get("/weather/location", async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        res.status(400).json({ error: "Latitude and Longitude are required" });
        return;
    }

    try {
        const data = await getCachedResponse(`weather_loc_${lat}_${lon}`, async () => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
            const response = await axios.get(url);
            return formatWeather(response.data);
        });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/** GET /weather/forecast - 5-day forecast by city */
app.get("/weather/forecast", async (req: Request, res: Response, next: NextFunction) => {
    const { city } = req.query;
    if (!city) {
        res.status(400).json({ error: "City is required" });
        return;
    }

    try {
        const data = await getCachedResponse(`forecast_city_${city}`, async () => {
            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
            const response = await axios.get(url);
            return formatForecast(response.data);
        });
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/** Global Error Handler */
app.use((err: any, _req: Request, res: Response) => {
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
    main: {
        temp: number;
        humidity: number;
    };
    wind: {
        speed: number;
    };
    weather: Array<{
        main: string;
        icon: string;
    }>;
}

interface ForecastItem {
    dt: number;
    main: {
        temp: number;
    };
    weather: Array<{
        main: string;
        icon: string;
    }>;
    dt_txt: string;
}

interface OpenWeatherForecastResponse {
    list: ForecastItem[];
    city: {
        name: string;
    }
}

const formatWeather = (data: OpenWeatherResponse) => {
    return {
        city: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        weather: data.weather[0].main,
        icon: data.weather[0].icon
    };
};

const formatForecast = (data: OpenWeatherForecastResponse) => {
    // Filter to get one forecast per day (approx noon)
    // OpenWeatherMap returns data every 3 hours. 
    // We pick items closer to 12:00:00 to represent the day.
    const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

    return dailyData.map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }),
        temp: item.main.temp,
        description: item.weather[0].main,
        icon: item.weather[0].icon
    })).slice(0, 5); // Ensure max 5 days
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
