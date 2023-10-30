/* eslint-disable @typescript-eslint/naming-convention */
import "reflect-metadata";
import { container } from "tsyringe";
import { vi, beforeAll, afterEach, describe, expect, it } from "vitest";

import { PaymentService } from "@spt-aki/services/PaymentService";

import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IProcessBuyTradeRequestData } from "@spt-aki/models/eft/trade/IProcessBuyTradeRequestData";
import { IItemEventRouterResponse } from "@spt-aki/models/eft/itemEvent/IItemEventRouterResponse";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { ITraderBase } from "@spt-aki/models/eft/common/tables/ITrader";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";

describe("PaymentService", () =>
{
    let paymentService: PaymentService;

    beforeAll(() =>
    {
        paymentService = container.resolve<PaymentService>("PaymentService");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
    });

    describe("payMoney", () =>
    {
        it("should output a currency change when a single non-barter item is purchased from a trader", () =>
        {
            const hashUtil = container.resolve<HashUtil>("HashUtil");

            const traderId = "54cb57776803fa99248b456e"; // Therapist
            const purchaseItemId = hashUtil.generate(); // Inconsequential ID
            const purchaseQuantity = 1; // The amount of the items that the player is purchasing.
            const costItemId = hashUtil.generate(); // Inconsequential ID
            const costItemTpl = "5449016a4bdc2d6f028b456f"; // Roubles
            const costAmount = 17896; // The amount of roubles that the item costs.

            // Object representing a money item.
            const moneyItem = {
                _id: costItemId,
                _tpl: costItemTpl,
                upd: {
                    StackObjectsCount: costAmount * 4 // More than enough.
                }
            } as Item;

            // Object representing the player's PMC inventory.
            const pmcData = {
                TradersInfo: {
                    [traderId]: {
                        salesSum: 0,
                        unlocked: true,
                        disabled: false
                    }
                },
                Inventory: {
                    items: [moneyItem]
                }
            } as unknown as IPmcData;

            // Buy a factory map from Therapist... although it doesn't really matter what the item is as there's no
            // template ID provided in the request data, just the ID.
            const processBuyTradeRequestData = {
                Action: "TradingConfirm",
                type: "buy_from_trader",
                tid: traderId,
                item_id: purchaseItemId,
                count: purchaseQuantity,
                scheme_id: 0,
                scheme_items: [
                    {
                        id: costItemId,
                        count: costAmount
                    }
                ]
            } as IProcessBuyTradeRequestData;

            // Inconsequential profile ID
            const sessionID = hashUtil.generate();

            const itemEventRouterResponse = {
                warnings: [],
                profileChanges: {
                    sessionID: {
                        _id: sessionID,
                        items: {
                            new: [],
                            change: [],
                            del: []
                        }
                    }
                }
            } as unknown as IItemEventRouterResponse;

            // Mock the logger debug method to return void.
            vi.spyOn((paymentService as any).logger, "debug").mockImplementation(() =>
            {});

            // Mock the trader helper to return a trader with the currency of Roubles.
            const traderHelperGetTraderSpy = vi.spyOn((paymentService as any).traderHelper, "getTrader").mockReturnValue({
                tid: traderId,
                currency: "RUB"
            } as unknown as ITraderBase);

            // Mock the addPaymentToOutput method to subtract the item cost from the money stack.
            const addPaymentToOutputSpy = vi.spyOn((paymentService as any), "addPaymentToOutput").mockImplementation(() =>
            {
                moneyItem.upd.StackObjectsCount -= costAmount;
                return {
                    warnings: [],
                    profileChanges: {
                        [sessionID]: {
                            items: {
                                change: [moneyItem]
                            }
                        }
                    }
                };
            });

            // Mock the traderHelper lvlUp method to return void.
            const traderHelperLvlUpSpy = vi.spyOn((paymentService as any).traderHelper, "lvlUp").mockImplementation(() =>
            {});

            const output = paymentService.payMoney(pmcData, processBuyTradeRequestData, sessionID, itemEventRouterResponse);

            // Check for absence of output warnings.
            expect(output.warnings).toHaveLength(0);

            // Check that the currency change was correctly handled.
            expect(output.profileChanges[sessionID].items.change).toHaveLength(1);
            expect(output.profileChanges[sessionID].items.change[0]._id).toBe(costItemId);
            expect(output.profileChanges[sessionID].items.change[0]._tpl).toBe(costItemTpl);
            expect(output.profileChanges[sessionID].items.change[0].upd.StackObjectsCount).toBe(costAmount * 3);

            // Check if mocked methods were called as expected.
            expect(traderHelperGetTraderSpy).toBeCalledTimes(1);
            expect(addPaymentToOutputSpy).toBeCalledWith(expect.anything(), costItemTpl, costAmount, sessionID, expect.anything());
            expect(traderHelperLvlUpSpy).toBeCalledTimes(1);
        });
    });
});
