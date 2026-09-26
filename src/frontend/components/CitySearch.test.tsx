import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CitySearch } from "./CitySearch";
import { LocationProvider } from "../context/LocationContext";
import { WeatherContext } from "../context/useWeatherContext";
import type { UseWeatherResult } from "../domains/weather/hooks/useWeather";

vi.mock("../api", () => ({
    getCitySuggestions: vi.fn(),
}));

import { getCitySuggestions } from "../api";

const weatherStub: UseWeatherResult = {
    weather: null,
    forecast: null,
    loading: false,
    error: "",
    fetchWeatherByCity: vi.fn().mockResolvedValue(true),
    fetchWeatherByLocation: vi.fn().mockResolvedValue(true),
};

const renderSearch = (onCitySelect = vi.fn()) => {
    render(
        <MemoryRouter>
            <LocationProvider>
                <WeatherContext.Provider value={weatherStub}>
                    <CitySearch onCitySelect={onCitySelect} />
                </WeatherContext.Provider>
            </LocationProvider>
        </MemoryRouter>
    );
    return onCitySelect;
};

describe("CitySearch keyboard navigation", () => {
    beforeEach(() => {
        vi.mocked(getCitySuggestions).mockResolvedValue([
            { name: "Springfield", state: "Illinois", country: "US", lat: 39.8, lon: -89.6 },
            { name: "Springfield", state: "Missouri", country: "US", lat: 37.2, lon: -93.3 },
        ]);
    });

    it("moves through suggestions with the arrow keys and selects with Enter", async () => {
        const user = userEvent.setup();
        const onCitySelect = renderSearch();
        const input = screen.getByRole("combobox", { name: "Search city" });

        await user.type(input, "Spri");
        const options = await screen.findAllByRole("option", {}, { timeout: 3000 });
        expect(options).toHaveLength(2);
        expect(input).toHaveAttribute("aria-expanded", "true");

        await user.keyboard("{ArrowDown}{ArrowDown}");
        expect(options[1]).toHaveAttribute("aria-selected", "true");
        expect(input).toHaveAttribute("aria-activedescendant", options[1].id);

        await user.keyboard("{Enter}");
        expect(onCitySelect).toHaveBeenCalledWith({ name: "Springfield", lat: 37.2, lon: -93.3 });
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("wraps from the first option back to the last on ArrowUp", async () => {
        const user = userEvent.setup();
        renderSearch();
        await user.type(screen.getByRole("combobox"), "Spri");
        const options = await screen.findAllByRole("option", {}, { timeout: 3000 });

        await user.keyboard("{ArrowUp}");
        expect(options[1]).toHaveAttribute("aria-selected", "true");
    });

    it("closes the list on Escape and submits the typed text on plain Enter", async () => {
        const user = userEvent.setup();
        const onCitySelect = renderSearch();
        const input = screen.getByRole("combobox");

        await user.type(input, "Spri");
        await screen.findAllByRole("option", {}, { timeout: 3000 });
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

        await user.keyboard("{Enter}");
        expect(onCitySelect).toHaveBeenCalledWith({ name: "Spri" });
    });

    it("navigates recent searches when the input is empty", async () => {
        localStorage.setItem("recentSearches", JSON.stringify([{ name: "Oslo", lat: 59.9, lon: 10.7 }, { name: "Rome" }]));
        const user = userEvent.setup();
        const onCitySelect = renderSearch();

        await user.click(screen.getByRole("combobox"));
        expect(await screen.findByRole("listbox", { name: "Recent searches" })).toBeInTheDocument();

        await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
        expect(onCitySelect).toHaveBeenCalledWith({ name: "Rome" });
    });
});
