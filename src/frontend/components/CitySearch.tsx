import { useState } from "react";
import { Search as SearchIcon, Clock } from "lucide-react";
import { useLocation } from "../context/useLocation";
import { useWeatherContext } from "../context/useWeatherContext";
import { useNavigate } from "react-router-dom";

interface CitySearchProps {
    onCitySelect?: (city: string) => void;
}

export function CitySearch({ onCitySelect }: CitySearchProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const { recentSearches, addRecentSearch, clearHistory } = useLocation();
    const { fetchWeatherByCity } = useWeatherContext();
    const navigate = useNavigate();

    const handleSearch = async (city: string) => {
        if (!city.trim()) return;

        if (onCitySelect) {
            onCitySelect(city);
            setQuery("");
            setIsFocused(false);
            return;
        }

        await fetchWeatherByCity(city);
        addRecentSearch(city);
        navigate(`/search`); // Ideally direct to details or just stay on search results
        setQuery(city);
        setIsFocused(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit} className="z-20 relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
                    placeholder="Search city..."
                    aria-label="Search city"
                    className="dark:bg-slate-800 py-3 pr-4 pl-10 border border-slate-200 focus:border-blue-500 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full dark:text-white transition-all"
                />
                <button
                    type="submit"
                    className="top-3.5 left-3 absolute text-slate-400 hover:text-blue-500"
                    aria-label="Submit search"
                >
                    <SearchIcon className="w-5 h-5" />
                </button>
            </form>

            {/* Recent Searches Dropdown */}
            {isFocused && recentSearches.length > 0 && (
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
