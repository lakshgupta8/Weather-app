import { memo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ForecastData } from "../types";

interface TemperatureChartProps {
    data: ForecastData[];
    unit?: "metric" | "imperial";
}

/**
 * Temperature Chart
 * Renders an area chart of forecast data. Memoized to prevent unnecessary re-renders.
 */
export const TemperatureChart = memo(function TemperatureChart({ data, unit = "metric" }: TemperatureChartProps) {
    return (
        <div className="w-full h-64" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickMargin={10}
                    />
                    <YAxis
                        hide
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number | string | Array<number | string> | undefined) => [`${Math.round(Number(value || 0))}°${unit === "metric" ? "C" : "F"}`, 'Temperature']}
                        labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
});
