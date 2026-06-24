import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "openapi.yaml",
  output: "src/generated",
  plugins: [
    {
      name: "@hey-api/client-fetch",
      baseUrl: "/api",
      throwOnError: true,
    },
    "@hey-api/sdk",
  ],
});
