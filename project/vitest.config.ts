/* eslint-disable @typescript-eslint/naming-convention */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "spt-server",
        api: 51204,
        reporters: ["default"],
        root: "./tests",
        cache: false,
        environment: "./CustomEnvironment.ts",
        globals: true,
        coverage: {
            enabled: true,
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./__coverage__"
        },
        typecheck: {
            enabled: true
        },
        alias: {
            "@spt-aki": path.resolve(__dirname, "src"),
            "@tests": path.resolve(__dirname, "tests")
        }
    }
});
