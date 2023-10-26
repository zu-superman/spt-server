/* eslint-disable @typescript-eslint/naming-convention */
import type { Config } from "jest";
import fs from "fs";

const config: Config = {
    testEnvironment: "./tests/CustomEnvironment.ts",
    roots: [
        "./tests/"
    ],
    transform: {
        "^.+\\.ts$": [ "@swc/jest", JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, "utf-8")) ]
    }
};

export default config;
