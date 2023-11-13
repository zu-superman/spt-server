import "reflect-metadata";
import { container } from "tsyringe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BotLevelGenerator } from "@spt-aki/generators/BotLevelGenerator";
import { MinMax } from "@spt-aki/models/common/MinMax";
import { BotGenerationDetails } from "@spt-aki/models/spt/bots/BotGenerationDetails";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

describe("BotLevelGenerator", () =>
{
    let botLevelGenerator: any;
    let databaseServer: DatabaseServer;

    beforeEach(() =>
    {
        botLevelGenerator = container.resolve<BotLevelGenerator>("BotLevelGenerator");
        databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
    });

    describe("generateBotLevel", () =>
    {
        it("should return value between 5 and 10 when player is level 5 and max is 10", () =>
        {
            const levelDetails: MinMax = { min: 5, max: 10 };

            const botGenerationDetails: BotGenerationDetails = {
                isPmc: false,
                role: "",
                side: "",
                playerLevel: 5,
                botRelativeLevelDeltaMax: 0,
                botCountToGenerate: 0,
                botDifficulty: "",
                isPlayerScav: false,
            };

            const result = botLevelGenerator.generateBotLevel(levelDetails, botGenerationDetails, null);
            expect(result.level).greaterThan(0);
            expect(result.level).lessThan(10);
        });
    });

    describe("getHighestRelativeBotLevel", () =>
    {
        it("should return 10 when player level is 5 and delta is 5", () =>
        {
            const levelDetails: MinMax = { min: 5, max: 10 };

            const expTable = databaseServer.getTables().globals.config.exp.level.exp_table;

            const result = botLevelGenerator.getHighestRelativeBotLevel(5, 5, levelDetails, expTable);

            expect(result).toBe(10);
        });

        it("should return 79 when player level is above possible max (100), desired max is 100 and delta is 5", () =>
        {
            const levelDetails: MinMax = { min: 100, max: 100 };

            const expTable = databaseServer.getTables().globals.config.exp.level.exp_table;
            const playerLevel = 100;
            const relativeDeltaMax = 5;

            const result = botLevelGenerator.getHighestRelativeBotLevel(
                playerLevel,
                relativeDeltaMax,
                levelDetails,
                expTable,
            );

            expect(result).toBe(79);
        });
    });
});
