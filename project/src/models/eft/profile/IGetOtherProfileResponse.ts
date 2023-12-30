
import { Customization, Inventory, Skills, Stats } from "@spt-aki/models/eft/common/tables/IBotBase"
import { Info } from "types/models/eft/common/tables/IBotBase"

export interface IGetOtherProfileResponse
{
    id: string
    aid: number
    info: Info
    customization: Customization
    skills: Skills
    equipment: Inventory
    achievements: Record<string, number>
    favoriteItems: string[]
    pmcStats: Stats
    scavStats: Stats
}