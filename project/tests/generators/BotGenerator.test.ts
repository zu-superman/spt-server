import "reflect-metadata";
import { container } from "tsyringe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BotGenerator } from "@spt-aki/generators/BotGenerator";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";

describe("BotGenerator", () =>
{
    let botGenerator: any;

    beforeEach(() =>
    {
        botGenerator = container.resolve<BotGenerator>("BotGenerator");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
    });

    // describe("prepareAndGenerateBots", () =>
    // {
    //     it("should return a single generated assault bot", () =>
    //     {
    //         const mockPlayerProfile = {
    //             Info: {
    //                 Nickname: "Player Nickname",
    //                 Level: 1
    //             }
    //         };

    //         vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);
    //         vi.spyOn(botGenerator.botEquipmentFilterService.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);
    //         vi.spyOn(botGenerator.botInventoryGenerator.botWeaponGenerator.botEquipmentModGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);

    //         const sessionId = "12345";
    //         const generationDetails: BotGenerationDetails = {
    //             isPmc: false,
    //             role: "assault",
    //             side: "Savage",
    //             playerLevel: 1,
    //             botRelativeLevelDeltaMax: 10,
    //             botCountToGenerate: 1,
    //             botDifficulty: "easy",
    //             isPlayerScav: false
    //         };

    //         const result = botGenerator.prepareAndGenerateBots(sessionId, generationDetails);

    //         expect(result.length).toBe(1);
    //         expect(result[0].Info.Side).toBe("Savage");
    //     });
    // });

    describe("generateBotNickname", () =>
    {
        it("should return single name `test` for non pscav assault bot name ", () =>
        {
            botGenerator.botConfig.chanceAssaultScavHasPlayerScavName = 0;

            const mockPlayerProfile = { Info: { Nickname: "Player Nickname", Level: 1 } };

            vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);

            const botJsonTemplate = { firstName: ["test"], lastName: [] };

            const sessionId = "sessionId";
            const isPlayerScav = false;
            const botRole = "assault";

            const result = botGenerator.generateBotNickname(botJsonTemplate, isPlayerScav, botRole, sessionId);
            expect(result).toBe("test");
        });

        it("should return `test assault` for non pscav assault bot with `showTypeInNickname` enabled ", () =>
        {
            botGenerator.botConfig.showTypeInNickname = true;

            const mockPlayerProfile = { Info: { Nickname: "Player Nickname", Level: 1 } };
            vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);

            const botJsonTemplate = { firstName: ["test"], lastName: [] };

            const sessionId = "sessionId";
            const isPlayerScav = false;
            const botRole = "assault";

            const result = botGenerator.generateBotNickname(botJsonTemplate, isPlayerScav, botRole, sessionId);
            expect(result).toBe("test assault");
        });

        it("should return name `test Player` for bot with same name as player and `addPrefixToSameNamePMCAsPlayerChance` 100%", () =>
        {
            botGenerator.botConfig.showTypeInNickname = false;
            botGenerator.pmcConfig.addPrefixToSameNamePMCAsPlayerChance = 100;

            const mockPlayerProfile = { Info: { Nickname: "Player", Level: 1 } };
            vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);
            vi.spyOn(botGenerator.localisationService, "getRandomTextThatMatchesPartialKey").mockReturnValue("test");

            const botJsonTemplate = { firstName: ["Player"], lastName: [] };

            const sessionId = "sessionId";
            const isPlayerScav = false;
            const botRole = "assault";

            const result = botGenerator.generateBotNickname(botJsonTemplate, isPlayerScav, botRole, sessionId);
            expect(result).toBe("test Player");
        });

        it("should return name `test` for player scav bot", () =>
        {
            botGenerator.botConfig.chanceAssaultScavHasPlayerScavName = 100;

            const mockPlayerProfile = { Info: { Nickname: "Player", Level: 1 } };
            vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);

            const botJsonTemplate = { firstName: ["test"], lastName: [] };

            const sessionId = "sessionId";
            const isPlayerScav = true;
            const botRole = "assault";

            const result = botGenerator.generateBotNickname(botJsonTemplate, isPlayerScav, botRole, sessionId);
            expect(result).toBe("test");
        });

        it("should return name `test (usec)` for player scav bot", () =>
        {
            botGenerator.botConfig.chanceAssaultScavHasPlayerScavName = 100;
            botGenerator.databaseServer.getTables().bots.types.usec.firstName = ["usec"];
            botGenerator.databaseServer.getTables().bots.types.bear.firstName = [];

            const mockPlayerProfile = { Info: { Nickname: "Player", Level: 1 } };
            vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);

            const botJsonTemplate = { firstName: ["test"], lastName: [] };

            const sessionId = "sessionId";
            const isPlayerScav = false;
            const botRole = "assault";

            const result = botGenerator.generateBotNickname(botJsonTemplate, isPlayerScav, botRole, sessionId);
            expect(result).toBe("test (usec)");
        });
    });
});
