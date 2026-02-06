import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { LocationProvider } from "./context/LocationContext";
import { WeatherProvider } from "./context/WeatherContext";
import { SettingsProvider } from "./context/SettingsContext";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage").then(module => ({ default: module.HomePage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then(module => ({ default: module.SearchPage })));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage").then(module => ({ default: module.ComparisonPage })));
const WeatherDetailsPage = lazy(() => import("./pages/WeatherDetailsPage").then(module => ({ default: module.WeatherDetailsPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then(module => ({ default: module.AboutPage })));

const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
);

const App = () => {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <GlobalErrorBoundary>
                <SettingsProvider>
                    <LocationProvider>
                        <WeatherProvider>
                            <Suspense fallback={<LoadingFallback />}>
                                <Routes>
                                    <Route path="/" element={<MainLayout />}>
                                        <Route index element={<HomePage />} />
                                        <Route path="search" element={<SearchPage />} />
                                        <Route path="compare" element={<ComparisonPage />} />
                                        <Route path="weather/:city" element={<WeatherDetailsPage />} />
                                        <Route path="about" element={<AboutPage />} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </WeatherProvider>
                    </LocationProvider>
                </SettingsProvider>
            </GlobalErrorBoundary>
        </ThemeProvider>
    );
};

export default App;
