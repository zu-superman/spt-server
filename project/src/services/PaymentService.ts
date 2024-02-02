import { inject, injectable } from "tsyringe";

import { HandbookHelper } from "@spt-aki/helpers/HandbookHelper";
import { InventoryHelper } from "@spt-aki/helpers/InventoryHelper";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { PaymentHelper } from "@spt-aki/helpers/PaymentHelper";
import { TraderHelper } from "@spt-aki/helpers/TraderHelper";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { IAddItemsDirectRequest } from "@spt-aki/models/eft/inventory/IAddItemsDirectRequest";
import { IItemEventRouterResponse } from "@spt-aki/models/eft/itemEvent/IItemEventRouterResponse";
import { IProcessBuyTradeRequestData } from "@spt-aki/models/eft/trade/IProcessBuyTradeRequestData";
import { IProcessSellTradeRequestData } from "@spt-aki/models/eft/trade/IProcessSellTradeRequestData";
import { BackendErrorCodes } from "@spt-aki/models/enums/BackendErrorCodes";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { LocalisationService } from "@spt-aki/services/LocalisationService";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";

@injectable()
export class PaymentService
{
    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("HandbookHelper") protected handbookHelper: HandbookHelper,
        @inject("TraderHelper") protected traderHelper: TraderHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("InventoryHelper") protected inventoryHelper: InventoryHelper,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("PaymentHelper") protected paymentHelper: PaymentHelper,
    )
    {}

    /**
     * Take money and insert items into return to server request
     * @param {IPmcData} pmcData Player profile
     * @param {IProcessBuyTradeRequestData} request
     * @param {string} sessionID
     * @returns IItemEventRouterResponse
     */
    public payMoney(
        pmcData: IPmcData,
        request: IProcessBuyTradeRequestData,
        sessionID: string,
        output: IItemEventRouterResponse,
    ): IItemEventRouterResponse
    {
        // May need to convert to trader currency
        const trader = this.traderHelper.getTrader(request.tid, sessionID);

        // Track the amounts of each type of currency involved in the trade.
        const currencyAmounts: { [key: string]: number; } = {};

        // Delete barter items and track currencies
        for (const index in request.scheme_items)
        {
            // Find the corresponding item in the player's inventory.
            const item = pmcData.Inventory.items.find((i) => i._id === request.scheme_items[index].id);
            if (item !== undefined)
            {
                if (!this.paymentHelper.isMoneyTpl(item._tpl))
                {
                    // If the item is not money, remove it from the inventory.
                    this.inventoryHelper.removeItem(pmcData, item._id, sessionID, output);
                    request.scheme_items[index].count = 0;
                }
                else
                {
                    // If the item is money, add its count to the currencyAmounts object.
                    currencyAmounts[item._tpl] = (currencyAmounts[item._tpl] || 0) + request.scheme_items[index].count;
                }
            }
            else
            {
                // Used by `SptInsure`
                // Handle differently, `id` is the money type tpl
                const currencyTpl = request.scheme_items[index].id;
                currencyAmounts[currencyTpl] = (currencyAmounts[currencyTpl] || 0) + request.scheme_items[index].count;
            }
        }

        // Track the total amount of all currencies.
        let totalCurrencyAmount = 0;

        // Loop through each type of currency involved in the trade.
        for (const currencyTpl in currencyAmounts)
        {
            const currencyAmount = currencyAmounts[currencyTpl];
            totalCurrencyAmount += currencyAmount;

            if (currencyAmount > 0)
            {
                // Find money stacks in inventory and remove amount needed + update output object to inform client of changes
                this.addPaymentToOutput(pmcData, currencyTpl, currencyAmount, sessionID, output);

                // If there are warnings, exit early.
                if (output.warnings.length > 0)
                {
                    return output;
                }

                // Convert the amount to the trader's currency and update the sales sum.
                const costOfPurchaseInCurrency = this.handbookHelper.fromRUB(
                    this.handbookHelper.inRUB(currencyAmount, currencyTpl),
                    this.paymentHelper.getCurrency(trader.currency),
                );
                pmcData.TradersInfo[request.tid].salesSum += costOfPurchaseInCurrency;
            }
        }

        // If no currency-based payment is involved, handle it separately
        if (totalCurrencyAmount === 0)
        {
            this.logger.debug(this.localisationService.getText("payment-zero_price_no_payment"));

            // Convert the handbook price to the trader's currency and update the sales sum.
            const costOfPurchaseInCurrency = this.handbookHelper.fromRUB(
                this.getTraderItemHandbookPriceRouble(request.item_id, request.tid),
                this.paymentHelper.getCurrency(trader.currency),
            );
            pmcData.TradersInfo[request.tid].salesSum += costOfPurchaseInCurrency;
        }

        this.traderHelper.lvlUp(request.tid, pmcData);

        this.logger.debug("Item(s) taken. Status OK.");
        return output;
    }

    /**
     * Get the item price of a specific traders assort
     * @param traderAssortId Id of assort to look up
     * @param traderId Id of trader with assort
     * @returns Handbook rouble price of item
     */
    protected getTraderItemHandbookPriceRouble(traderAssortId: string, traderId: string): number
    {
        const purchasedAssortItem = this.traderHelper.getTraderAssortItemByAssortId(traderId, traderAssortId);
        if (!purchasedAssortItem)
        {
            return 1;
        }

        const assortItemPriceRouble = this.handbookHelper.getTemplatePrice(purchasedAssortItem._tpl);
        if (!assortItemPriceRouble)
        {
            this.logger.debug(
                `No item price found for ${purchasedAssortItem._tpl} on trader: ${traderId} in assort: ${traderAssortId}`,
            );

            return 1;
        }

        return assortItemPriceRouble;
    }

    /**
     * Receive money back after selling
     * @param {IPmcData} pmcData
     * @param {number} amountToSend
     * @param {IProcessSellTradeRequestData} request
     * @param {IItemEventRouterResponse} output
     * @param {string} sessionID
     * @returns IItemEventRouterResponse
     */
    public giveProfileMoney(
        pmcData: IPmcData,
        amountToSend: number,
        request: IProcessSellTradeRequestData,
        output: IItemEventRouterResponse,
        sessionID: string,
    ): void
    {
        const trader = this.traderHelper.getTrader(request.tid, sessionID);
        const currency = this.paymentHelper.getCurrency(trader.currency);
        let calcAmount = this.handbookHelper.fromRUB(this.handbookHelper.inRUB(amountToSend, currency), currency);
        const currencyMaxStackSize = this.databaseServer.getTables().templates.items[currency]._props.StackMaxSize;
        let skipSendingMoneyToStash = false;

        for (const item of pmcData.Inventory.items)
        {
            // Item is not currency
            if (item._tpl !== currency)
            {
                continue;
            }

            // Item is not in the stash
            if (!this.inventoryHelper.isItemInStash(pmcData, item))
            {
                continue;
            }

            // Found currency item
            if (item.upd.StackObjectsCount < currencyMaxStackSize)
            {
                if (item.upd.StackObjectsCount + calcAmount > currencyMaxStackSize)
                {
                    // calculate difference
                    calcAmount -= currencyMaxStackSize - item.upd.StackObjectsCount;
                    item.upd.StackObjectsCount = currencyMaxStackSize;
                }
                else
                {
                    skipSendingMoneyToStash = true;
                    item.upd.StackObjectsCount = item.upd.StackObjectsCount + calcAmount;
                }

                output.profileChanges[sessionID].items.change.push(item);

                if (skipSendingMoneyToStash)
                {
                    break;
                }
            }
        }

        const rootCurrencyReward = {
            _id: this.hashUtil.generate(),
            _tpl: currency,
            upd: { StackObjectsCount: calcAmount },
        };
        const rewards = this.itemHelper.splitStackIntoSeparateItems(rootCurrencyReward);

        if (!skipSendingMoneyToStash)
        {
            const addItemToStashRequest: IAddItemsDirectRequest = {
                itemsWithModsToAdd: rewards,
                foundInRaid: false,
                callback: null,
                useSortingTable: true,
            };
            this.inventoryHelper.addItemsToStash(sessionID, addItemToStashRequest, pmcData, output);
        }

        // set current sale sum
        const saleSum = pmcData.TradersInfo[request.tid].salesSum + amountToSend;

        pmcData.TradersInfo[request.tid].salesSum = saleSum;
        this.traderHelper.lvlUp(request.tid, pmcData);
    }

    /**
     * Remove currency from player stash/inventory and update client object with changes
     * @param pmcData Player profile to find and remove currency from
     * @param currencyTpl Type of currency to pay
     * @param amountToPay money value to pay
     * @param sessionID Session id
     * @param output output object to send to client
     */
    public addPaymentToOutput(
        pmcData: IPmcData,
        currencyTpl: string,
        amountToPay: number,
        sessionID: string,
        output: IItemEventRouterResponse,
    ): void
    {
        const moneyItemsInInventory = this.getSortedMoneyItemsInInventory(
            pmcData,
            currencyTpl,
            pmcData.Inventory.stash,
        );
        const amountAvailable = moneyItemsInInventory.reduce(
            (accumulator, item) => accumulator + item.upd.StackObjectsCount,
            0,
        );

        // If no money in inventory or amount is not enough we return false
        if (moneyItemsInInventory.length <= 0 || amountAvailable < amountToPay)
        {
            this.logger.error(
                this.localisationService.getText("payment-not_enough_money_to_complete_transation", {
                    amountToPay: amountToPay,
                    amountAvailable: amountAvailable,
                }),
            );
            this.httpResponse.appendErrorToOutput(
                output,
                this.localisationService.getText("payment-not_enough_money_to_complete_transation_short"),
                BackendErrorCodes.UNKNOWN_TRADING_ERROR,
            );

            return;
        }

        let leftToPay = amountToPay;
        for (const profileMoneyItem of moneyItemsInInventory)
        {
            const itemAmount = profileMoneyItem.upd.StackObjectsCount;
            if (leftToPay >= itemAmount)
            {
                leftToPay -= itemAmount;
                this.inventoryHelper.removeItem(pmcData, profileMoneyItem._id, sessionID, output);
            }
            else
            {
                profileMoneyItem.upd.StackObjectsCount -= leftToPay;
                leftToPay = 0;
                output.profileChanges[sessionID].items.change.push(profileMoneyItem);
            }

            if (leftToPay === 0)
            {
                break;
            }
        }
    }

    /**
     * Get all money stacks in inventory and prioritse items in stash
     * @param pmcData
     * @param currencyTpl
     * @param playerStashId Players stash id
     * @returns Sorting money items
     */
    protected getSortedMoneyItemsInInventory(pmcData: IPmcData, currencyTpl: string, playerStashId: string): Item[]
    {
        const moneyItemsInInventory = this.itemHelper.findBarterItems("tpl", pmcData.Inventory.items, currencyTpl);
        if (moneyItemsInInventory?.length === 0)
        {
            this.logger.debug(`No ${currencyTpl} money items found in inventory`);
        }

        // Prioritise items in stash to top of array
        moneyItemsInInventory.sort((a, b) => this.prioritiseStashSort(a, b, pmcData.Inventory.items, playerStashId));

        return moneyItemsInInventory;
    }

    /**
     * Prioritise player stash first over player inventory
     * Post-raid healing would often take money out of the players pockets/secure container
     * @param a First money stack item
     * @param b Second money stack item
     * @param inventoryItems players inventory items
     * @param playerStashId Players stash id
     * @returns sort order
     */
    protected prioritiseStashSort(a: Item, b: Item, inventoryItems: Item[], playerStashId: string): number
    {
        // a in stash, prioritise
        if (a.slotId === "hideout" && b.slotId !== "hideout")
        {
            return -1;
        }

        // b in stash, prioritise
        if (a.slotId !== "hideout" && b.slotId === "hideout")
        {
            return 1;
        }

        // both in containers
        if (a.slotId === "main" && b.slotId === "main")
        {
            // Item is in inventory, not stash, deprioritise
            const aInStash = this.isInStash(a.parentId, inventoryItems, playerStashId);
            const bInStash = this.isInStash(b.parentId, inventoryItems, playerStashId);

            // a in stash, prioritise
            if (aInStash && !bInStash)
            {
                return -1;
            }

            // b in stash, prioritise
            if (!aInStash && bInStash)
            {
                return 1;
            }
        }

        // they match
        return 0;
    }

    /**
     * Recursivly check items parents to see if it is inside the players inventory, not stash
     * @param itemId item id to check
     * @param inventoryItems player inventory
     * @param playerStashId Players stash id
     * @returns true if its in inventory
     */
    protected isInStash(itemId: string, inventoryItems: Item[], playerStashId: string): boolean
    {
        const itemParent = inventoryItems.find((x) => x._id === itemId);

        if (itemParent)
        {
            if (itemParent.slotId === "hideout")
            {
                return true;
            }

            if (itemParent._id === playerStashId)
            {
                return true;
            }

            return this.isInStash(itemParent.parentId, inventoryItems, playerStashId);
        }

        return false;
    }
}
