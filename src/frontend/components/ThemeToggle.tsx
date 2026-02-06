import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/useTheme";

/** Toggle between Light/Dark modes */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`p-2 rounded-full transition-colors ${theme === "dark"
                ? "bg-slate-800 text-blue-400 hover:bg-slate-700"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
    );
}
