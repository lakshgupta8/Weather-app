import { useState, useEffect, useId } from "react";
import { Search as SearchIcon, Clock, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "../context/useLocation";
import { useWeatherContext } from "../context/useWeatherContext";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { getCitySuggestions } from "../api";
import { hasCoords, type CitySuggestion, type SavedLocation } from "../types";

interface CitySearchProps {
    /** When provided, selection is handed to the caller instead of the shared weather context */
    onCitySelect?: (location: SavedLocation) => void;
}

export function CitySearch({ onCitySelect }: CitySearchProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    /** Index of the keyboard-highlighted option in whichever list is open, or -1 */
    const [activeIndex, setActiveIndex] = useState(-1);
    const listId = useId();

    const { recentSearches, addRecentSearch, clearHistory } = useLocation();
    const { fetchWeatherByCity, fetchWeatherByLocation } = useWeatherContext();
    const navigate = useNavigate();

    const debouncedQuery = useDebounce(query, 800);

    /** Fetch suggestions once debounced query settles (clearing is handled in handleQueryChange) */
    useEffect(() => {
        const trimmed = debouncedQuery.trim();
        if (trimmed.length < 3) return;

        const controller = new AbortController();
        getCitySuggestions(trimmed, controller.signal)
            .then((results) => {
                if (controller.signal.aborted) return;
                setSuggestions(results);
                setIsLoadingSuggestions(false);
                setActiveIndex(-1);
            })
            .catch(() => {
                // Aborted by a newer query; the next effect run owns the state
            });

        return () => controller.abort();
    }, [debouncedQuery]);

    const closeDropdown = () => {
        setIsFocused(false);
        setActiveIndex(-1);
    };

    const handleSearch = async (location: SavedLocation) => {
        const name = location.name.trim();
        if (!name) return;

        setSuggestions([]);
        setIsLoadingSuggestions(false);
        closeDropdown();

        if (onCitySelect) {
            onCitySelect({ ...location, name });
            setQuery("");
            return;
        }

        setQuery(name);
        // Move to the results page first so its loading state is visible while we fetch
        navigate("/search");

        const ok = hasCoords(location)
            ? await fetchWeatherByLocation(location.lat, location.lon)
            : await fetchWeatherByCity(name);

        // Only remember searches that actually resolved to a place
        if (ok) addRecentSearch({ ...location, name });
    };

    const handleSuggestionSelect = (suggestion: CitySuggestion) => {
        setQuery(suggestion.name);
        handleSearch({ name: suggestion.name, lat: suggestion.lat, lon: suggestion.lon });
    };

    /** Set loading true immediately on each keystroke when query is long enough */
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        // Typing proves the input is focused, even right after a submit hid the dropdown
        setIsFocused(true);
        setActiveIndex(-1);
        if (val.trim().length >= 3) {
            setIsLoadingSuggestions(true);
        } else {
            setSuggestions([]);
            setIsLoadingSuggestions(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch({ name: query });
    };

    const showSuggestions = isFocused && suggestions.length > 0 && query.trim().length >= 3;
    const showRecent = isFocused && query.trim().length === 0 && recentSearches.length > 0;
    const showLoading = isFocused && isLoadingSuggestions && query.trim().length >= 3;
    const showNoResults =
        isFocused &&
        !isLoadingSuggestions &&
        suggestions.length === 0 &&
        debouncedQuery.trim().length >= 3 &&
        query === debouncedQuery;

    /** Whichever list is currently open drives keyboard navigation */
    const options: SavedLocation[] = showSuggestions
        ? suggestions.map((s) => ({ name: s.name, lat: s.lat, lon: s.lon }))
        : showRecent
            ? recentSearches
            : [];
    const listOpen = options.length > 0;
    const optionId = (index: number) => `${listId}-option-${index}`;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            if (listOpen) e.preventDefault();
            closeDropdown();
            return;
        }
        if (!listOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % options.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            const chosen = options[activeIndex];
            setQuery(chosen.name);
            handleSearch(chosen);
        }
    };

    const optionClass = (index: number) =>
        `flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${
            index === activeIndex ? "bg-blue-50 dark:bg-slate-700" : "hover:bg-slate-50 dark:hover:bg-slate-700"
        }`;

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit} className="z-20 relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(closeDropdown, 200)}
                    placeholder="Search city..."
                    aria-label="Search city"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={listOpen}
                    aria-controls={listOpen ? listId : undefined}
                    aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
                    className="dark:bg-slate-800 py-3 pr-10 pl-10 border border-slate-200 focus:border-blue-500 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full dark:text-white transition-all"
                />
                {/* Left icon: spinner while loading, search otherwise */}
                <div className="top-3.5 left-3 absolute text-slate-400">
                    {showLoading ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                        <button type="submit" aria-label="Submit search" className="hover:text-blue-500 transition-colors">
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && (
                <div className="top-full right-0 left-0 z-10 absolute bg-white dark:bg-slate-800 shadow-lg mt-2 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden animate-in duration-150 fade-in zoom-in-95">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 border-slate-100 dark:border-slate-700 border-b">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Suggestions</span>
                    </div>
                    <ul id={listId} role="listbox" aria-label="City suggestions">
                        {suggestions.map((suggestion, idx) => {
                            const label = [suggestion.name, suggestion.state, suggestion.country]
                                .filter(Boolean)
                                .join(", ");
                            return (
                                <li
                                    key={`${suggestion.lat}-${suggestion.lon}-${idx}`}
                                    id={optionId(idx)}
                                    role="option"
                                    aria-selected={idx === activeIndex}
                                    aria-label={label}
                                >
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        className={optionClass(idx)}
                                    >
                                        <MapPin className="shrink-0 w-4 h-4 text-blue-400" />
                                        <div>
                                            <span className="font-medium text-slate-800 dark:text-slate-100">
                                                {suggestion.name}
                                            </span>
                                            {(suggestion.state || suggestion.country) && (
                                                <span className="ml-1 text-slate-400 dark:text-slate-400 text-sm">
                                                    {[suggestion.state, suggestion.country].filter(Boolean).join(", ")}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* No results state */}
            {showNoResults && (
                <div className="top-full right-0 left-0 z-10 absolute bg-white dark:bg-slate-800 shadow-lg mt-2 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden animate-in duration-150 fade-in zoom-in-95">
                    <p className="px-4 py-4 text-slate-400 dark:text-slate-500 text-sm text-center">
                        No cities found for &ldquo;{debouncedQuery}&rdquo;
                    </p>
                </div>
            )}

            {/* Recent Searches Dropdown (shown only when query is empty) */}
            {showRecent && (
                <div className="top-full right-0 left-0 z-10 absolute bg-white dark:bg-slate-800 shadow-lg mt-2 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden animate-in duration-200 fade-in zoom-in-95">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 px-4 py-2 border-slate-100 dark:border-slate-700 border-b">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Recent</span>
                        <button
                            onClick={clearHistory}
                            className="font-medium text-red-500 hover:text-red-600 text-xs"
                        >
                            Clear
                        </button>
                    </div>
                    <ul id={listId} role="listbox" aria-label="Recent searches">
                        {recentSearches.map((location, idx) => (
                            <li
                                key={location.name}
                                id={optionId(idx)}
                                role="option"
                                aria-selected={idx === activeIndex}
                            >
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    onClick={() => handleSearch(location)}
                                    className={`${optionClass(idx)} text-slate-700 dark:text-slate-200`}
                                >
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{location.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
