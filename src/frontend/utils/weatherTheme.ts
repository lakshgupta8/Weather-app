/**
 * Map an OpenWeatherMap icon code (e.g. "10d", "01n") to a Tailwind gradient
 * so cards take on the colour of the conditions and time of day.
 * Every class string is written out literally so Tailwind can find it.
 */
export function conditionGradient(icon: string | undefined): string {
    const code = icon?.slice(0, 2) ?? "";
    const night = icon?.endsWith("n") ?? false;

    if (night) {
        switch (code) {
            case "01":
            case "02":
                return "from-indigo-800 to-slate-900";
            case "09":
            case "10":
            case "11":
                return "from-slate-800 to-indigo-950";
            default:
                return "from-slate-700 to-slate-900";
        }
    }

    switch (code) {
        case "01":
            return "from-sky-400 to-blue-600";
        case "02":
            return "from-sky-400 to-blue-500";
        case "03":
        case "04":
            return "from-slate-400 to-slate-600";
        case "09":
        case "10":
            return "from-blue-600 to-slate-700";
        case "11":
            return "from-slate-600 to-indigo-900";
        case "13":
            return "from-sky-300 to-slate-500";
        case "50":
            return "from-slate-400 to-slate-500";
        default:
            return "from-blue-500 to-blue-600";
    }
}
