import serverless from "serverless-http";
import { connectLambda } from "@netlify/blobs";
import type { Handler } from "@netlify/functions";
import { app } from "../../src/backend/server";

const expressHandler = serverless(app);

/**
 * Lambda-compatible functions receive the Netlify Blobs context on the event
 * rather than in the environment, so it has to be wired up per invocation.
 * If that fails the response cache simply falls back to in-memory.
 */
export const handler: Handler = async (event, context) => {
    try {
        connectLambda(event as unknown as Parameters<typeof connectLambda>[0]);
    } catch (err) {
        console.warn("Netlify Blobs context unavailable:", err instanceof Error ? err.message : err);
    }
    return expressHandler(event, context) as ReturnType<Handler>;
};
