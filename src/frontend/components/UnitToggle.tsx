import { Thermometer } from "lucide-react";
import { useSettings } from "../context/useSettings";

/** Toggle between Metric (C) and Imperial (F) */
export function UnitToggle() {
    const { unit, toggleUnit } = useSettings();

    return (
        <button
            onClick={toggleUnit}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
            aria-label={`Switch to ${unit === "metric" ? "Imperial" : "Metric"} units`}
            title={`Switch to ${unit === "metric" ? "Imperial" : "Metric"}`}
        >
            <Thermometer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                {unit === "metric" ? "°C" : "°F"}
            </span>
        </button>
    );
}
