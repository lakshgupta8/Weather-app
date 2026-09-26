import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
    cleanup();
    // Backend tests run in the node environment, which has no storage
    if (typeof localStorage !== "undefined") localStorage.clear();
});
