/**
 * Format a YYYY-MM-DD calendar day (as returned by the forecast API) in the
 * user's locale. The string is parsed as a local date on purpose: it already
 * represents the city's local day, so no timezone shifting should happen.
 */
export function formatForecastDate(
    isoDate: string,
    options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }
): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) return isoDate;
    return new Date(year, month - 1, day).toLocaleDateString(undefined, options);
}
