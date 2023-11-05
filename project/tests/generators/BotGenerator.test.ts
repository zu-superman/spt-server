/* eslint-disable @typescript-eslint/naming-convention */
import "reflect-metadata";
import { container } from "tsyringe";
import { vi, beforeAll, afterEach, describe, expect, it } from "vitest";
import { BotGenerator } from "@spt-aki/generators/BotGenerator";
import { BotGenerationDetails } from "@spt-aki/models/spt/bots/BotGenerationDetails";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";

describe("BotGenerator", () =>
{
    let botGenerator: any;

    beforeAll(() =>
    {
        botGenerator = container.resolve<BotGenerator>("BotGenerator");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
    });

    describe("prepareAndGenerateBots", () =>
    {
        it("should return a single generated assault bot", () =>
        {
            const mockPlayerProfile = {
                Info: {
                    Nickname: "Player Nickname",
                    Level: 1
                }
            };

            vi.spyOn(botGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);
            vi.spyOn(botGenerator.botEquipmentFilterService.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);
            vi.spyOn(botGenerator.botInventoryGenerator.botWeaponGenerator.botEquipmentModGenerator.profileHelper, "getPmcProfile").mockReturnValue(<IPmcData>mockPlayerProfile);

            const sessionId = "12345";
            const generationDetails: BotGenerationDetails = {
                isPmc: false,
                role: "assault",
                side: "Savage",
                playerLevel: 1,
                botRelativeLevelDeltaMax: 10,
                botCountToGenerate: 1,
                botDifficulty: "easy",
                isPlayerScav: false
            };

            const result = botGenerator.prepareAndGenerateBots(sessionId, generationDetails);

            expect(result.length).toBe(1);
            expect(result[0].Info.Side).toBe("Savage");
        });
    });
});
