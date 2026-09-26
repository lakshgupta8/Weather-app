import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsProvider } from "./SettingsContext";
import { useSettings } from "./useSettings";

const Probe = () => {
    const { unit, toggleUnit, formatTemp, formatSpeed, formatDistance } = useSettings();
    return (
        <div>
            <output data-testid="unit">{unit}</output>
            <output data-testid="temp">{formatTemp(20)}</output>
            <output data-testid="speed">{formatSpeed(10)}</output>
            <output data-testid="vis">{formatDistance(8000)}</output>
            <output data-testid="vis-far">{formatDistance(10000)}</output>
            <output data-testid="vis-none">{formatDistance(null)}</output>
            <button onClick={toggleUnit}>toggle</button>
        </div>
    );
};

describe("SettingsProvider", () => {
    it("formats in metric by default", () => {
        render(<SettingsProvider><Probe /></SettingsProvider>);
        expect(screen.getByTestId("unit")).toHaveTextContent("metric");
        expect(screen.getByTestId("temp")).toHaveTextContent("20°C");
        expect(screen.getByTestId("speed")).toHaveTextContent("10 m/s");
        expect(screen.getByTestId("vis")).toHaveTextContent("8 km");
        expect(screen.getByTestId("vis-far")).toHaveTextContent("10 km");
        expect(screen.getByTestId("vis-none")).toHaveTextContent("N/A");
    });

    it("converts to imperial on toggle and remembers the choice", async () => {
        render(<SettingsProvider><Probe /></SettingsProvider>);
        await userEvent.click(screen.getByText("toggle"));
        expect(screen.getByTestId("temp")).toHaveTextContent("68°F");
        expect(screen.getByTestId("speed")).toHaveTextContent("22 mph");
        expect(screen.getByTestId("vis")).toHaveTextContent("5 mi");
        expect(localStorage.getItem("weather-app-settings-unit")).toBe("imperial");
    });

    it("restores a saved unit", () => {
        localStorage.setItem("weather-app-settings-unit", "imperial");
        render(<SettingsProvider><Probe /></SettingsProvider>);
        expect(screen.getByTestId("unit")).toHaveTextContent("imperial");
    });
});
