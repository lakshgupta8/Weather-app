import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary
 * Catches unhandled errors in child components and displays a fallback UI.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 px-4 min-h-screen">
                    <div className="bg-white dark:bg-slate-800 shadow-xl p-8 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md text-center animate-in duration-300 zoom-in-95">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h1 className="mb-2 font-bold text-slate-800 dark:text-slate-100 text-2xl">Something went wrong</h1>
                        <p className="mb-6 text-slate-500 dark:text-slate-400">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-slate-100 dark:bg-slate-950/50 mb-6 p-3 rounded-lg max-h-40 overflow-auto font-mono text-red-500 text-xs text-left">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl w-full font-semibold text-white transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
