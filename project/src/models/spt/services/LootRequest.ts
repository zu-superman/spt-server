import { MinMax } from "@spt/models/common/MinMax";
import { AirdropTypeEnum } from "@spt/models/enums/AirdropType";

export interface LootRequest
{
    airdropLoot?: AirdropTypeEnum
    weaponPresetCount: MinMax
    armorPresetCount: MinMax
    itemCount: MinMax
    weaponCrateCount: MinMax
    itemBlacklist: string[]
    itemTypeWhitelist: string[]
    /** key: item base type: value: max count */
    itemLimits: Record<string, number>
    itemStackLimits: Record<string, MinMax>
    armorLevelWhitelist: number[]
    allowBossItems: boolean
    useRewarditemBlacklist?: boolean
}
