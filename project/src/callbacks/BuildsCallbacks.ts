import { IEmptyRequestData } from "@spt-aki/models/eft/common/IEmptyRequestData";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class BuildsCallbacks
{
    constructor(
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
    )
    {}

    /**
     * Handle client/builds/list
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getBuilds(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }

    /**
     * Handle client/builds/magazine/save
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setMagazine(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }

    /**
     * Handle client/builds/weapon/save
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setWeapon(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }

    /**
     * Handle client/builds/equipment/save
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setEquipment(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }

    /**
     * Handle client/builds/delete
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public deleteBuild(url: string, info: IEmptyRequestData, sessionID: string): any
    {
        throw new Error("Not implemented");
    }
}