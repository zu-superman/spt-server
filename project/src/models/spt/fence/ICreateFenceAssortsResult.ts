import { Item } from "@spt/models/eft/common/tables/IItem";
import { IBarterScheme } from "@spt/models/eft/common/tables/ITrader";

export interface ICreateFenceAssortsResult
{
    sptItems: Item[][]
    // eslint-disable-next-line @typescript-eslint/naming-convention
    barter_scheme: Record<string, IBarterScheme[][]>
    // eslint-disable-next-line @typescript-eslint/naming-convention
    loyal_level_items: Record<string, number>
}
