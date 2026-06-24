import { setupServer } from "msw/node";
import { createHandlers } from "./handlers";

// Node counterpart of browser.ts, used in tests (jsdom). Same handlers, so
// createParty() behaves identically under test as it does in the running app.
export const server = setupServer(...createHandlers());
