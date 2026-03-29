import { useState, useEffect } from "react";
import { Search as SearchIcon, Clock, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "../context/useLocation";
import { useWeatherContext } from "../context/useWeatherContext";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { getCitySuggestions } from "../api";
import type { CitySuggestion } from "../types";

interface CitySearchProps {
    onCitySelect?: (city: string) => void;
}

export function CitySearch({ onCitySelect }: CitySearchProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const { recentSearches, addRecentSearch, clearHistory } = useLocation();
    const { fetchWeatherByCity } = useWeatherContext();
    const navigate = useNavigate();

    const debouncedQuery = useDebounce(query, 800);

    /** Fetch suggestions once debounced query settles (clearing is handled in handleQueryChange) */
    useEffect(() => {
        const trimmed = debouncedQuery.trim();
        if (trimmed.length < 3) return;

        let cancelled = false;
        getCitySuggestions(trimmed).then((results) => {
            if (!cancelled) {
                setSuggestions(results);
                setIsLoadingSuggestions(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    const handleSearch = async (city: string) => {
        if (!city.trim()) return;

        setSuggestions([]);
        setIsLoadingSuggestions(false);


        if (onCitySelect) {
            onCitySelect(city);
            setQuery("");
            setIsFocused(false);
            return;
        }

        await fetchWeatherByCity(city);
        addRecentSearch(city);
        navigate(`/search`);
        setQuery(city);
        setIsFocused(false);
    };

    const handleSuggestionSelect = (suggestion: CitySuggestion) => {
        const cityName = suggestion.name;
        setQuery(cityName);
        handleSearch(cityName);
    };

    /** Set loading true immediately on each keystroke when query is long enough */
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (val.trim().length >= 3) {
            setIsLoadingSuggestions(true);
        } else {
            setSuggestions([]);
            setIsLoadingSuggestions(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
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

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit} className="z-20 relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Search city..."
                    aria-label="Search city"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
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
                <div
                    role="listbox"
                    aria-label="City suggestions"
                    className="top-full right-0 left-0 z-10 absolute bg-white dark:bg-slate-800 shadow-lg mt-2 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden animate-in duration-150 fade-in zoom-in-95"
                >
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 border-slate-100 dark:border-slate-700 border-b">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Suggestions</span>
                    </div>
                    <ul>
                        {suggestions.map((suggestion, idx) => {
                            const label = [suggestion.name, suggestion.state, suggestion.country]
                                .filter(Boolean)
                                .join(", ");
                            return (
                                <li key={`${suggestion.lat}-${suggestion.lon}-${idx}`} role="option" aria-selected="false" aria-label={label}>
                                    <button
                                        type="button"
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-3 w-full text-left transition-colors"
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
                    <ul>
                        {recentSearches.map((city) => (
                            <li key={city}>
                                <button
                                    type="button"
                                    onClick={() => handleSearch(city)}
                                    className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-3 w-full text-slate-700 dark:text-slate-200 text-left transition-colors"
                                >
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{city}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
