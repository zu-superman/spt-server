import { ItemHelper } from "@spt/helpers/ItemHelper";
import { PaymentHelper } from "@spt/helpers/PaymentHelper";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { TraderHelper } from "@spt/helpers/TraderHelper";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { IItem } from "@spt/models/eft/common/tables/IItem";
import { IQuest, IQuestReward } from "@spt/models/eft/common/tables/IQuest";
import { IHideoutProduction } from "@spt/models/eft/hideout/IHideoutProduction";
import { IItemEventRouterResponse } from "@spt/models/eft/itemEvent/IItemEventRouterResponse";
import { QuestRewardType } from "@spt/models/enums/QuestRewardType";
import { QuestStatus } from "@spt/models/enums/QuestStatus";
import { SkillTypes } from "@spt/models/enums/SkillTypes";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import { EventOutputHolder } from "@spt/routers/EventOutputHolder";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import type { ICloner } from "@spt/utils/cloners/ICloner";
import { inject, injectable } from "tsyringe";

@injectable()
export class QuestRewardHelper {
    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("QuestHelper") protected questHelper: QuestHelper,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("PaymentHelper") protected paymentHelper: PaymentHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("TraderHelper") protected traderHelper: TraderHelper,
        @inject("PrimaryCloner") protected cloner: ICloner,
    ) {}

    /**
     * Give player quest rewards - Skills/exp/trader standing/items/assort unlocks - Returns reward items player earned
     * @param profileData Player profile (scav or pmc)
     * @param questId questId of quest to get rewards for
     * @param state State of the quest to get rewards for
     * @param sessionId Session id
     * @param questResponse Response to send back to client
     * @returns Array of reward objects
     */
    public applyQuestReward(
        profileData: IPmcData,
        questId: string,
        state: QuestStatus,
        sessionId: string,
        questResponse: IItemEventRouterResponse,
    ): IItem[] {
        // Repeatable quest base data is always in PMCProfile, `profileData` may be scav profile
        // TODO: consider moving repeatable quest data to profile-agnostic location
        const fullProfile = this.profileHelper.getFullProfile(sessionId);
        const pmcProfile = fullProfile?.characters.pmc;
        if (!pmcProfile) {
            this.logger.error(`Unable to get pmc profile for: ${sessionId}, no rewards given`);
            return [];
        }

        let questDetails = this.questHelper.getQuestFromDb(questId, pmcProfile);
        if (!questDetails) {
            this.logger.warning(
                this.localisationService.getText("quest-unable_to_find_quest_in_db_no_quest_rewards", questId),
            );

            return [];
        }

        // Check for and apply intel center money bonus if it exists
        const questMoneyRewardBonusMultiplier = this.getQuestMoneyRewardBonusMultiplier(pmcProfile);
        if (questMoneyRewardBonusMultiplier > 0) {
            // Apply additional bonus from hideout skill
            questDetails = this.applyMoneyBoost(questDetails, questMoneyRewardBonusMultiplier, state); // money = money + (money * intelCenterBonus / 100)
        }

        // e.g. 'Success' or 'AvailableForFinish'
        const questStateAsString = QuestStatus[state];
        const gameVersion = pmcProfile.Info.GameVersion;
        for (const reward of <IQuestReward[]>questDetails.rewards[questStateAsString]) {
            // Handle quest reward availability for different game versions, notAvailableInGameEditions currently not used
            if (!this.questHelper.questRewardIsForGameEdition(reward, gameVersion)) {
                continue;
            }

            switch (reward.type) {
                case QuestRewardType.SKILL:
                    this.profileHelper.addSkillPointsToPlayer(
                        profileData,
                        reward.target as SkillTypes,
                        Number(reward.value),
                    );
                    break;
                case QuestRewardType.EXPERIENCE:
                    this.profileHelper.addExperienceToPmc(sessionId, Number.parseInt(<string>reward.value)); // this must occur first as the output object needs to take the modified profile exp value
                    break;
                case QuestRewardType.TRADER_STANDING:
                    this.traderHelper.addStandingToTrader(
                        sessionId,
                        reward.target,
                        Number.parseFloat(<string>reward.value),
                    );
                    break;
                case QuestRewardType.TRADER_UNLOCK:
                    this.traderHelper.setTraderUnlockedState(reward.target, true, sessionId);
                    break;
                case QuestRewardType.ITEM:
                    // Handled by getQuestRewardItems() below
                    break;
                case QuestRewardType.ASSORTMENT_UNLOCK:
                    // Handled by getAssort(), locked assorts are stripped out by `assortHelper.stripLockedLoyaltyAssort()` before being sent to player
                    break;
                case QuestRewardType.ACHIEVEMENT:
                    this.profileHelper.addAchievementToProfile(fullProfile, reward.target);
                    break;
                case QuestRewardType.STASH_ROWS:
                    this.profileHelper.addStashRowsBonusToProfile(sessionId, Number.parseInt(<string>reward.value)); // Add specified stash rows from quest reward - requires client restart
                    break;
                case QuestRewardType.PRODUCTIONS_SCHEME:
                    this.findAndAddHideoutProductionIdToProfile(
                        pmcProfile,
                        reward,
                        questDetails,
                        sessionId,
                        questResponse,
                    );
                    break;
                case QuestRewardType.POCKETS:
                    this.profileHelper.replaceProfilePocketTpl(pmcProfile, reward.target);
                    break;
                case QuestRewardType.CUSTOMIZATION_DIRECT:
                    this.profileHelper.addHideoutCustomisationUnlock(fullProfile, reward, "unlockedInGame");
                    break;
                default:
                    this.logger.error(
                        this.localisationService.getText("quest-reward_type_not_handled", {
                            rewardType: reward.type,
                            questId: questId,
                            questName: questDetails.QuestName,
                        }),
                    );
                    break;
            }
        }

        return this.getQuestRewardItems(questDetails, state, gameVersion);
    }

    /**
     * Get players money reward bonus from profile
     * @param pmcData player profile
     * @returns bonus as a percent
     */
    protected getQuestMoneyRewardBonusMultiplier(pmcData: IPmcData): number {
        // Check player has intel center
        const moneyRewardBonuses = pmcData.Bonuses.filter((profileBonus) => profileBonus.type === "QuestMoneyReward");

        // Get a total of the quest money reward percent bonuses
        const moneyRewardBonusPercent = moneyRewardBonuses.reduce((acc, cur) => acc + cur.value, 0);

        // Calculate hideout management bonus as a percentage (up to 51% bonus)
        const hideoutManagementSkill = this.profileHelper.getSkillFromProfile(pmcData, SkillTypes.HIDEOUT_MANAGEMENT);

        // 5100 becomes 0.51, add 1 to it, 1.51
        // We multiply the money reward bonuses by the hideout management skill multipler, giving the new result
        const hideoutManagementBonusMultipler = hideoutManagementSkill
            ? 1 + hideoutManagementSkill.Progress / 10000
            : 1;

        // e.g 15% * 1.4
        return moneyRewardBonusPercent * hideoutManagementBonusMultipler;
    }

    /**
     * Adjust quest money rewards by passed in multiplier
     * @param quest Quest to multiple money rewards
     * @param bonusPercent Pecent to adjust money rewards by
     * @param questStatus Status of quest to apply money boost to rewards of
     * @returns Updated quest
     */
    public applyMoneyBoost(quest: IQuest, bonusPercent: number, questStatus: QuestStatus): IQuest {
        const rewards: IQuestReward[] = quest.rewards?.[QuestStatus[questStatus]] ?? [];
        const currencyRewards = rewards.filter(
            (reward) => reward.type === "Item" && this.paymentHelper.isMoneyTpl(reward.items[0]._tpl),
        );
        for (const reward of currencyRewards) {
            // Add % bonus to existing StackObjectsCount
            const rewardItem = reward.items[0];
            const newCurrencyAmount = Math.floor(rewardItem.upd.StackObjectsCount * (1 + bonusPercent / 100));
            rewardItem.upd.StackObjectsCount = newCurrencyAmount;
            reward.value = newCurrencyAmount;
        }

        return quest;
    }

    /**
     * WIP - Find hideout craft id and add to unlockedProductionRecipe array in player profile
     * also update client response recipeUnlocked array with craft id
     * @param pmcData Player profile
     * @param craftUnlockReward Reward item from quest with craft unlock details
     * @param questDetails Quest with craft unlock reward
     * @param sessionID Session id
     * @param response Response to send back to client
     */
    protected findAndAddHideoutProductionIdToProfile(
        pmcData: IPmcData,
        craftUnlockReward: IQuestReward,
        questDetails: IQuest,
        sessionID: string,
        response: IItemEventRouterResponse,
    ): void {
        const matchingProductions = this.getRewardProductionMatch(craftUnlockReward, questDetails);
        if (matchingProductions.length !== 1) {
            this.logger.error(
                this.localisationService.getText("quest-unable_to_find_matching_hideout_production", {
                    questName: questDetails.QuestName,
                    matchCount: matchingProductions.length,
                }),
            );

            return;
        }

        // Add above match to pmc profile + client response
        const matchingCraftId = matchingProductions[0]._id;
        pmcData.UnlockedInfo.unlockedProductionRecipe.push(matchingCraftId);
        response.profileChanges[sessionID].recipeUnlocked[matchingCraftId] = true;
    }

    /**
     * Find hideout craft for the specified quest reward
     * @param craftUnlockReward Reward item from quest with craft unlock details
     * @param questDetails Quest with craft unlock reward
     * @returns Hideout craft
     */
    public getRewardProductionMatch(craftUnlockReward: IQuestReward, questDetails: IQuest): IHideoutProduction[] {
        // Get hideout crafts and find those that match by areatype/required level/end product tpl - hope for just one match
        const craftingRecipes = this.databaseService.getHideout().production.recipes;

        // Area that will be used to craft unlocked item
        const desiredHideoutAreaType = Number.parseInt(craftUnlockReward.traderId);

        let matchingProductions = craftingRecipes.filter(
            (prod) =>
                prod.areaType === desiredHideoutAreaType &&
                //prod.requirements.some((requirement) => requirement.questId === questDetails._id) && // BSG dont store the quest id in requirement any more!
                prod.requirements.some((requirement) => requirement.type === "QuestComplete") &&
                prod.requirements.some((requirement) => requirement.requiredLevel === craftUnlockReward.loyaltyLevel) &&
                prod.endProduct === craftUnlockReward.items[0]._tpl,
        );

        // More/less than single match, above filtering wasn't strict enough
        if (matchingProductions.length !== 1) {
            // Multiple matches were found, last ditch attempt to match by questid (value we add manually to production.json via `gen:productionquests` command)
            matchingProductions = matchingProductions.filter((prod) =>
                prod.requirements.some((requirement) => requirement.questId === questDetails._id),
            );
        }

        return matchingProductions;
    }

    /**
     * Gets a flat list of reward items for the given quest at a specific state for the specified game version (e.g. Fail/Success)
     * @param quest quest to get rewards for
     * @param status Quest status that holds the items (Started, Success, Fail)
     * @returns array of items with the correct maxStack
     */
    protected getQuestRewardItems(quest: IQuest, status: QuestStatus, gameVersion: string): IItem[] {
        if (!quest.rewards[QuestStatus[status]]) {
            this.logger.warning(`Unable to find: ${status} reward for quest: ${quest.QuestName}`);
            return [];
        }

        // Iterate over all rewards with the desired status, flatten out items that have a type of Item
        const questRewards = quest.rewards[QuestStatus[status]].flatMap((reward: IQuestReward) =>
            reward.type === "Item" && this.questRewardIsForGameEdition(reward, gameVersion)
                ? this.processReward(reward)
                : [],
        );

        return questRewards;
    }
}
