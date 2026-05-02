import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { CloudSun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";
import { UnitToggle } from "../components/UnitToggle";

export const MainLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMenuOpen(false);
    }, [location]);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <div className="flex flex-col bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Navigation Bar */}
            <header className="top-4 z-50 sticky mx-auto px-4 w-full max-w-5xl transition-all duration-300">
                <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl px-6 border border-white/20 dark:border-white/5 rounded-2xl h-16">
                    <Link to="/" className="z-50 flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <CloudSun className="w-8 h-8 text-blue-500" />
                        <span className="font-bold text-xl tracking-tight">HorizonHue</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4">
                        <div className="flex gap-1">
                            <NavLink to="/">Home</NavLink>
                            <NavLink to="/search">Search</NavLink>
                            <NavLink to="/about">About</NavLink>
                        </div>
                        <div className="flex items-center gap-2 pl-4 border-slate-200 dark:border-slate-700 border-l">
                            <UnitToggle />
                            <ThemeToggle />
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden z-50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="md:hidden z-40 fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />

                            {/* Drawer */}
                            <motion.nav
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="md:hidden top-0 right-0 z-40 fixed flex flex-col gap-6 bg-white/60 dark:bg-slate-900/60 shadow-2xl backdrop-blur-2xl p-8 pt-24 border-white/20 dark:border-white/5 border-l w-64 h-full"
                            >
                                <div className="flex flex-col gap-2">
                                    <MobileNavLink to="/">Home</MobileNavLink>
                                    <MobileNavLink to="/search">Search</MobileNavLink>
                                    <MobileNavLink to="/about">About</MobileNavLink>
                                </div>

                                <div className="pt-6 border-slate-100 dark:border-slate-800 border-t">
                                    <p className="mb-4 font-medium text-slate-400 text-xs uppercase tracking-wider">Settings</p>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-sm">Units</span>
                                            <UnitToggle />
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-sm">Theme</span>
                                            <ThemeToggle />
                                        </div>
                                    </div>
                                </div>
                            </motion.nav>
                        </>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-col flex-1 items-center p-4 md:p-8 pt-10 md:pt-14">
                <div className="w-full max-w-lg">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-slate-400 text-sm text-center">
                <p>&copy; {new Date().getFullYear()} HorizonHue.</p>
            </footer>
        </div>
    );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="hover:bg-white/40 dark:hover:bg-white/10 px-4 py-2 rounded-xl font-medium text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 dark:text-slate-400 transition-all"
    >
        {children}
    </Link>
);

const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
        to={to}
        className="active:bg-blue-50 dark:active:bg-blue-900/20 px-4 py-3 rounded-xl font-semibold text-slate-600 active:text-blue-600 dark:active:text-blue-400 dark:text-slate-300 text-lg transition-colors"
    >
        {children}
    </Link>
);
