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

/**
 * Format a unix timestamp as wall-clock time in the *city's* timezone, given
 * its UTC offset in seconds. Shifting the instant by the offset and then
 * formatting as UTC yields the local reading regardless of the viewer's zone.
 */
export function formatLocalTime(
    unixSeconds: number,
    tzOffsetSeconds: number,
    options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }
): string {
    const shifted = new Date((unixSeconds + tzOffsetSeconds) * 1000);
    return shifted.toLocaleTimeString(undefined, { ...options, timeZone: "UTC" });
}

/** Hour-only label for the hourly strip, e.g. "3 PM" or "15:00" depending on locale */
export function formatLocalHour(unixSeconds: number, tzOffsetSeconds: number): string {
    return formatLocalTime(unixSeconds, tzOffsetSeconds, { hour: "numeric" });
}
