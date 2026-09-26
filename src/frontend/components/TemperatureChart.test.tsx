import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TemperatureChart } from "./TemperatureChart";
import { HourlyStrip } from "./HourlyStrip";
import { SettingsProvider } from "../context/SettingsContext";
import type { ForecastData, HourlyForecast } from "../types";

const daily: ForecastData[] = [
    { date: "2026-09-26", temp: 22, tempMin: 18, tempMax: 25, description: "Clear", icon: "01d" },
    { date: "2026-09-27", temp: 24, tempMin: 19, tempMax: 27, description: "Clouds", icon: "03d" },
    { date: "2026-09-28", temp: 19, tempMin: 15, tempMax: 21, description: "Rain", icon: "10d" },
];

describe("TemperatureChart", () => {
    it("draws one point per day with an accessible summary", () => {
        const { container } = render(<SettingsProvider><TemperatureChart data={daily} /></SettingsProvider>);
        const svg = screen.getByRole("img");
        expect(svg).toHaveAttribute("aria-label", expect.stringContaining("Sat 22°C"));
        expect(svg).toHaveAttribute("aria-label", expect.stringContaining("Mon 19°C"));
        expect(container.querySelectorAll("circle")).toHaveLength(3);
        // Area fill plus the line itself
        expect(container.querySelectorAll("path")).toHaveLength(2);
    });

    it("shows a tooltip with the day's high and low on hover", () => {
        render(<SettingsProvider><TemperatureChart data={daily} /></SettingsProvider>);
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

        fireEvent.mouseMove(screen.getByRole("img"), { clientX: 0 });
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveTextContent("25°C");
        expect(tooltip).toHaveTextContent("18°C");

        fireEvent.mouseLeave(screen.getByRole("img"));
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("renders nothing for an empty series", () => {
        const { container } = render(<SettingsProvider><TemperatureChart data={[]} /></SettingsProvider>);
        expect(container.querySelector("svg")).toBeNull();
    });
});

describe("HourlyStrip", () => {
    const hourly: HourlyForecast[] = [
        { time: 0, temp: 10, description: "Clear", icon: "01d", pop: 0 },
        { time: 3 * 3600, temp: 12, description: "Rain", icon: "10d", pop: 60 },
    ];

    it("lists each slot in the city's local time with precipitation when present", () => {
        render(<SettingsProvider><HourlyStrip hourly={hourly} timezone={3600} /></SettingsProvider>);
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(2);
        // Epoch + 1h offset reads as 1 AM local
        expect(items[0]).toHaveTextContent(/1\s?AM|01/);
        expect(items[1]).toHaveTextContent("60%");
        expect(items[1]).toHaveTextContent("12°C");
    });
});
