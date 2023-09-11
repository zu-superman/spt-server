import { Spawnpoint } from "../../../models/eft/common/ILooseLoot";
import { IBaseConfig } from "./IBaseConfig";

export interface ILootConfig extends IBaseConfig
{
    kind: "aki-loot"
    /** Spawn positions to add into a map, key=mapid */
    looseLoot: Record<string, Spawnpoint[]>
}