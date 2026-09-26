import { hasCoords, type SavedLocation } from "../types";

/**
 * Build the details-page path for a location. Coordinates ride along as
 * query params so the page can fetch the exact place rather than relying
 * on a name lookup, which is ambiguous for cities like "Springfield".
 */
export function weatherPath(location: SavedLocation): string {
    const base = `/weather/${encodeURIComponent(location.name)}`;
    if (!hasCoords(location)) return base;
    const query = new URLSearchParams({ lat: String(location.lat), lon: String(location.lon) });
    return `${base}?${query.toString()}`;
}
