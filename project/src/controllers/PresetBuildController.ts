import { inject, injectable } from "tsyringe";

import { ItemHelper } from "../helpers/ItemHelper";
import { IPmcData } from "../models/eft/common/IPmcData";
import { IItemEventRouterResponse } from "../models/eft/itemEvent/IItemEventRouterResponse";
import {
    IPresetBuildActionRequestData
} from "../models/eft/presetBuild/IPresetBuildActionRequestData";
import { IRemoveBuildRequestData } from "../models/eft/presetBuild/IRemoveBuildRequestData";
import { IUserBuilds } from "../models/eft/profile/IAkiProfile";
import { EventOutputHolder } from "../routers/EventOutputHolder";
import { DatabaseServer } from "../servers/DatabaseServer";
import { SaveServer } from "../servers/SaveServer";
import { HashUtil } from "../utils/HashUtil";
import { JsonUtil } from "../utils/JsonUtil";

@injectable()
export class PresetBuildController
{
    constructor(
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("SaveServer") protected saveServer: SaveServer
    )
    { }

    /** Handle client/handbook/builds/my/list */
    public getUserBuilds(sessionID: string): IUserBuilds
    {
        const profile = this.saveServer.getProfile(sessionID);
        if (!profile.userbuilds)
        {
            profile.userbuilds = {
                equipmentBuilds: [],
                weaponBuilds: []
            };
        }

        // Clone data from profile and append the defaults onto end, then return
        const result = this.jsonUtil.clone(profile.userbuilds);
        result.equipmentBuilds.push(...this.databaseServer.getTables().templates.defaultEquipmentPresets);

        return result;
    }

    /** Handle SaveWeaponBuild event */
    public saveWeaponBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string): IItemEventRouterResponse
    {
        return this.saveBuild(pmcData, body, sessionID, "weaponBuilds");
    }

    /** Handle SaveEquipmentBuild event */
    public saveEquipmentBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string): IItemEventRouterResponse
    {
        return this.saveBuild(pmcData, body, sessionID, "equipmentBuilds");
    }

    protected saveBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string, buildType: string): IItemEventRouterResponse
    {
        const output = this.eventOutputHolder.getOutput(sessionID);
        const existingSavedBuilds: any[] = this.saveServer.getProfile(sessionID).userbuilds[buildType];

        // replace duplicate ID's. The first item is the base item.
        // The root ID and the base item ID need to match.
        body.items = this.itemHelper.replaceIDs(pmcData, body.items);

        const newBuild = {
            id: this.hashUtil.generate(),
            name: body.name,
            buildType: "Custom",
            root: body.root,
            fastPanel: [],
            items: body.items
        };

        const existingBuild = existingSavedBuilds.find(x => x.name === body.name);
        if (existingBuild)
        {
            // Already exists, replace
            this.saveServer.getProfile(sessionID).userbuilds[buildType].splice(existingSavedBuilds.indexOf(existingBuild), 1, newBuild);
        }
        else
        {
            // Fresh, add new
            this.saveServer.getProfile(sessionID).userbuilds[buildType].push(newBuild);
        }

        output.profileChanges[sessionID][buildType].push(newBuild);

        return output;
    }

    /** Handle RemoveWeaponBuild event*/
    public removeBuild(pmcData: IPmcData, body: IRemoveBuildRequestData, sessionID: string): IItemEventRouterResponse
    {
        return this.removePlayerBuild(pmcData, body.id, sessionID, "equipmentBuilds");
    }

    /** Handle RemoveWeaponBuild event*/
    public removeWeaponBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string): IItemEventRouterResponse
    {
        return this.removePlayerBuild(pmcData, body.id, sessionID, "weaponBuilds");
    }

    /** Handle RemoveEquipmentBuild event*/
    public removeEquipmentBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string): IItemEventRouterResponse
    {
        return this.removePlayerBuild(pmcData, body.id, sessionID, "equipmentBuilds");
    }
    
    protected removePlayerBuild(pmcData: IPmcData, id: string, sessionID: string, buildType: string): IItemEventRouterResponse
    {
        const savedBuilds: any[] = this.saveServer.getProfile(sessionID).userbuilds[buildType];

        const matchingBuild = savedBuilds.find(x => x.id === id);
        if (matchingBuild)
        {
            savedBuilds.splice(savedBuilds.indexOf(matchingBuild), 1);
            this.saveServer.getProfile(sessionID).userbuilds[buildType] = savedBuilds;
        }

        return this.eventOutputHolder.getOutput(sessionID);
    }
}