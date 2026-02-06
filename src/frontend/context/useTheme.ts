import { createContext, useContext } from "react";

export type Theme = "dark" | "light" | "system";

export interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

export const ThemeContext = createContext<ThemeProviderState>(initialState);

/** Hook to access theme state */
export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
