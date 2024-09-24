import { ExitStatus } from "@spt/models/enums/ExitStatis";
import { IPmcData } from "../common/IPmcData";
import { IItem } from "../common/tables/IItem";

export interface IEndLocalRaidRequestData {
    /** ID of server player just left */
    serverId: string;
    results: IEndRaidResult;
    /** Insured items left in raid by player */
    lostInsuredItems: IItem[];
    /** Items sent via traders to player, keyed to service e.g. BTRTransferStash */
    transferItems: Record<string, IItem[]>;
}

export interface IEndRaidResult {
    profile: IPmcData;
    result: string;
    ExitStatus: ExitStatus;
    killerId: string;
    killerAid: string;
    exitName: string;
    inSession: boolean;
    favorite: boolean;
    playTime: number;
}
