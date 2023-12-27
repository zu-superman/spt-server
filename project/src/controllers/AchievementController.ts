import { inject, injectable } from "tsyringe";

import { IGetAchievementsResponse } from "@spt-aki/models/eft/profile/IGetAchievementsResponse";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

/**
 * Logic for handling In Raid callbacks
 */
@injectable()
export class AchievementController
{

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
    )
    {}

    /**
     * Get base achievements
     * @param sessionID Session id
     */
    public getAchievements(sessionID: string): IGetAchievementsResponse
    {
        return {elements: this.databaseServer.getTables().templates.achievements };
    }
}
