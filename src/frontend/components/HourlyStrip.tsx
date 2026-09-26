import { Droplets } from "lucide-react";
import type { HourlyForecast } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { useSettings } from "../context/useSettings";
import { formatLocalHour } from "../utils/format";

interface HourlyStripProps {
    hourly: HourlyForecast[];
    /** The city's UTC offset in seconds, so hours read in local time */
    timezone: number;
}

/**
 * Hourly Strip
 * A horizontally scrollable row of the next 24 hours in 3-hour steps.
 */
export function HourlyStrip({ hourly, timezone }: HourlyStripProps) {
    const { formatTemp } = useSettings();

    if (hourly.length === 0) return null;

    return (
        <ol
            aria-label="Hourly forecast"
            className="flex gap-2 -mx-2 px-2 pb-2 overflow-x-auto snap-x snap-mandatory scroll-smooth"
        >
            {hourly.map((slot) => (
                <li
                    key={slot.time}
                    className="flex flex-col flex-none items-center gap-1 bg-white dark:bg-slate-800 shadow-sm px-3 py-3 border border-slate-100 dark:border-slate-700 rounded-xl w-20 text-center snap-start"
                >
                    <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
                        {formatLocalHour(slot.time, timezone)}
                    </span>
                    <WeatherIcon code={slot.icon} className="w-7 h-7 text-blue-500" ariaLabel={slot.description} />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{formatTemp(slot.temp)}</span>
                    <span
                        className={`flex items-center gap-0.5 text-xs ${slot.pop > 0 ? "text-blue-500" : "text-transparent"}`}
                        aria-hidden={slot.pop === 0}
                    >
                        <Droplets className="w-3 h-3" />
                        {slot.pop}%
                    </span>
                </li>
            ))}
        </ol>
    );
}
