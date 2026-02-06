import { Outlet, Link } from "react-router-dom";
import { CloudSun } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { UnitToggle } from "../components/UnitToggle";

export const MainLayout = () => {
    return (
        <div className="flex flex-col bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Navigation Bar */}
            <header className="top-0 z-10 sticky bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 dark:border-b">
                <div className="flex justify-between items-center mx-auto px-4 max-w-5xl h-16">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <CloudSun className="w-8 h-8 text-blue-500" />
                        <span className="font-bold text-xl tracking-tight">Weather</span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <div className="flex gap-1">
                            <NavLink to="/">Home</NavLink>
                            <NavLink to="/search">Search</NavLink>
                        </div>
                        <div className="flex items-center gap-2 pl-4 border-slate-200 dark:border-slate-700 border-l">
                            <UnitToggle />
                            <ThemeToggle />
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-col flex-1 items-center p-4 md:p-8">
                <div className="w-full max-w-lg">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-slate-400 text-sm text-center">
                <p>&copy; {new Date().getFullYear()} Weather App. <Link to="/about" className="hover:text-blue-500 hover:underline">About</Link></p>
            </footer>
        </div>
    );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-lg font-medium text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 dark:text-slate-400 transition-colors"
    >
        {children}
    </Link>
);
