// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import axios from "axios";
import type { AddressInfo } from "node:net";
import { app, formatForecast, formatWeather } from "./server";
import { clearMemoryCache } from "./cache";

/** Build a 3-hourly forecast list starting at `startUnix`, `count` slots long */
const makeList = (startUnix: number, count: number, temp: (i: number) => number) =>
    Array.from({ length: count }, (_, i) => {
        const dt = startUnix + i * 3 * 3600;
        return {
            dt,
            main: { temp: temp(i) },
            weather: [{ main: i % 8 === 4 ? "Rain" : "Clear", description: "", icon: i % 8 === 4 ? "10d" : "01d" }],
            pop: i === 0 ? 0.35 : 0,
            dt_txt: new Date(dt * 1000).toISOString(),
        };
    });

describe("formatForecast", () => {
    // 2026-09-26 15:00 UTC is 2026-09-27 00:00 in Tokyo (+9h)
    const start = Date.UTC(2026, 8, 26, 15, 0, 0) / 1000;

    it("groups slots by the city's local calendar day", () => {
        const { daily, timezone } = formatForecast({
            list: makeList(start, 40, (i) => 20 + (i % 8)),
            city: { name: "Tokyo", timezone: 9 * 3600 },
        });
        expect(timezone).toBe(9 * 3600);
        expect(daily).toHaveLength(5);
        expect(daily[0].date).toBe("2026-09-27");
        expect(daily[4].date).toBe("2026-10-01");
    });

    it("uses the slot closest to local noon and the day's min/max", () => {
        const { daily } = formatForecast({
            list: makeList(start, 40, (i) => 20 + (i % 8)),
            city: { name: "Tokyo", timezone: 9 * 3600 },
        });
        // Index 4 within each day is 12:00 local; it carries the Rain icon
        expect(daily[0].temp).toBe(24);
        expect(daily[0].description).toBe("Rain");
        expect(daily[0].tempMin).toBe(20);
        expect(daily[0].tempMax).toBe(27);
    });

    it("keeps the partial current day instead of dropping it after noon", () => {
        const { daily } = formatForecast({
            list: makeList(start, 40, (i) => 10 + i),
            city: { name: "London", timezone: 0 },
        });
        // Only 15:00, 18:00 and 21:00 remain for today; the closest to noon is 15:00
        expect(daily[0].date).toBe("2026-09-26");
        expect(daily[0].temp).toBe(10);
    });

    it("returns the next 24 hours as eight hourly slots with pop as a percentage", () => {
        const { hourly } = formatForecast({
            list: makeList(start, 40, (i) => i),
            city: { name: "London", timezone: 0 },
        });
        expect(hourly).toHaveLength(8);
        expect(hourly[0]).toEqual({ time: start, temp: 0, description: "Clear", icon: "01d", pop: 35 });
        expect(hourly[1].pop).toBe(0);
    });
});

describe("formatWeather", () => {
    it("passes through the detailed fields", () => {
        const out = formatWeather({
            name: "Testville",
            coord: { lat: 1.5, lon: 2.5 },
            main: { temp: 1, feels_like: 2, temp_min: 0, temp_max: 3, pressure: 1005, humidity: 50 },
            visibility: 8000,
            wind: { speed: 3 },
            weather: [{ main: "Rain", description: "light rain", icon: "10d" }],
            sys: { country: "GB", sunrise: 100, sunset: 200 },
            timezone: 3600,
        });
        expect(out).toMatchObject({
            city: "Testville",
            country: "GB",
            lat: 1.5,
            lon: 2.5,
            feelsLike: 2,
            pressure: 1005,
            visibility: 8000,
            description: "light rain",
            sunrise: 100,
            sunset: 200,
            timezone: 3600,
        });
    });

    it("tolerates a missing visibility", () => {
        const out = formatWeather({
            name: "X",
            coord: { lat: 0, lon: 0 },
            main: { temp: 1, feels_like: 1, temp_min: 1, temp_max: 1, pressure: 1000, humidity: 1 },
            wind: { speed: 0 },
            weather: [{ main: "Clear", description: "", icon: "01d" }],
            sys: { sunrise: 0, sunset: 0 },
            timezone: 0,
        });
        expect(out.visibility).toBeNull();
    });
});

describe("API endpoints", () => {
    const upstreamCalls: string[] = [];
    let baseUrl = "";
    let server: ReturnType<typeof app.listen>;

    const forecastPayload = { list: makeList(0, 40, (i) => i), city: { name: "Stub", timezone: 0 } };
    const weatherPayload = {
        name: "Stub",
        coord: { lat: 0, lon: 0 },
        main: { temp: 1, feels_like: 1, temp_min: 1, temp_max: 1, pressure: 1000, humidity: 1 },
        wind: { speed: 0 },
        weather: [{ main: "Clear", description: "", icon: "01d" }],
        sys: { sunrise: 0, sunset: 0 },
        timezone: 0,
    };

    beforeAll(async () => {
        axios.defaults.adapter = async (config) => {
            const url = config.url ?? "";
            upstreamCalls.push(url);
            const data = url.includes("/forecast") ? forecastPayload : url.includes("/geo/") ? [] : weatherPayload;
            return { data, status: 200, statusText: "OK", headers: {}, config };
        };
        server = app.listen(0);
        await new Promise<void>((resolve) => server.once("listening", resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    beforeEach(() => {
        clearMemoryCache();
        upstreamCalls.length = 0;
    });

    const get = async (path: string) => {
        const res = await fetch(`${baseUrl}${path}`);
        return { status: res.status, body: await res.json() };
    };

    it("reports health with the active cache backend", async () => {
        const { status, body } = await get("/api/health");
        expect(status).toBe(200);
        expect(body.status).toBe("ok");
        expect(body.cache).toBe("memory");
    });

    it("rejects invalid or out-of-range coordinates", async () => {
        expect((await get("/api/weather/location?lat=abc&lon=1")).status).toBe(400);
        expect((await get("/api/weather/location?lat=95&lon=1")).status).toBe(400);
        expect((await get("/api/weather/forecast")).status).toBe(400);
        expect((await get("/api/weather/search/cities?q=a")).status).toBe(400);
        expect(upstreamCalls).toHaveLength(0);
    });

    it("fetches the forecast by coordinates and rounds them for caching", async () => {
        const { status, body } = await get("/api/weather/forecast?lat=51.5074&lon=-0.1278");
        expect(status).toBe(200);
        expect(body.daily.length).toBeGreaterThan(0);
        expect(body.hourly).toHaveLength(8);
        expect(upstreamCalls[0]).toContain("lat=51.507&lon=-0.128");
    });

    it("encodes city names in the upstream URL and never leaks the key", async () => {
        const city = encodeURIComponent("São Paulo & Co#1");
        const { status } = await get(`/api/weather/city?city=${city}`);
        expect(status).toBe(200);
        expect(upstreamCalls[0]).toContain("q=S%C3%A3o+Paulo+%26+Co%231");
        expect(upstreamCalls[0]).not.toContain("#");
    });

    it("serves differently-cased city names from the same cache entry", async () => {
        await get("/api/weather/city?city=London");
        await get("/api/weather/city?city=london");
        await get("/api/weather/city?city=%20LONDON%20");
        expect(upstreamCalls).toHaveLength(1);
    });
});
