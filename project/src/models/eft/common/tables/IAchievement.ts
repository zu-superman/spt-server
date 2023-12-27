import { IQuestConditions, IRewards } from "./IQuest"

export interface IAchievement
{
    id: string
    imageUrl: string
    assetPath: string
    rewards: IRewards
    conditions: IQuestConditions
    instantComplete: boolean
    showNotificationsInGame: boolean
    showProgress: boolean
    prefab: string
    rarity: string
    hidden: boolean
    showConditions: boolean
    progressBarEnabled: boolean
    side: string
    index: number
}