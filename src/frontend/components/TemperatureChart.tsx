import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ForecastData } from "../types";
import { useSettings } from "../context/useSettings";
import { formatForecastDate } from "../utils/format";

interface TemperatureChartProps {
    data: ForecastData[];
}

const HEIGHT = 220;
const FALLBACK_WIDTH = 600;
const PAD = { top: 30, right: 28, bottom: 32, left: 28 };

interface Point {
    x: number;
    y: number;
}

/** Track the rendered width of a container so the SVG can use real pixels */
function useContainerWidth() {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        // ResizeObserver reports once on observe, which gives us the initial size
        const observer = new ResizeObserver((entries) => {
            const next = entries[0]?.contentRect.width ?? 0;
            setWidth(Math.round(next));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, width || FALLBACK_WIDTH] as const;
}

/** Catmull-Rom spline converted to cubic Béziers, for a smooth line through every point */
function smoothLine(points: Point[]): string {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
}

/**
 * Temperature Chart
 * A small hand-rolled SVG area chart of the daily forecast. Memoized to
 * prevent unnecessary re-renders.
 */
export const TemperatureChart = memo(function TemperatureChart({ data }: TemperatureChartProps) {
    const { convertTemp, formatTemp } = useSettings();
    const [containerRef, width] = useContainerWidth();
    const [active, setActive] = useState<number | null>(null);
    const gradientId = useId();

    const { points, linePath, areaPath, baseline } = useMemo(() => {
        const temps = data.map((d) => convertTemp(d.temp));
        const min = Math.min(...temps) - 2;
        const max = Math.max(...temps) + 2;
        const innerW = Math.max(1, width - PAD.left - PAD.right);
        const innerH = HEIGHT - PAD.top - PAD.bottom;
        const step = data.length > 1 ? innerW / (data.length - 1) : 0;
        const baseline = HEIGHT - PAD.bottom;

        const points: Point[] = temps.map((t, i) => ({
            x: PAD.left + (data.length > 1 ? i * step : innerW / 2),
            y: PAD.top + (max === min ? innerH / 2 : ((max - t) / (max - min)) * innerH),
        }));

        const linePath = smoothLine(points);
        const areaPath = points.length > 1
            ? `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
            : "";
        return { points, linePath, areaPath, baseline };
    }, [data, width, convertTemp]);

    if (data.length === 0) return null;

    const pickNearest = (clientX: number, target: SVGSVGElement) => {
        const rect = target.getBoundingClientRect();
        const x = clientX - rect.left;
        let best = 0;
        let bestDist = Infinity;
        points.forEach((p, i) => {
            const dist = Math.abs(p.x - x);
            if (dist < bestDist) {
                bestDist = dist;
                best = i;
            }
        });
        setActive(best);
    };

    const summary = data
        .map((d) => `${formatForecastDate(d.date, { weekday: "short" })} ${formatTemp(d.temp)}`)
        .join(", ");

    return (
        <div ref={containerRef} className="relative w-full select-none" style={{ height: HEIGHT }}>
            <svg
                role="img"
                aria-label={`Temperature trend: ${summary}`}
                width={width}
                height={HEIGHT}
                viewBox={`0 0 ${width} ${HEIGHT}`}
                className="block overflow-visible"
                onMouseMove={(e) => pickNearest(e.clientX, e.currentTarget)}
                onMouseLeave={() => setActive(null)}
                onTouchStart={(e) => pickNearest(e.touches[0].clientX, e.currentTarget)}
                onTouchMove={(e) => pickNearest(e.touches[0].clientX, e.currentTarget)}
                onTouchEnd={() => setActive(null)}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* Horizontal guide lines */}
                {[0.25, 0.5, 0.75].map((f) => {
                    const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * f;
                    return (
                        <line
                            key={f}
                            x1={PAD.left}
                            x2={width - PAD.right}
                            y1={y}
                            y2={y}
                            strokeDasharray="3 3"
                            className="stroke-slate-200 dark:stroke-slate-700"
                        />
                    );
                })}

                {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
                <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" />

                {points.map((p, i) => (
                    <g key={data[i].date}>
                        {active === i && (
                            <line
                                x1={p.x}
                                x2={p.x}
                                y1={PAD.top}
                                y2={baseline}
                                className="stroke-slate-300 dark:stroke-slate-600"
                                strokeDasharray="2 3"
                            />
                        )}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={active === i ? 6 : 4}
                            fill="#3b82f6"
                            className="stroke-white dark:stroke-slate-800"
                            strokeWidth={2}
                        />
                        <text
                            x={p.x}
                            y={p.y - 12}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight={600}
                            className="fill-slate-600 dark:fill-slate-300"
                        >
                            {formatTemp(data[i].temp)}
                        </text>
                        <text
                            x={p.x}
                            y={HEIGHT - 8}
                            textAnchor="middle"
                            fontSize={12}
                            className="fill-slate-500 dark:fill-slate-400"
                        >
                            {formatForecastDate(data[i].date, { weekday: "short" })}
                        </text>
                    </g>
                ))}
            </svg>

            {active !== null && (
                <div
                    role="tooltip"
                    className="top-0 absolute bg-white dark:bg-slate-800 shadow-lg px-3 py-2 border border-slate-100 dark:border-slate-700 rounded-xl text-xs -translate-x-1/2 pointer-events-none"
                    style={{ left: points[active].x }}
                >
                    <p className="text-slate-500 dark:text-slate-400">{formatForecastDate(data[active].date)}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {formatTemp(data[active].tempMax)}
                        <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">{formatTemp(data[active].tempMin)}</span>
                    </p>
                </div>
            )}
        </div>
    );
});
