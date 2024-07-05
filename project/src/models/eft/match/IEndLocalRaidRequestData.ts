import { ExitStatus } from "@spt/models/enums/ExitStatis";
import { IPmcData } from "../common/IPmcData";
import { Item } from "../common/tables/IItem";

export interface IEndLocalRaidRequestData
{
    serverId: string
    result: IEndRaidResult
    lostInsuredItems: Item[]
    transferItems: Record<string, Item[]>
}

export interface IEndRaidResult
{
    profile: IPmcData
    ExitStatus: ExitStatus
    killerId: string
    killerAid: string
    exitName: string
    inSession: boolean
    favorite: boolean
    playTime: number
}
