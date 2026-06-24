import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";
import { client } from "./generated/client.gen";

// The generated client uses a relative baseUrl ("/api"), which the browser
// resolves against the page origin. Node's fetch needs an absolute URL, so give
// it one here — MSW matches on the path, so the host is irrelevant.
client.setConfig({ baseUrl: "http://localhost/api" });

// vite.config.ts doesn't set test.globals, so RTL's automatic per-test cleanup
// is never installed. Register it centrally here so the DOM is torn down between
// tests and multi-render test files don't accumulate stale nodes.
afterEach(cleanup);

// Start the mock backend once, reset any per-test handler overrides between
// tests, and tear down at the end. Unhandled requests error so a missing mock
// is obvious rather than silently hitting the network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
