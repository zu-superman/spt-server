import { inject, injectable } from "tsyringe";

import { DialogueHelper } from "../helpers/DialogueHelper";
import { ItemHelper } from "../helpers/ItemHelper";
import { ProfileHelper } from "../helpers/ProfileHelper";
import { IPmcData } from "../models/eft/common/IPmcData";
import { Item } from "../models/eft/common/tables/IItem";
import { IGetInsuranceCostRequestData } from "../models/eft/insurance/IGetInsuranceCostRequestData";
import {
    IGetInsuranceCostResponseData
} from "../models/eft/insurance/IGetInsuranceCostResponseData";
import { IInsureRequestData } from "../models/eft/insurance/IInsureRequestData";
import { IItemEventRouterResponse } from "../models/eft/itemEvent/IItemEventRouterResponse";
import { Insurance } from "../models/eft/profile/IAkiProfile";
import { IProcessBuyTradeRequestData } from "../models/eft/trade/IProcessBuyTradeRequestData";
import { BaseClasses } from "../models/enums/BaseClasses";
import { ConfigTypes } from "../models/enums/ConfigTypes";
import { IInsuranceConfig } from "../models/spt/config/IInsuranceConfig";
import { ILogger } from "../models/spt/utils/ILogger";
import { EventOutputHolder } from "../routers/EventOutputHolder";
import { ConfigServer } from "../servers/ConfigServer";
import { DatabaseServer } from "../servers/DatabaseServer";
import { SaveServer } from "../servers/SaveServer";
import { InsuranceService } from "../services/InsuranceService";
import { PaymentService } from "../services/PaymentService";
import { RandomUtil } from "../utils/RandomUtil";
import { TimeUtil } from "../utils/TimeUtil";

