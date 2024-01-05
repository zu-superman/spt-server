import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { QuestRewardType } from "@spt-aki/models/enums/QuestRewardType";
import { QuestStatus } from "@spt-aki/models/enums/QuestStatus";
import { QuestTypeEnum } from "@spt-aki/models/enums/QuestTypeEnum";

export interface IQuest
{
    /** SPT addition - human readable quest name */
    QuestName?: string;
    _id: string;
    canShowNotificationsInGame: boolean;
    conditions: IQuestConditions;
    description: string;
    failMessageText: string;
    name: string;
    note: string;
    traderId: string;
    location: string;
    image: string;
    type: QuestTypeEnum;
    isKey: boolean;
    /** @deprecated - Likely not used, use 'status' instead */
    questStatus: QuestStatus;
    restartable: boolean;
    instantComplete: boolean;
    secretQuest: boolean;
    startedMessageText: string;
    successMessageText: string;
    templateId: string;
    rewards: IRewards;
    /** Becomes 'AppearStatus' inside client */
    status: string | number;
    KeyQuest: boolean;
    changeQuestMessageText: string;
    /** "Pmc" or "Scav" */
    side: string;
    /** Status of quest to player */
    sptStatus?: QuestStatus;
}

export interface IQuestConditions
{
    Started: AvailableForConditions[];
    AvailableForFinish: AvailableForConditions[];
    AvailableForStart: AvailableForConditions[];
    Success: AvailableForConditions[];
    Fail: AvailableForConditions[];
}

export interface AvailableForConditions
{
    id: string;
    index: number;
    parentId: string;
    isEncoded: boolean;
    dynamicLocale: boolean;
    value?: string | number;
    compareMethod?: string;
    visibilityConditions?: VisibilityCondition[];
    target?: string | string[]; // TODO: split each availableForX object into each type: FindItem, HandoverItem, Level, Quest, TraderLoyalty etc
    status?: QuestStatus[];
    availableAfter?: number;
    dispersion?: number;
    onlyFoundInRaid?: boolean;
    oneSessionOnly?: boolean;
    doNotResetIfCounterCompleted?: boolean;
    dogtagLevel?: number;
    maxDurability?: number;
    minDurability?: number;
    counter?: AvailableForCounter;
    plantTime?: number;
    zoneId?: string;
    type?: boolean;
    countInRaid?: boolean;
    globalQuestCounterId?: string;
    completeInSeconds?: number
    conditionType?: string
}

export interface AvailableForCounter
{
    id: string;
    conditions: CounterCondition[];
}

export interface CounterCondition
{
    id: string;
    completeInSeconds: number
    dynamicLocale: boolean
    energy?: IValueCompare
    hydration?: IValueCompare
    time?: IValueCompare
    target: string[] | string; // TODO: some objects have an array and some are just strings, thanks bsg very cool
    compareMethod?: string;
    value?: string;
    weapon?: string[];
    distance: ICounterConditionDistance
    equipmentInclusive?: string[][];
    weaponModsInclusive?: string[][];
    weaponModsExclusive?: string[][];
    enemyEquipmentInclusive?: string[][];
    enemyEquipmentExclusive?: string[][];
    weaponCaliber?: string[]
    savageRole: string[]
    status?: string[];
    bodyPart?: string[];
    daytime?: IDaytimeCounter;
    conditionType?: string
    enemyHealthEffects?: IEnemyHealthEffect[]
    resetOnSessionEnd?: boolean
}

export interface IEnemyHealthEffect
{
    bodyParts: string[]
    effects: string[]
}

export interface IValueCompare
{
    compareMethod: string
    value: number
}

export interface ICounterConditionDistance
{
    value: number
    compareMethod: string
}

export interface IDaytimeCounter
{
    from: number;
    to: number;
}

export interface VisibilityCondition
{
    id: string;
    value: number;
    dynamicLocale: boolean;
    oneSessionOnly: boolean;
}

export interface IRewards
{
    AvailableForStart: Reward[];
    AvailableForFinish: Reward[];
    Started: Reward[];
    Success: Reward[];
    Fail: Reward[];
    FailRestartable: Reward[];
    Expired: Reward[];
}

export interface Reward extends Item
{
    value?: string | number;
    id: string;
    type: QuestRewardType;
    index: number;
    target?: string;
    items?: Item[];
    loyaltyLevel?: number;
    traderId?: string;
    unknown?: boolean;
    findInRaid?: boolean;
}
