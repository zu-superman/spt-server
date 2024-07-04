import { ExitStatus } from "@spt/models/enums/ExitStatis";
import { IPmcData } from "../common/IPmcData";

export interface IEndLocalRaidRequestData
{
    serverId: string
    result: IEndRaidResult
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
