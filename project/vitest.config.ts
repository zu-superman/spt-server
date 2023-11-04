/* eslint-disable @typescript-eslint/naming-convention */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "spt-server",
        api: 51204,
        reporters: ["default"],
        root: "./",
        cache: false,
        environment: "./tests/CustomEnvironment.ts",
        globals: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./tests/__coverage__",
            reportOnFailure: true,
            all: true,
            include: ["src"],
            exclude: ["src/models/**", "tests/**"] 
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
