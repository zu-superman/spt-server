import "reflect-metadata";
import { container } from "tsyringe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InRaidHelper } from "@spt-aki/helpers/InRaidHelper";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

describe("InRaidHelper", () =>
{
    let inraidHelper: any;

    beforeEach(() =>
    {
        inraidHelper = container.resolve<InRaidHelper>("InRaidHelper");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
    });

    describe("calculateFenceStandingChangeFromKills", () =>
    {
        it("should return negative value when player kills 2 scavs as scav", () =>
        {
            const fenceStanding = 0;
            const postRaidPlayerVictims = [{ Side: "Savage", Role: "assault" }, { Side: "Savage", Role: "assault" }]; // Kills

            const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
            const scavStandingChangeOnKill = databaseServer.getTables().bots.types.assault.experience.standingForKill;

            const result = inraidHelper.calculateFenceStandingChangeFromKills(fenceStanding, postRaidPlayerVictims);
            expect(result).toBe(scavStandingChangeOnKill * postRaidPlayerVictims.length); // Scav rep loss times number of scav kills
            expect(result).lessThan(0);
        });

        it("should return positive value when player kills 2 PMCs of different sides as scav", () =>
        {
            const fenceStanding = 0;
            const postRaidPlayerVictims = [{ Side: "Usec", Role: "sptUsec" }, { Side: "Bear", Role: "sptBear" }]; // Kills

            const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
            const bearStandingChangeOnKill = databaseServer.getTables().bots.types.bear.experience.standingForKill;
            const usecStandingChangeOnKill = databaseServer.getTables().bots.types.bear.experience.standingForKill;

            const result = inraidHelper.calculateFenceStandingChangeFromKills(fenceStanding, postRaidPlayerVictims);
            expect(result).toBe(bearStandingChangeOnKill + usecStandingChangeOnKill);
            expect(result).greaterThan(0);
        });

        it("should return negative value when player kills 1 PMC, 1 boss and 2 scavs as scav", () =>
        {
            const fenceStanding = 0;
            const postRaidPlayerVictims = [{ Side: "Usec", Role: "sptUsec" }, { Side: "savage", Role: "assault" }, {
                Side: "savage",
                Role: "bossBoar",
            }, { Side: "savage", Role: "assault" }]; // Kills

            const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
            const usecStandingChangeOnKill = databaseServer.getTables().bots.types.bear.experience.standingForKill;
            const scavStandingChangeOnKill = databaseServer.getTables().bots.types.assault.experience.standingForKill;
            const bossBoarStandingChangeOnKill =
                databaseServer.getTables().bots.types.bossboar.experience.standingForKill;

            const result = inraidHelper.calculateFenceStandingChangeFromKills(fenceStanding, postRaidPlayerVictims);
            expect(result).toBe(
                usecStandingChangeOnKill + (scavStandingChangeOnKill * 2) + bossBoarStandingChangeOnKill,
            );
            expect(result).lessThan(0);
        });

        it("should return 0 when player kills bot with undefined standing as scav", () =>
        {
            const fenceStanding = 0;
            const postRaidPlayerVictims = [{ Side: "savage", Role: "testRole" }]; // Kills

            // Fake getFenceStandingChangeForKillAsScav() returning null
            vi.spyOn(inraidHelper, "getFenceStandingChangeForKillAsScav").mockReturnValueOnce(null).mockReturnValueOnce(
                null,
            );
            const result = inraidHelper.calculateFenceStandingChangeFromKills(fenceStanding, postRaidPlayerVictims);
            expect(result).toBe(0);
        });
    });
});
