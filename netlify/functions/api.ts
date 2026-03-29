import serverless from "serverless-http";
import { app } from "../../src/backend/server";

export const handler = serverless(app);
