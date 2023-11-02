/* eslint-disable @typescript-eslint/naming-convention */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "spt-server",
        root: "./tests",
        environment: "./CustomEnvironment.ts",
        globals: true,
        typecheck: {
            enabled: true
        },
        alias: {
            "@spt-aki": path.resolve(__dirname, "src"),
            "@tests": path.resolve(__dirname, "tests")
        }
    }
});
