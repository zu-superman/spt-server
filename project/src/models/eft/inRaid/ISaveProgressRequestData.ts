import { PlayerRaidEndState } from "../../../models/enums/PlayerRaidEndState";
import { IPostRaidPmcData } from "../common/IPmcData";
import { ISyncHealthRequestData } from "../health/ISyncHealthRequestData";
import { IInsuredItemsData } from "./IInsuredItemsData";

export interface ISaveProgressRequestData 
{
    exit: PlayerRaidEndState // survived" | "killed" | "left" | "runner" | "missinginaction
    profile: IPostRaidPmcData
    isPlayerScav: boolean
    health: ISyncHealthRequestData
    insurance: IInsuredItemsData[]
}