import { useEffect, useState } from "react";
import { ThemeContext } from "./useTheme";
import type { Theme, ThemeProviderState } from "./useTheme";

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

/**
 * Theme Provider
 * Manages light/dark mode with system preference support.
 */
export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const apply = () => {
            root.classList.remove("light", "dark");
            const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
            root.classList.add(resolved);
        };

        apply();

        // In "system" mode, follow OS changes while the app is open
        if (theme !== "system") return;
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
    }, [theme]);

    const value: ThemeProviderState = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
