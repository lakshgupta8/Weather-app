import { useEffect, useState } from "react";
import { Loader2, Activity, Server, Code2 } from "lucide-react";
import axios from "axios";

import { BASE_URL } from "../api";

export const AboutPage = () => {
    const [health, setHealth] = useState<{ status: string; timestamp: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Check backend health on mount
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/health`);
                setHealth(response.data);
            } catch (error) {
                console.error("Health check failed", error);
                setHealth(null);
            } finally {
                setLoading(false);
            }
        };

        checkHealth();
    }, []);

    return (
        <div className="space-y-8 py-6 animate-in duration-500 fade-in">
            <header className="space-y-2 text-center">
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-3xl">About Weather App</h1>
                <p className="text-slate-500 dark:text-slate-400">System status and attribution information</p>
            </header>

            <div className="gap-6 grid md:grid-cols-2">
                {/* System Status Card */}
                <div className="bg-white dark:bg-slate-800 shadow-sm p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Server className="w-6 h-6 text-blue-500" />
                        <h2 className="font-bold text-slate-800 dark:text-slate-200 text-xl">System Status</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Checking system health...</span>
                        </div>
                    ) : health ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <Activity className="w-5 h-5" />
                                <span className="font-medium">All Systems Operational</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg font-mono text-slate-600 dark:text-slate-400 text-xs">
                                Last Checked: {new Date(health.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <Activity className="w-5 h-5" />
                                <span className="font-medium">Backend Offline</span>
                            </div>
                            <p className="text-slate-500 text-sm">
                                Unable to connect to the weather service. Please check your internet connection or try again later.
                            </p>
                        </div>
                    )}
                </div>

                {/* Attribution & Tech Stack */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 shadow-sm p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <h2 className="mb-4 font-bold text-slate-800 dark:text-slate-200 text-xl">Attribution</h2>
                        <p className="mb-4 text-slate-600 dark:text-slate-300">
                            Weather data is provided by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-500 hover:underline">OpenWeatherMap</a>.
                        </p>
                        <p className="text-slate-500 text-sm">
                            Icons provided by <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lucide React</a>.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow-sm p-6 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Code2 className="w-6 h-6 text-purple-500" />
                            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-xl">Tech Stack</h2>
                        </div>
                        <ul className="flex flex-wrap gap-2">
                            {["React 19", "TypeScript", "Tailwind CSS v4", "Vite", "Bun", "Express", "Recharts"].map((tech) => (
                                <li key={tech} className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full font-medium text-slate-700 dark:text-slate-300 text-sm">
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
