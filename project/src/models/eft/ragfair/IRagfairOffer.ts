import { Item } from "@spt/models/eft/common/tables/IItem";
import { MemberCategory } from "@spt/models/enums/MemberCategory";

export interface IRagfairOffer
{
    sellResult?: SellResult[]
    _id: string
    items: Item[]
    requirements: OfferRequirement[]
    root: string
    intId: number
    /** Handbook price */
    itemsCost: number
    /** Rouble price */
    requirementsCost: number
    startTime: number
    endTime: number
    sellInOnePiece: boolean
    loyaltyLevel: number
    buyRestrictionMax?: number
    buyRestrictionCurrent?: number
    locked: boolean
    unlimitedCount: boolean
    /** Rouble price */
    summaryCost: number
    user: IRagfairOfferUser
}

export interface OfferRequirement
{
    _tpl: string
    count: number
    onlyFunctional: boolean
}

export interface IRagfairOfferUser
{
    id: string
    nickname?: string
    rating?: number
    memberType: MemberCategory
    selectedMemberCategory?: MemberCategory
    avatar?: string
    isRatingGrowing?: boolean
    aid?: number
}

export interface SellResult
{
    sellTime: number
    amount: number
}
