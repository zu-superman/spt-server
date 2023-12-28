import { BuildController } from "@spt-aki/controllers/BuildController";
import { ISetMagazineRequest } from "@spt-aki/models/eft/builds/ISetMagazineRequest";
import { IEmptyRequestData } from "@spt-aki/models/eft/common/IEmptyRequestData";
import { IGetBodyResponseData } from "@spt-aki/models/eft/httpResponse/IGetBodyResponseData";
import { IUserBuilds } from "@spt-aki/models/eft/profile/IAkiProfile";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class BuildsCallbacks
{
    constructor(
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("BuildController") protected buildController: BuildController,
    )
    {}

    /**
     * Handle client/builds/list
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getBuilds(url: string, info: IEmptyRequestData, sessionID: string): IGetBodyResponseData<IUserBuilds>
    {
        return this.httpResponse.getBody(this.buildController.getUserBuilds(sessionID));
    }

    /**
     * Handle client/builds/magazine/save
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public createMagazineTemplate(url: string, request: ISetMagazineRequest, sessionID: string): IGetBodyResponseData<string>
    {
        this.buildController.createMagazineTemplate(sessionID, request)

        return this.httpResponse.emptyResponse();
    }

    /**
     * Handle client/builds/weapon/save
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setWeapon(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        // this.httpResponse.getBody(this.buildController.saveWeaponBuild(sessionID, info));
    }

    /**
     * Handle client/builds/equipment/save
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setEquipment(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }

    /**
     * Handle client/builds/delete
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public deleteBuild(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }
}
