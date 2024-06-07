import { inject, injectable } from "tsyringe";
import { RepeatableQuestGenerator } from "@spt/generators/RepeatableQuestGenerator";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";
import { QuestHelper } from "@spt/helpers/QuestHelper";
import { RepeatableQuestHelper } from "@spt/helpers/RepeatableQuestHelper";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import {
    IChangeRequirement,
    IPmcDataRepeatableQuest,
    IRepeatableQuest,
} from "@spt/models/eft/common/tables/IRepeatableQuests";
import { IItemEventRouterResponse } from "@spt/models/eft/itemEvent/IItemEventRouterResponse";
import { IRepeatableQuestChangeRequest } from "@spt/models/eft/quests/IRepeatableQuestChangeRequest";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ELocationName } from "@spt/models/enums/ELocationName";
import { HideoutAreas } from "@spt/models/enums/HideoutAreas";
import { QuestStatus } from "@spt/models/enums/QuestStatus";
import { SkillTypes } from "@spt/models/enums/SkillTypes";
import { IQuestConfig, IRepeatableQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { IQuestTypePool } from "@spt/models/spt/repeatable/IQuestTypePool";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { EventOutputHolder } from "@spt/routers/EventOutputHolder";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { PaymentService } from "@spt/services/PaymentService";
import { ProfileFixerService } from "@spt/services/ProfileFixerService";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { ObjectId } from "@spt/utils/ObjectId";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { TimeUtil } from "@spt/utils/TimeUtil";

@injectable()
export class RepeatableQuestController
{
    protected questConfig: IQuestConfig;

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("ProfileFixerService") protected profileFixerService: ProfileFixerService,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("PaymentService") protected paymentService: PaymentService,
        @inject("ObjectId") protected objectId: ObjectId,
        @inject("RepeatableQuestGenerator") protected repeatableQuestGenerator: RepeatableQuestGenerator,
        @inject("RepeatableQuestHelper") protected repeatableQuestHelper: RepeatableQuestHelper,
        @inject("QuestHelper") protected questHelper: QuestHelper,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("PrimaryCloner") protected cloner: ICloner,
    )
    {
        this.questConfig = this.configServer.getConfig(ConfigTypes.QUEST);
    }

    /**
     * Handle client/repeatalbeQuests/activityPeriods
     * Returns an array of objects in the format of repeatable quests to the client.
     * repeatableQuestObject = {
     *  id: Unique Id,
     *  name: "Daily",
     *  endTime: the time when the quests expire
     *  activeQuests: currently available quests in an array. Each element of quest type format (see assets/database/templates/repeatableQuests.json).
     *  inactiveQuests: the quests which were previously active (required by client to fail them if they are not completed)
     * }
     *
     * The method checks if the player level requirement for repeatable quests (e.g. daily lvl5, weekly lvl15) is met and if the previously active quests
     * are still valid. This ischecked by endTime persisted in profile accordning to the resetTime configured for each repeatable kind (daily, weekly)
     * in QuestCondig.js
     *
     * If the condition is met, new repeatableQuests are created, old quests (which are persisted in the profile.RepeatableQuests[i].activeQuests) are
     * moved to profile.RepeatableQuests[i].inactiveQuests. This memory is required to get rid of old repeatable quest data in the profile, otherwise
     * they'll litter the profile's Quests field.
     * (if the are on "Succeed" but not "Completed" we keep them, to allow the player to complete them and get the rewards)
     * The new quests generated are again persisted in profile.RepeatableQuests
     *
     * @param   {string}    sessionID   Player's session id
     *
     * @returns  {array}                Array of "repeatableQuestObjects" as described above
     */
    public getClientRepeatableQuests(sessionID: string): IPmcDataRepeatableQuest[]
    {
        const returnData: Array<IPmcDataRepeatableQuest> = [];
        const fullProfile = this.profileHelper.getFullProfile(sessionID)!;
        const pmcData = fullProfile.characters.pmc;
        const currentTime = this.timeUtil.getTimestamp();

        // Daily / weekly / Daily_Savage
        for (const repeatableConfig of this.questConfig.repeatableQuests)
        {
            // Get daily/weekly data from profile, add empty object if missing
            const currentRepeatableQuestType = this.getRepeatableQuestSubTypeFromProfile(repeatableConfig, pmcData);
            const repeatableType = repeatableConfig.name.toLowerCase();

            const canAccessRepeatables = this.canProfileAccessRepeatableQuests(repeatableConfig, pmcData);
            if (!canAccessRepeatables)
            {
                continue;
            }

            // Daily sub-type still has time left being active, skip
            if (currentTime < currentRepeatableQuestType.endTime - 1)
            {
                this.logger.debug(`[Quest Check] ${repeatableType} quests are still valid.`);

                continue;
            }

            // Current time is past expiry time

            // Adjust endtime to be now + new duration
            currentRepeatableQuestType.endTime = currentTime + repeatableConfig.resetTime;
            currentRepeatableQuestType.inactiveQuests = [];
            this.logger.debug(`Generating new ${repeatableType}`);

            // Put old quests to inactive (this is required since only then the client makes them fail due to non-completion)
            // we also need to push them to the "inactiveQuests" list since we need to remove them from offraidData.profile.Quests
            // after a raid (the client seems to keep quests internally and we want to get rid of old repeatable quests)
            // and remove them from the PMC's Quests and RepeatableQuests[i].activeQuests
            const questsToKeep = [];
            // for (let i = 0; i < currentRepeatable.activeQuests.length; i++)
            for (const activeQuest of currentRepeatableQuestType.activeQuests)
            {
                // Keep finished quests in list so player can hand in
                const quest = pmcData.Quests.find((quest) => quest.qid === activeQuest._id);
                if (quest)
                {
                    if (quest.status === QuestStatus.AvailableForFinish)
                    {
                        questsToKeep.push(activeQuest);
                        this.logger.debug(
                            `Keeping repeatable quest ${activeQuest._id} in activeQuests since it is available to hand in`,
                        );

                        continue;
                    }
                }
                this.profileFixerService.removeDanglingConditionCounters(pmcData);

                // Remove expired quest from pmc.quest array
                pmcData.Quests = pmcData.Quests.filter((quest) => quest.qid !== activeQuest._id);
                currentRepeatableQuestType.inactiveQuests.push(activeQuest);
            }
            currentRepeatableQuestType.activeQuests = questsToKeep;

            // introduce a dynamic quest pool to avoid duplicates
            const questTypePool = this.generateQuestPool(repeatableConfig, pmcData.Info.Level);

            // Add daily quests
            for (let i = 0; i < this.getQuestCount(repeatableConfig, pmcData); i++)
            {
                let quest: IRepeatableQuest | undefined = undefined;
                let lifeline = 0;
                while (!quest && questTypePool.types.length > 0)
                {
                    quest = this.repeatableQuestGenerator.generateRepeatableQuest(
                        pmcData.Info.Level,
                        pmcData.TradersInfo,
                        questTypePool,
                        repeatableConfig,
                    );
                    lifeline++;
                    if (lifeline > 10)
                    {
                        this.logger.debug(
                            "We were stuck in repeatable quest generation. This should never happen. Please report",
                        );
                        break;
                    }
                }

                // check if there are no more quest types available
                if (questTypePool.types.length === 0)
                {
                    break;
                }
                quest.side = repeatableConfig.side;
                currentRepeatableQuestType.activeQuests.push(quest);
            }

            // Reset players free quest count for this repeatable sub-type
            if (!fullProfile.spt.freeRepeatableChangeCount)
            {
                fullProfile.spt.freeRepeatableChangeCount = {};
            }
            fullProfile.spt.freeRepeatableChangeCount[repeatableType] = repeatableConfig.freeChanges;

            // Create stupid redundant change requirements from quest data
            for (const quest of currentRepeatableQuestType.activeQuests)
            {
                currentRepeatableQuestType.changeRequirement[quest._id] = {
                    changeCost: quest.changeCost,
                    changeStandingCost: this.randomUtil.getArrayValue([0, 0.01]), // Randomise standing cost to replace
                };
            }

            returnData.push({
                id: repeatableConfig.id,
                name: currentRepeatableQuestType.name,
                endTime: currentRepeatableQuestType.endTime,
                activeQuests: currentRepeatableQuestType.activeQuests,
                inactiveQuests: currentRepeatableQuestType.inactiveQuests,
                changeRequirement: currentRepeatableQuestType.changeRequirement,
                freeChanges: currentRepeatableQuestType.freeChanges,
                freeChangesAvailable: fullProfile.spt.freeRepeatableChangeCount[repeatableType],
            });
        }

        return returnData;
    }

    /**
     * Check if a repeatable quest type (daily/weekly) is active for the given profile
     * @param repeatableConfig Repeatable quest config
     * @param pmcData Player profile
     * @returns True if profile is allowed to access dailies
     */
    protected canProfileAccessRepeatableQuests(repeatableConfig: IRepeatableQuestConfig, pmcData: IPmcData): boolean
    {
        // PMC and daily quests not unlocked yet
        if (repeatableConfig.side === "Pmc" && !this.playerHasDailyPmcQuestsUnlocked(pmcData, repeatableConfig))
        {
            return false;
        }

        // Scav and daily quests not unlocked yet
        if (repeatableConfig.side === "Scav" && !this.playerHasDailyScavQuestsUnlocked(pmcData))
        {
            return false;
        }

        return true;
    }

    /**
     * Does player have daily scav quests unlocked
     * @param pmcData Player profile to check
     * @returns True if unlocked
     */
    protected playerHasDailyScavQuestsUnlocked(pmcData: IPmcData): boolean
    {
        return pmcData?.Hideout?.Areas
            ?.find((hideoutArea) => hideoutArea.type === HideoutAreas.INTEL_CENTER)
            ?.level >= 1;
    }

    /**
     * Does player have daily pmc quests unlocked
     * @param pmcData Player profile to check
     * @param repeatableConfig Config of daily type to check
     * @returns True if unlocked
     */
    protected playerHasDailyPmcQuestsUnlocked(pmcData: IPmcData, repeatableConfig: IRepeatableQuestConfig): boolean
    {
        return pmcData.Info.Level >= repeatableConfig.minPlayerLevel;
    }

    /**
     * Get the number of quests to generate - takes into account charisma state of player
     * @param repeatableConfig Config
     * @param pmcData Player profile
     * @returns Quest count
     */
    protected getQuestCount(repeatableConfig: IRepeatableQuestConfig, pmcData: IPmcData): number
    {
        if (
            repeatableConfig.name.toLowerCase() === "daily"
            && this.profileHelper.hasEliteSkillLevel(SkillTypes.CHARISMA, pmcData)
        )
        {
            // Elite charisma skill gives extra daily quest(s)
            return (
                repeatableConfig.numQuests
                + this.databaseService.getGlobals().config.SkillsSettings.Charisma.BonusSettings.EliteBonusSettings
                    .RepeatableQuestExtraCount
            );
        }

        return repeatableConfig.numQuests;
    }

    /**
     * Get repeatable quest data from profile from name (daily/weekly), creates base repeatable quest object if none exists
     * @param repeatableConfig daily/weekly config
     * @param pmcData Profile to search
     * @returns IPmcDataRepeatableQuest
     */
    protected getRepeatableQuestSubTypeFromProfile(
        repeatableConfig: IRepeatableQuestConfig,
        pmcData: IPmcData,
    ): IPmcDataRepeatableQuest
    {
        // Get from profile, add if missing
        let repeatableQuestDetails = pmcData.RepeatableQuests.find((x) => x.name === repeatableConfig.name);
        if (!repeatableQuestDetails)
        {
            repeatableQuestDetails = {
                id: repeatableConfig.id,
                name: repeatableConfig.name,
                activeQuests: [],
                inactiveQuests: [],
                endTime: 0,
                changeRequirement: {},
                freeChanges: 0,
                freeChangesAvailable: 0,
            };

            // Add base object that holds repeatable data to profile
            pmcData.RepeatableQuests.push(repeatableQuestDetails);
        }

        return repeatableQuestDetails;
    }

    /**
     * Just for debug reasons. Draws dailies a random assort of dailies extracted from dumps
     */
    public generateDebugDailies(dailiesPool: any, factory: any, number: number): any
    {
        let randomQuests = [];
        let numberOfQuests = number;

        if (factory)
        {
            // First is factory extract always add for debugging
            randomQuests.push(dailiesPool[0]);
            numberOfQuests -= 1;
        }

        randomQuests = randomQuests.concat(this.randomUtil.drawRandomFromList(dailiesPool, numberOfQuests, false));

        for (const element of randomQuests)
        {
            element._id = this.objectId.generate();
            const conditions = element.conditions.AvailableForFinish;
            for (const condition of conditions)
            {
                if ("counter" in condition._props)
                {
                    condition._props.counter.id = this.objectId.generate();
                }
            }
        }
        return randomQuests;
    }

    /**
     * Used to create a quest pool during each cycle of repeatable quest generation. The pool will be subsequently
     * narrowed down during quest generation to avoid duplicate quests. Like duplicate extractions or elimination quests
     * where you have to e.g. kill scavs in same locations.
     * @param repeatableConfig main repeatable quest config
     * @param pmcLevel level of pmc generating quest pool
     * @returns IQuestTypePool
     */
    protected generateQuestPool(repeatableConfig: IRepeatableQuestConfig, pmcLevel: number): IQuestTypePool
    {
        const questPool = this.createBaseQuestPool(repeatableConfig);

        // Get the allowed locations based on the PMC's level
        const locations = this.getAllowedLocationsForPmcLevel(repeatableConfig.locations, pmcLevel);

        // Populate Exploration and Pickup quest locations
        for (const location in locations)
        {
            if (location !== ELocationName.ANY)
            {
                questPool.pool.Exploration.locations[location] = locations[location];
                questPool.pool.Pickup.locations[location] = locations[location];
            }
        }

        // Add "any" to pickup quest pool
        questPool.pool.Pickup.locations.any = ["any"];

        const eliminationConfig = this.repeatableQuestHelper.getEliminationConfigByPmcLevel(pmcLevel, repeatableConfig);
        const targetsConfig = this.repeatableQuestHelper.probabilityObjectArray(eliminationConfig.targets);

        // Populate Elimination quest targets and their locations
        for (const { data: target, key: targetKey } of targetsConfig)
        {
            // Target is boss
            if (target.isBoss)
            {
                questPool.pool.Elimination.targets[targetKey] = { locations: ["any"] };
            }
            else
            {
                // Non-boss targets
                const possibleLocations = Object.keys(locations);

                const allowedLocations = (targetKey === "Savage")
                    ? possibleLocations.filter((location) => location !== "laboratory") // Exclude labs for Savage targets.
                    : possibleLocations;

                questPool.pool.Elimination.targets[targetKey] = { locations: allowedLocations };
            }
        }

        return questPool;
    }

    protected createBaseQuestPool(repeatableConfig: IRepeatableQuestConfig): IQuestTypePool
    {
        return {
            types: repeatableConfig.types.slice(),
            pool: { Exploration: { locations: {} }, Elimination: { targets: {} }, Pickup: { locations: {} } },
        };
    }

    /**
     * Return the locations this PMC is allowed to get daily quests for based on their level
     * @param locations The original list of locations
     * @param pmcLevel The players level
     * @returns A filtered list of locations that allow the player PMC level to access it
     */
    protected getAllowedLocationsForPmcLevel(
        locations: Record<ELocationName, string[]>,
        pmcLevel: number,
    ): Partial<Record<ELocationName, string[]>>
    {
        const allowedLocation: Partial<Record<ELocationName, string[]>> = {};

        for (const location in locations)
        {
            const locationNames = [];
            for (const locationName of locations[location])
            {
                if (this.isPmcLevelAllowedOnLocation(locationName, pmcLevel))
                {
                    locationNames.push(locationName);
                }
            }

            if (locationNames.length > 0)
            {
                allowedLocation[location] = locationNames;
            }
        }

        return allowedLocation;
    }

    /**
     * Return true if the given pmcLevel is allowed on the given location
     * @param location The location name to check
     * @param pmcLevel The level of the pmc
     * @returns True if the given pmc level is allowed to access the given location
     */
    protected isPmcLevelAllowedOnLocation(location: string, pmcLevel: number): boolean
    {
        // All PMC levels are allowed for 'any' location requirement
        if (location === ELocationName.ANY)
        {
            return true;
        }

        const locationBase = this.databaseService.getLocation(location.toLowerCase())?.base;
        if (!locationBase)
        {
            return true;
        }

        return pmcLevel <= locationBase.RequiredPlayerLevelMax && pmcLevel >= locationBase.RequiredPlayerLevelMin;
    }

    public debugLogRepeatableQuestIds(pmcData: IPmcData): void
    {
        for (const repeatable of pmcData.RepeatableQuests)
        {
            const activeQuestsIds = [];
            const inactiveQuestsIds = [];
            for (const active of repeatable.activeQuests)
            {
                activeQuestsIds.push(active._id);
            }

            for (const inactive of repeatable.inactiveQuests)
            {
                inactiveQuestsIds.push(inactive._id);
            }

            this.logger.debug(`${repeatable.name} activeIds ${activeQuestsIds}`);
            this.logger.debug(`${repeatable.name} inactiveIds ${inactiveQuestsIds}`);
        }
    }

    /**
     * Handle RepeatableQuestChange event
     *
     * Replace a players repeatable quest
     * @param pmcData Player profile
     * @param changeRequest Request object
     * @param sessionID Session id
     * @returns IItemEventRouterResponse
     */
    public changeRepeatableQuest(
        pmcData: IPmcData,
        changeRequest: IRepeatableQuestChangeRequest,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        const output = this.eventOutputHolder.getOutput(sessionID);

        const fullProfile = this.profileHelper.getFullProfile(sessionID);

        let repeatableToChange: IPmcDataRepeatableQuest;
        let changeRequirement: IChangeRequirement;

        // The trader existing quest is linked to
        let replacedQuestTraderId: string;

        // Daily, weekly or scav repeatable type
        for (const currentRepeatablePool of pmcData.RepeatableQuests)
        {
            // Check for existing quest in (daily/weekly/scav arrays)
            const questToReplace = currentRepeatablePool.activeQuests.find((x) => x._id === changeRequest.qid);
            if (!questToReplace)
            {
                // Not found, skip to next repeatable sub-type
                continue;
            }

            // Save for later standing loss calculation
            replacedQuestTraderId = questToReplace.traderId;

            // Update active quests to exclude the quest we're replacing
            currentRepeatablePool.activeQuests = currentRepeatablePool.activeQuests
                .filter((quest) => quest._id !== changeRequest.qid);

            // Get cost to replace existing quest
            changeRequirement = this.cloner.clone(currentRepeatablePool.changeRequirement[changeRequest.qid]);
            delete currentRepeatablePool.changeRequirement[changeRequest.qid];
            // TODO: somehow we need to reduce the questPool by the currently active quests (for all repeatables)

            const repeatableConfig = this.questConfig.repeatableQuests
                .find((config) => config.name === currentRepeatablePool.name,
                );
            const questTypePool = this.generateQuestPool(repeatableConfig, pmcData.Info.Level);
            const newRepeatableQuest = this.attemptToGenerateRepeatableQuest(pmcData, questTypePool, repeatableConfig);
            if (newRepeatableQuest)
            {
                // Add newly generated quest to daily/weekly/scav type array
                newRepeatableQuest.side = repeatableConfig.side;
                currentRepeatablePool.activeQuests.push(newRepeatableQuest);
                currentRepeatablePool.changeRequirement[newRepeatableQuest._id] = {
                    changeCost: newRepeatableQuest.changeCost,
                    changeStandingCost: this.randomUtil.getArrayValue([0, 0.01]),
                };

                // Find quest we're replacing in pmc profile quests array and remove it
                this.questHelper.findAndRemoveQuestFromArrayIfExists(questToReplace._id, pmcData.Quests);

                // Find quest we're replacing in scav profile quests array and remove it
                this.questHelper.findAndRemoveQuestFromArrayIfExists(
                    questToReplace._id,
                    fullProfile.characters.scav?.Quests ?? [],
                );
            }

            // Found and replaced the quest in current repeatable
            repeatableToChange = this.cloner.clone(currentRepeatablePool);
            delete repeatableToChange.inactiveQuests;

            // Decrement free reset value in profile, dont let drop below 0
            fullProfile.spt.freeRepeatableChangeCount[currentRepeatablePool.name.toLowerCase()]
                = Math.max(0, fullProfile.spt.freeRepeatableChangeCount[currentRepeatablePool.name.toLowerCase()] - 1);

            break;
        }

        if (!repeatableToChange)
        {
            // Unable to find quest being replaced
            const message = this.localisationService.getText("quest-unable_to_find_repeatable_to_replace");
            this.logger.error(message);

            return this.httpResponse.appendErrorToOutput(output, message);
        }

        // Charge player money for replacing quest
        for (const cost of changeRequirement.changeCost)
        {
            this.paymentService.addPaymentToOutput(pmcData, cost.templateId, cost.count, sessionID, output);
            if (output.warnings.length > 0)
            {
                return output;
            }
        }

        // Reduce standing with trader for not doing their quest
        const droppedQuestTrader = pmcData.TradersInfo[replacedQuestTraderId];
        droppedQuestTrader.standing -= changeRequirement.changeStandingCost;

        // Update client output with new repeatable
        if (!output.profileChanges[sessionID].repeatableQuests)
        {
            output.profileChanges[sessionID].repeatableQuests = [];
        }
        output.profileChanges[sessionID].repeatableQuests.push(repeatableToChange);

        return output;
    }

    protected attemptToGenerateRepeatableQuest(
        pmcData: IPmcData,
        questTypePool: IQuestTypePool,
        repeatableConfig: IRepeatableQuestConfig,
    ): IRepeatableQuest
    {
        const maxAttempts = 10;
        let newRepeatableQuest: IRepeatableQuest = undefined;
        let attempts = 0;
        while (attempts < maxAttempts
          && questTypePool.types.length > 0)
        {
            newRepeatableQuest = this.repeatableQuestGenerator.generateRepeatableQuest(
                pmcData.Info.Level,
                pmcData.TradersInfo,
                questTypePool,
                repeatableConfig,
            );

            if (newRepeatableQuest)
            {
                // Successfully generated a quest, exit loop
                break;
            }

            attempts++;
        }

        if (attempts > maxAttempts)
        {
            this.logger.debug(
                "We were stuck in repeatable quest generation. This should never happen. Please report",
            );
        }

        return newRepeatableQuest;
    }
}
