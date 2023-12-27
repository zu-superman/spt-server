import { AchievementController } from "@spt-aki/controllers/AchievementController";
import { ProfileController } from "@spt-aki/controllers/ProfileController";
import { IEmptyRequestData } from "@spt-aki/models/eft/common/IEmptyRequestData";
import { IAchievement } from "@spt-aki/models/eft/common/tables/IAchievement";
import { IGetBodyResponseData } from "@spt-aki/models/eft/httpResponse/IGetBodyResponseData";
import { ICompletedAchievementsResponse } from "@spt-aki/models/eft/profile/ICompletedAchievementsResponse";
import { IGetAchievementsResponse } from "@spt-aki/models/eft/profile/IGetAchievementsResponse";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class AchievementCallbacks
{
    constructor(
        @inject("AchievementController") protected achievementController: AchievementController,
        @inject("ProfileController") protected profileController: ProfileController,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
    )
    {}

    /**
     * Handle client/achievement/list
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getAchievements(url: string, info: IEmptyRequestData, sessionID: string): IGetBodyResponseData<IGetAchievementsResponse>
    {

        return this.httpResponse.getBody(this.achievementController.getAchievements(sessionID));
    }

    /**
     * Handle client/achievement/statistic
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public statistic(url: string, info: IEmptyRequestData, sessionID: string): IGetBodyResponseData<ICompletedAchievementsResponse>
    {
        return this.httpResponse.getBody(this.profileController.getCompletedAchievements(sessionID));
    }
}