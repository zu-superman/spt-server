import { IEmptyRequestData } from "@spt-aki/models/eft/common/IEmptyRequestData";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class AchievementCallbacks
{
    constructor(
       // @inject("AchievementController") protected botController: AchievementController,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
    )
    {}

    /**
     * Handle client/achievement/list
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getAchievements(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        
        throw new Error("Not implemented");
    }

    /**
     * Handle client/achievement/statistic
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public statistic(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }
}