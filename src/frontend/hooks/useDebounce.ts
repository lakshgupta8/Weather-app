import { useState, useEffect } from "react";

/**
 * Debounces a value, returning the latest value only after
 * the specified delay has elapsed without a new value being set.
 */
export function useDebounce<T>(value: T, delay: number = 600): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: cancel the timer if value changes before delay elapses
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
