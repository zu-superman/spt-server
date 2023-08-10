import { IPmcData } from "../../eft/common/IPmcData";
import { IGetBodyResponseData } from "../../eft/httpResponse/IGetBodyResponseData";
import { IItemEventRouterResponse } from "../../eft/itemEvent/IItemEventRouterResponse";
import { IPresetBuildActionRequestData } from "../../eft/presetBuild/IPresetBuildActionRequestData";
import { IWeaponBuild } from "../../eft/profile/IAkiProfile";

export interface IPresetBuildCallbacks
{
    getHandbookUserlist(url: string, info: any, sessionID: string): IGetBodyResponseData<IWeaponBuild[]>;
    saveBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string): IItemEventRouterResponse;
    removeBuild(pmcData: IPmcData, body: IPresetBuildActionRequestData, sessionID: string): IItemEventRouterResponse;
}