@injectable()
export class InsuranceController
{
    protected insuranceConfig: IInsuranceConfig;

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("EventOutputHolder") protected eventOutputHolder: EventOutputHolder,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("SaveServer") protected saveServer: SaveServer,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("ProfileHelper") protected profileHelper: ProfileHelper,
        @inject("DialogueHelper") protected dialogueHelper: DialogueHelper,
        @inject("PaymentService") protected paymentService: PaymentService,
        @inject("InsuranceService") protected insuranceService: InsuranceService,
        @inject("ConfigServer") protected configServer: ConfigServer
    )
    {
        this.insuranceConfig = this.configServer.getConfig(ConfigTypes.INSURANCE);
    }

    /**
     * Process insurance items prior to being given to player in mail
     */
    public processReturn(): void
    {
        const time = this.timeUtil.getTimestamp();

        // Process each profile in turn
        for (const sessionID in this.saveServer.getProfiles())
        {
            const insuranceDetails = this.saveServer.getProfile(sessionID).insurance;
            let insuredItemCount = insuranceDetails.length;

            // Skip profile with no insurance items
            if (insuredItemCount === 0)
            {
                continue;
            }

            // Use count as array index
            while (insuredItemCount-- > 0)
            {
                const insured = insuranceDetails[insuredItemCount];

                // Return time not reached, skip
                if (time < insured.scheduledTime)
                {
                    continue;
                }

                // Items to be removed from inventory
                const toDelete: string[] = [];

                // Loop over insurance items, find items to delete from player inventory
                for (const insuredItem of insured.items)
                {
                    if (this.itemShouldBeLost(insuredItem, insured.traderId, toDelete))
                    {
                        // Skip if not an item
                        const itemDbDetails = this.itemHelper.getItem(insuredItem._tpl);
                        if (!itemDbDetails[0])
                        {
                            continue;
                        }

                        // Is a mod and can't be edited in-raid
                        if (insuredItem.slotId !== "hideout" && !itemDbDetails[1]._props.RaidModdable)
                        {
                            continue;
                        }

                        // Remove item and its sub-items to prevent orphans
                        toDelete.push(...this.itemHelper.findAndReturnChildrenByItems(insured.items, insuredItem._id));
                    }
                }
                
                this.reparentItemsInsideRigs(insured);

                for (let index = insured.items.length - 1; index >= 0; --index)
                {
                    if (toDelete.includes(insured.items[index]._id))
                    {
                        insured.items.splice(index, 1);
                    }
                }

                // No items to return as they all failed the above check, adjust insurance mail template
                if (insured.items.length === 0)
                {
                    const insuranceFailedTemplates = this.databaseServer.getTables().traders[insured.traderId].dialogue.insuranceFailed;
                    insured.messageContent.templateId = this.randomUtil.getArrayValue(insuranceFailedTemplates);
                }

                this.dialogueHelper.addDialogueMessage(insured.traderId, insured.messageContent, sessionID, insured.items);

                // Remove insurance package from profile now we've processed it
                insuranceDetails.splice(insuredItemCount, 1);
            }

            this.saveServer.getProfile(sessionID).insurance = insuranceDetails;
        }
    }

    /**
     * Reparent children inside rigs to be a root item
     * @param insured Insured Items
     */
    protected reparentItemsInsideRigs(insured: Insurance): void
    {
        for (const itemCheck of insured.items) 
        {
            const confirmedItem = this.itemHelper.isOfBaseclass(itemCheck._tpl, BaseClasses.VEST);
            if (confirmedItem) 
            {
                const itemWithChildren = this.itemHelper.findAndReturnChildrenByItems(insured.items, itemCheck._id);

                for (const item of insured.items) 
                {
                    // Skips root item only want its children
                    if (item._id === itemCheck._id) 
                    {
                        continue;
                    }
                    
                    if (itemWithChildren.includes(item._id)) 
                    {
                        item.slotId = "hideout";
                        delete item.location;
                        item.parentId = itemCheck.parentId;
                    }
                }
            }
        }
    }

    /**
     * Should the passed in item be removed from player inventory
     * @param insuredItem Insurued item to roll to lose
     * @param traderId Trader the item was insured by
     * @param itemsBeingDeleted All items to remove from player
     * @returns True if item should be removed
     */
    protected itemShouldBeLost(insuredItem: Item, traderId: string, itemsBeingDeleted: string[]): boolean
    {
        // Roll from 0 to 9999, then divide it by 100: 9999 =  99.99%
        const returnChance = this.randomUtil.getInt(0, 9999) / 100;
        const traderReturnChance = this.insuranceConfig.returnChancePercent[traderId];

        const slotIdsThatCanFail = this.insuranceConfig.slotIdsWithChanceOfNotReturning;
        return (slotIdsThatCanFail.includes(insuredItem.slotId)) && returnChance >= traderReturnChance && !itemsBeingDeleted.includes(insuredItem._id);
    }

    /**
     * Handle Insure event
     * Add insurance to an item
     * @param pmcData Player profile
     * @param body Insurance request
     * @param sessionID Session id
     * @returns IItemEventRouterResponse object to send to client
     */
    public insure(pmcData: IPmcData, body: IInsureRequestData, sessionID: string): IItemEventRouterResponse
    {
        let output = this.eventOutputHolder.getOutput(sessionID);
        const itemsToPay = [];
        const inventoryItemsHash = {};

        for (const item of pmcData.Inventory.items)
        {
            inventoryItemsHash[item._id] = item;
        }

        // get the price of all items
        for (const key of body.items)
        {
            itemsToPay.push({
                id: inventoryItemsHash[key]._id,
                count: Math.round(this.insuranceService.getPremium(pmcData, inventoryItemsHash[key], body.tid))
            });
        }

        const options: IProcessBuyTradeRequestData = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            scheme_items: itemsToPay,
            tid: body.tid,
            Action: "",
            type: "",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            item_id: "",
            count: 0,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            scheme_id: 0
        };

        // pay for the item insurance
        output = this.paymentService.payMoney(pmcData, options, sessionID, output);
        if (output.warnings.length > 0)
        {
            return output;
        }

        // add items to InsuredItems list once money has been paid
        for (const key of body.items)
        {
            pmcData.InsuredItems.push({
                tid: body.tid,
                itemId: inventoryItemsHash[key]._id
            });
        }

        return output;
    }

    /**
     * Handle client/insurance/items/list/cost
     * Calculate insurance cost
     * @param request request object
     * @param sessionID session id
     * @returns IGetInsuranceCostResponseData object to send to client
     */
    public cost(request: IGetInsuranceCostRequestData, sessionID: string): IGetInsuranceCostResponseData
    {
        const output: IGetInsuranceCostResponseData = {};
        const pmcData = this.profileHelper.getPmcProfile(sessionID);
        const inventoryItemsHash: Record<string, Item> = {};

        for (const item of pmcData.Inventory.items)
        {
            inventoryItemsHash[item._id] = item;
        }

        // Loop over each trader in request
        for (const trader of request.traders)
        {
            const items: Record<string, number> = {};

            for (const itemId of request.items)
            {
                // Ensure hash has item in it
                if (!inventoryItemsHash[itemId])
                {
                    this.logger.debug(`Item with id: ${itemId} missing from player inventory, skipping`);
                    continue;
                }
                items[inventoryItemsHash[itemId]._tpl] = Math.round(this.insuranceService.getPremium(pmcData, inventoryItemsHash[itemId], trader));
            }

            output[trader] = items;
        }

        return output;
    }
}
