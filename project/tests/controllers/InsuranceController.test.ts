import "reflect-metadata";
import { container } from "tsyringe";
import { vi, beforeAll, afterEach, describe, expect, it } from "vitest";

import { InsuranceController } from "@spt-aki/controllers/InsuranceController";

import { MessageType } from "@spt-aki/models/enums/MessageType";
import { TraderHelper } from "@spt-aki/helpers/TraderHelper";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";

describe("InsuranceController", () =>
{
    let insuranceController: any; // Using "any" to access private/protected methods without type errors.

    beforeAll(() =>
    {
        insuranceController = container.resolve<InsuranceController>("InsuranceController");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
    });

    describe("processReturn", () =>
    {
        /*
        it("should process return for all profiles", () =>
        {
            const session1 = "session1";
            const session2 = "session2";
            const profiles = {
                [session1]: {},
                [session2]: {}
            };
            const getProfilesSpy = vi.spyOn(insuranceController.saveServer, "getProfiles").mockReturnValue(profiles);
            const processReturnByProfileSpy = vi.spyOn(insuranceController, "processReturnByProfile");

            // Execute the method.
            insuranceController.processReturn();

            // Should make a call to get all of the profiles.
            expect(getProfilesSpy).toHaveBeenCalledTimes(1);

            // Should process each returned profile.
            expect(processReturnByProfileSpy).toHaveBeenCalledTimes(2);
            expect(processReturnByProfileSpy).toHaveBeenCalledWith(session1);
            expect(processReturnByProfileSpy).toHaveBeenCalledWith(session2);
        });
        */

        it("should not attempt to process profiles if no profiles exist", () =>
        {
            vi.spyOn(insuranceController.saveServer, "getProfiles").mockReturnValue({});
            const processReturnByProfileSpy = vi.spyOn(insuranceController, "processReturnByProfile");

            // Execute the method.
            insuranceController.processReturn();

            // Should not process any profiles.
            expect(processReturnByProfileSpy).toHaveBeenCalledTimes(0);
        });
    });

    describe("findItemsToDelete", () =>
    {
        it("should handle an empty insured object", () =>
        {
            const insured = { items: [] };
            const result = insuranceController.findItemsToDelete(insured);
            expect(result.size).toBe(0);
        });

        it("should handle only regular items", () =>
        {
            const mockProcessRegularItems = vi.fn((insured, toDelete) =>
            {
                toDelete.add("item1");
                toDelete.add("item2");
            });
            const mockProcessAttachments = vi.fn();

            // Spy and replace the real methods with mocks
            const mockIsAttachmentAttached = vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockReturnValue(false);
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);
            vi.spyOn(insuranceController, "processAttachments").mockImplementation(mockProcessAttachments);

            // Create the insured object with only regular items
            const insured = {
                traderId: "some-trader-id",
                items: [
                    { _id: "item1", parentId: null },
                    { _id: "item2", parentId: null },
                    { _id: "item3", parentId: null }
                ]
            };

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called and that the result is correct.
            expect(mockIsAttachmentAttached).toHaveBeenCalledTimes(4); // Once to see if any attachments are present, once for each item.
            expect(mockProcessRegularItems).toHaveBeenCalledWith(insured, expect.any(Set));
            expect(mockProcessAttachments).not.toHaveBeenCalled();
            expect(result.size).toBe(2);
            expect(result).toEqual(new Set(["item1", "item2"]));
        });

        it("should handle only attachments", () =>
        {
            // Mock helper methods to simulate only attachments being present.
            const mockPopulateItemsMap = vi.fn().mockReturnValue(new Map([
                ["attach1", { _id: "attach1", parentId: "item1" }],
                ["attach2", { _id: "attach2", parentId: "item2" }]
            ]));
            const mockPopulateParentAttachmentsMap = vi.fn().mockReturnValue(new Map([
                ["item1", [{ _id: "attach1", parentId: "item1" }]],
                ["item2", [{ _id: "attach2", parentId: "item2" }]]
            ]));
            const mockProcessRegularItems = vi.fn();
            const mockProcessAttachments = vi.fn((parentAttachmentsMap, itemsMap, traderId, toDelete) =>
            {
                toDelete.add("attach1");
                toDelete.add("attach2");
            });

            // Spy and replace the real methods with mocks.
            vi.spyOn(insuranceController, "populateItemsMap").mockImplementation(mockPopulateItemsMap);
            vi.spyOn(insuranceController, "populateParentAttachmentsMap").mockImplementation(mockPopulateParentAttachmentsMap);
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);
            vi.spyOn(insuranceController, "processAttachments").mockImplementation(mockProcessAttachments);

            // Create the insured object with only attachments.
            const insured = {
                traderId: "some-trader-id",
                items: [
                    { _id: "attach1", parentId: "item1" },
                    { _id: "attach2", parentId: "item2" }
                ]
            };

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called and that the result is correct.
            expect(mockPopulateItemsMap).toHaveBeenCalledWith(insured);
            expect(mockPopulateParentAttachmentsMap).toHaveBeenCalledWith(insured, expect.any(Map));
            expect(mockProcessRegularItems).not.toHaveBeenCalled();
            expect(mockProcessAttachments).toHaveBeenCalledWith(expect.any(Map), expect.any(Map), insured.traderId, expect.any(Set));
            expect(result.size).toBe(2);
            expect(result).toEqual(new Set(["attach1", "attach2"]));
        });

        it("should handle a mix of regular items and attachments", () =>
        {
            // Mock helper methods to simulate only attachments being present.
            const mockPopulateItemsMap = vi.fn().mockReturnValue(new Map([
                ["itemId1", { _id: "itemId1", parentId: null }], // Parent
                ["itemId2", { _id: "itemId2", parentId: "itemId1" }] // Attachment
            ]));
            const mockPopulateParentAttachmentsMap = vi.fn().mockReturnValue(new Map([
                ["itemId1", [{ _id: "itemId2", parentId: "itemId1" }]]
            ]));
            const mockIsAttachmentAttached = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
            const mockProcessRegularItems = vi.fn();
            const mockProcessAttachments = vi.fn((parentAttachmentsMap, itemsMap, traderId, toDelete) =>
            {
                toDelete.add("itemId2");
            });

            // Spy and replace the real methods with mocks.
            vi.spyOn(insuranceController, "populateItemsMap").mockImplementation(mockPopulateItemsMap);
            vi.spyOn(insuranceController, "populateParentAttachmentsMap").mockImplementation(mockPopulateParentAttachmentsMap);
            vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockImplementation(mockIsAttachmentAttached);
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);
            vi.spyOn(insuranceController, "processAttachments").mockImplementation(mockProcessAttachments);

            const insured = {
                traderId: "some-trader",
                items: [
                    { _id: "itemId1", parentId: null },
                    { _id: "itemId2", parentId: "itemId1" }
                ]
            };

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called and that the result is correct.
            expect(mockPopulateItemsMap).toHaveBeenCalledWith(insured);
            expect(mockPopulateParentAttachmentsMap).toHaveBeenCalledWith(insured, expect.any(Map));
            expect(mockIsAttachmentAttached).toHaveBeenCalledTimes(1);
            expect(mockProcessRegularItems).toHaveBeenCalledTimes(1);
            expect(mockProcessAttachments).toHaveBeenCalledTimes(1);
            expect(result.size).toBe(1);
            expect(result).toEqual(new Set(["itemId2"]));
        });

        it("should return an empty set if no items are to be deleted", () =>
        {
            const mockIsAttachmentAttached = vi.fn().mockReturnValue(false);
            vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockImplementation(mockIsAttachmentAttached);

            const insured = {
                traderId: "some-trader",
                items: [] // No items
            };

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the result is an empty set.
            expect(result.size).toBe(0);
            expect(result).toEqual(new Set());
        });

        it("should return a set of items to be deleted", () =>
        {
            const mockIsAttachmentAttached = vi.fn().mockReturnValue(false);
            const mockProcessRegularItems = vi.fn((insured, toDelete) =>
            {
                toDelete.add("itemId1");
            });

            vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockImplementation(mockIsAttachmentAttached);
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);

            const insured = {
                traderId: "some-trader",
                items: [
                    { _id: "itemId1", parentId: null }
                ]
            };

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the result is a set containing the item.
            expect(result.size).toBe(1);
            expect(result).toEqual(new Set(["itemId1"]));
        });

        it("should log the number of items to be deleted", () =>
        {
            const mockIsAttachmentAttached = vi.fn().mockReturnValue(false);
            const mockProcessRegularItems = vi.fn((insured, toDelete) =>
            {
                toDelete.add("itemId1").add("itemId2").add("itemId3").add("itemId4");
            });

            vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockImplementation(mockIsAttachmentAttached);
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);
            const loggerDebugSpy = vi.spyOn(insuranceController.logger, "debug");

            const insured = {
                traderId: "some-trader",
                items: [
                    { _id: "itemId1", parentId: null },
                    { _id: "itemId2", parentId: null },
                    { _id: "itemId3", parentId: null },
                    { _id: "itemId4", parentId: null },
                    { _id: "itemId5", parentId: null }
                ]
            };

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the result is a set containing the item.
            expect(result.size).toBe(4);
            expect(loggerDebugSpy).toBeCalledWith("Marked 4 items for deletion from insurance.");
        });
    });

    describe("populateParentAttachmentsMap", () =>
    {
        it("should correctly populate main parent to attachments map", () =>
        {
            const insured = {
                items: [
                    { _id: "gun", parentId: null, _tpl: "gun_tpl" },
                    { _id: "scope", parentId: "gun", _tpl: "scope_tpl" },
                    { _id: "muzzle", parentId: "gun", _tpl: "muzzle_tpl" }
                ]
            };

            const itemsMap = new Map<string, Item>([
                ["gun", { _id: "gun", parentId: null, _tpl: "gun_tpl" }],
                ["scope", { _id: "scope", parentId: "gun", _tpl: "scope_tpl" }],
                ["muzzle", { _id: "muzzle", parentId: "gun", _tpl: "muzzle_tpl" }]
            ]);

            const isAttachmentAttachedSpy = vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockImplementation((item: Item) =>
            {
                return item.parentId !== null;
            });

            const isRaidModdableSpy = vi.spyOn(insuranceController.itemHelper, "isRaidModdable").mockReturnValue(true);
            const getAttachmentMainParentSpy = vi.spyOn(insuranceController.itemHelper, "getAttachmentMainParent").mockImplementation((itemId: string, map: Map<string, Item>) =>
            {
                return map.get("gun");
            });

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that helper methods are called correctly.
            expect(isAttachmentAttachedSpy).toHaveBeenCalledTimes(3);
            expect(isRaidModdableSpy).toHaveBeenCalledTimes(2);
            expect(getAttachmentMainParentSpy).toHaveBeenCalledTimes(2);

            // Verify that the map is populated correctly.
            expect(result.size).toBe(1);
            expect(result.get("gun").length).toBe(2);
            expect(result.get("gun")[0]._id).toBe("scope");
            expect(result.get("gun")[1]._id).toBe("muzzle");
        });

        it("should not map items that don't have a parent", () =>
        {
            const insured = {
                items: [
                    { _id: "item1", parentId: null },
                    { _id: "item2", parentId: null }
                ]
            };
            const itemsMap = new Map();
            itemsMap.set("item1", insured.items[0]);
            itemsMap.set("item2", insured.items[1]);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that no items are mapped.
            expect(result.size).toBe(0);
        });

        it("should ignore non-raid-moddable items", () =>
        {
            const insured = {
                items: [
                    { _id: "item1", parentId: "parent1" },
                    { _id: "item2", parentId: "parent1" }
                ]
            };
            const itemsMap = new Map();
            itemsMap.set("item1", insured.items[0]);
            itemsMap.set("item2", insured.items[1]);

            // Mock isRaidModdable to return false
            vi.spyOn(insuranceController.itemHelper, "isRaidModdable").mockReturnValue(false);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that no items are mapped.
            expect(result.size).toBe(0);
        });

        it("should skip attachments where main parent can't be found", () =>
        {
            const insured = {
                items: [
                    { _id: "item1", parentId: "parent1" },
                    { _id: "item2", parentId: "parent1" }
                ]
            };
            const itemsMap = new Map();
            itemsMap.set("item1", insured.items[0]);
            itemsMap.set("item2", insured.items[1]);

            // Mock getAttachmentMainParent to return null.
            vi.spyOn(insuranceController.itemHelper, "getAttachmentMainParent").mockReturnValue(null);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that no items are mapped.
            expect(result.size).toBe(0);
        });

        it("should correctly handle multiple main parents", () =>
        {
            const insured = {
                items: [
                    { _id: "item1", parentId: "parent1" },
                    { _id: "item2", parentId: "parent1" },
                    { _id: "item3", parentId: "parent2" },
                    { _id: "item4", parentId: "parent2" }
                ]
            };
            const itemsMap = new Map();
            itemsMap.set("item1", insured.items[0]);
            itemsMap.set("item2", insured.items[1]);
            itemsMap.set("item3", insured.items[2]);
            itemsMap.set("item4", insured.items[3]);

            // Mock to make all items raid moddable.
            vi.spyOn(insuranceController.itemHelper, "isRaidModdable").mockReturnValue(true);

            // Mock to make all items attached.
            vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockReturnValue(true);

            // Mock getAttachmentMainParent to return a corresponding parent for each item.
            vi.spyOn(insuranceController.itemHelper, "getAttachmentMainParent").mockImplementation((itemId) =>
            {
                return itemsMap.get(itemId).parentId === "parent1" ? { _id: "parent1" } : { _id: "parent2" };
            });

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that both main parents ("parent1" and "parent2") are mapped correctly.
            expect(result.size).toBe(2);
            expect(result.get("parent1")).toEqual([{ _id: "item1", parentId: "parent1" }, { _id: "item2", parentId: "parent1" }]);
            expect(result.get("parent2")).toEqual([{ _id: "item3", parentId: "parent2" }, { _id: "item4", parentId: "parent2" }]);
        });
    });

    describe("processRegularItems", () =>
    {
        it("should correctly process regular items and their children", () =>
        {
            const insured: { traderId: string, items: unknown } = {
                traderId: "some-trader-id",
                items: [
                    { _id: "item1", parentId: null },
                    { _id: "item2", parentId: "item1" },
                    { _id: "item3", parentId: null },
                    { _id: "item4", parentId: "item3" }
                ] as Item[]
            };
            const toDelete = new Set<string>();

            // Mock helper methods and rollForDelete.
            const isAttachmentAttachedSpy = vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockImplementation((item: Item) =>
            {
                return item.parentId !== null;
            });
            const findAndReturnChildrenAsItemsSpy = vi.spyOn(insuranceController.itemHelper, "findAndReturnChildrenAsItems").mockImplementation((items: Item[], parentId: string) =>
            {
                return items.filter(item => item.parentId === parentId);
            });
            const rollForDeleteSpy = vi.spyOn(insuranceController, "rollForDelete").mockReturnValue(true);

            // Execute the method.
            insuranceController.processRegularItems(insured, toDelete);

            // Verify behavior.
            expect(isAttachmentAttachedSpy).toHaveBeenCalledTimes(6); // Once for each item, one more for each item with a null parentId.
            expect(findAndReturnChildrenAsItemsSpy).toHaveBeenCalledTimes(2);  // Called only for item1 and item3
            expect(rollForDeleteSpy).toHaveBeenCalledTimes(2);  // Called only for item1 and item3
            expect(toDelete).toEqual(new Set(["item1", "item2", "item3", "item4"]));  // All items should be marked for deletion
        });
    });

    describe("processAttachments", () =>
    {
        it("should process each set of attachments by their parent items and log parent names", () =>
        {
            const attachments1 = [
                { _id: "attach1", _tpl: "tpl1" },
                { _id: "attach2", _tpl: "tpl2" }
            ];
            const attachments2 = [
                { _id: "attach3", _tpl: "tpl3" },
                { _id: "attach4", _tpl: "tpl4" }
            ];
            const parent1 = { _id: "parent1", _tpl: "parentTpl1" };
            const parent2 = { _id: "parent2", _tpl: "parentTpl2" };
            const traderId = "some-trader-id";
            const toDelete = new Set<string>();

            // Mock helper methods.
            const processAttachmentByParentSpy = vi.spyOn(insuranceController, "processAttachmentByParent").mockImplementation(() =>
            {});
            const itemHelperGetItemNameSpy = vi.spyOn(insuranceController.itemHelper, "getItemName").mockImplementation((_tpl) => _tpl);

            // Create maps.
            const mainParentToAttachmentsMap = new Map<string, any>();
            mainParentToAttachmentsMap.set(parent1._id, attachments1);
            mainParentToAttachmentsMap.set(parent2._id, attachments2);

            const itemsMap = new Map<string, any>();
            itemsMap.set(parent1._id, parent1);
            itemsMap.set(parent2._id, parent2);

            // Execute the method.
            insuranceController.processAttachments(mainParentToAttachmentsMap, itemsMap, traderId, toDelete);

            // Verify that helper methods are called correctly.
            expect(processAttachmentByParentSpy).toHaveBeenCalledTimes(2);
            expect(processAttachmentByParentSpy).toHaveBeenCalledWith(attachments1, traderId, toDelete);
            expect(processAttachmentByParentSpy).toHaveBeenCalledWith(attachments2, traderId, toDelete);

            expect(itemHelperGetItemNameSpy).toHaveBeenCalledTimes(2);
            expect(itemHelperGetItemNameSpy).toHaveBeenCalledWith(parent1._tpl);
            expect(itemHelperGetItemNameSpy).toHaveBeenCalledWith(parent2._tpl);
        });
    });

    describe("processAttachmentByParent", () =>
    {
        it("should process attachments by calling helper methods in sequence", () =>
        {
            const attachments = [
                { _id: "attach1", _tpl: "tpl1" },
                { _id: "attach2", _tpl: "tpl2" }
            ];
            const traderId = "some-trader-id";
            const toDelete = new Set<string>();

            // Mock helper methods.
            const sortAttachmentsByPriceSpy = vi.spyOn(insuranceController, "sortAttachmentsByPrice").mockReturnValue(attachments);
            const logAttachmentsDetailsSpy = vi.spyOn(insuranceController, "logAttachmentsDetails").mockImplementation(() =>
            {});
            const countSuccessfulRollsSpy = vi.spyOn(insuranceController, "countSuccessfulRolls").mockReturnValue(4);
            const attachmentDeletionByValueSpy = vi.spyOn(insuranceController, "attachmentDeletionByValue").mockImplementation(() =>
            {});

            // Execute the method.
            insuranceController.processAttachmentByParent(attachments, traderId, toDelete);

            // Verify that helper methods are called in the correct sequence.
            expect(sortAttachmentsByPriceSpy).toHaveBeenCalledWith(attachments);
            expect(logAttachmentsDetailsSpy).toHaveBeenCalledWith(attachments);
            expect(countSuccessfulRollsSpy).toHaveBeenCalledWith(attachments, traderId);
            expect(attachmentDeletionByValueSpy).toHaveBeenCalledWith(attachments, 4, toDelete);
        });
    });

    describe("sortAttachmentsByPrice", () =>
    {
        it("should sort the attachments array by maxPrice in descending order", () =>
        {
            const attachments = [
                { _id: "item1", _tpl: "tpl1" },
                { _id: "item2", _tpl: "tpl2" },
                { _id: "item3", _tpl: "tpl3" }
            ];

            const itemHelper = {
                getItemName: vi.fn((tpl) => `Item Name ${tpl}`),
                getItemMaxPrice: vi.fn((tpl) =>
                {
                    if (tpl === "tpl1") return 100;
                    if (tpl === "tpl2") return 200;
                    if (tpl === "tpl3") return 50;
                    return 0;
                })
            };

            // Mock the itemHelper methods.
            vi.spyOn(insuranceController.itemHelper, "getItemName").mockImplementation(itemHelper.getItemName);
            vi.spyOn(insuranceController.itemHelper, "getItemMaxPrice").mockImplementation(itemHelper.getItemMaxPrice);

            // Execute the method.
            const result = insuranceController.sortAttachmentsByPrice(attachments);

            // Verify that the array is sorted by maxPrice in descending order.
            expect(result[0].maxPrice).toBe(200);
            expect(result[1].maxPrice).toBe(100);
            expect(result[2].maxPrice).toBe(50);
        });

        it("should handle null max-price values by sorting them to the bottom", () =>
        {
            const attachments = [
                { _id: "item1", _tpl: "tpl1" },
                { _id: "item2", _tpl: "tpl2" },
                { _id: "item3", _tpl: "tpl3" }
            ];

            const itemHelper = {
                getItemName: vi.fn((tpl) => `Item Name ${tpl}`),
                getItemMaxPrice: vi.fn((tpl) =>
                {
                    if (tpl === "tpl1") return null;
                    if (tpl === "tpl2") return 200;
                    if (tpl === "tpl3") return 50;
                    return 0;
                })
            };

            // Mock the itemHelper methods.
            vi.spyOn(insuranceController.itemHelper, "getItemName").mockImplementation(itemHelper.getItemName);
            vi.spyOn(insuranceController.itemHelper, "getItemMaxPrice").mockImplementation(itemHelper.getItemMaxPrice);

            // Execute the method.
            const result = insuranceController.sortAttachmentsByPrice(attachments);

            // Verify that the array is sorted by maxPrice in descending order.
            expect(result[0].maxPrice).toBe(200);
            expect(result[1].maxPrice).toBe(50);
            expect(result[2].maxPrice).toBe(null);
        });
    });

    describe("logAttachmentsDetails", () =>
    {
        it("should log details for each attachment", () =>
        {
            const attachments = [
                { _id: "item1", name: "Item 1", maxPrice: 100 },
                { _id: "item2", name: "Item 2", maxPrice: 200 }
            ];

            // Mock the logger.debug function.
            const loggerDebugSpy = vi.spyOn(insuranceController.logger, "debug").mockImplementation(() =>
            {});

            // Execute the method.
            insuranceController.logAttachmentsDetails(attachments);

            // Verify that logger.debug was called correctly.
            expect(loggerDebugSpy).toHaveBeenCalledTimes(2);
            expect(loggerDebugSpy).toHaveBeenNthCalledWith(1, "Child Item - Name: Item 1, Max Price: 100");
            expect(loggerDebugSpy).toHaveBeenNthCalledWith(2, "Child Item - Name: Item 2, Max Price: 200");
        });
    });

    describe("countSuccessfulRolls", () =>
    {
        it("should count the number of successful rolls based on the rollForDelete method", () =>
        {
            const attachments = [
                { _id: "attach1", name: "Attachment 1" },
                { _id: "attach2", name: "Attachment 2" },
                { _id: "attach3", name: "Attachment 3" }
            ];
            const traderId = "some-trader-id";

            // Create a deterministic sequence of "random" values for the test.
            const randomSequence = [0.6, 0.4, 0.6];  // Two rolls > 0.5 and one roll < 0.5
            let i = 0;
            const originalRandom = Math.random;
            Math.random = vi.fn(() => randomSequence[i++]);

            // Mock rollForDelete to return based on our "random" values.
            vi.spyOn(insuranceController, "rollForDelete").mockImplementation((id) =>
            {
                return id === traderId && Math.random() > 0.5;
            });

            // Execute the method.
            const result = insuranceController.countSuccessfulRolls(attachments, traderId);

            // Verify that two successful rolls were counted (first and third items).
            expect(result).toBe(2);

            // Restore the original Math.random function.
            Math.random = originalRandom;
        });

        it("should return zero if there are no successful rolls", () =>
        {
            const attachments = [
                { _id: "attach1", name: "Attachment 1" }
            ];
            const traderId = "some-trader-id";

            // Mock rollForDelete to always return false.
            vi.spyOn(insuranceController, "rollForDelete").mockReturnValue(false);

            // Execute the method.
            const result = insuranceController.countSuccessfulRolls(attachments, traderId);

            // Verify that zero successful rolls were returned.
            expect(result).toBe(0);
        });

        it("should return zero if there are no attachments", () =>
        {
            const attachments = [];
            const traderId = "some-trader-id";

            // Execute the method.
            const result = insuranceController.countSuccessfulRolls(attachments, traderId);

            // Verify that zero successful rolls were returned.
            expect(result).toBe(0);
        });
    });

    describe("attachmentDeletionByValue", () =>
    {
        it("should add attachments to the toDelete set based on successfulRolls", () =>
        {
            const attachments = [
                { _id: "attach1", name: "Attachment 1", maxPrice: 300 },
                { _id: "attach2", name: "Attachment 2", maxPrice: 200 },
                { _id: "attach3", name: "Attachment 3", maxPrice: 100 }
            ];
            const successfulRolls = 2;
            const toDelete = new Set<string>();

            const loggerDebugSpy = vi.spyOn(insuranceController.logger, "debug").mockImplementation(() =>
            {});

            // Execute the method.
            insuranceController.attachmentDeletionByValue(attachments, successfulRolls, toDelete);

            // Should add the first two valuable attachments to the toDelete set.
            expect(toDelete).toEqual(new Set(["attach1", "attach2"]));

            // Verify that logger.debug was called twice.
            expect(loggerDebugSpy).toHaveBeenCalledTimes(2);
        });

        it("should not add any attachments to toDelete if successfulRolls is zero", () =>
        {
            const attachments = [
                { _id: "attach1", name: "Attachment 1", maxPrice: 100 }
            ];
            const successfulRolls = 0;
            const toDelete = new Set<string>();

            // Execute the method.
            insuranceController.attachmentDeletionByValue(attachments, successfulRolls, toDelete);

            // Verify that no attachments are added to the toDelete set.
            expect(toDelete).toEqual(new Set([]));
        });

        it("should add all attachments to toDelete if successfulRolls is greater than the number of attachments", () =>
        {
            const attachments = [
                { _id: "attach1", name: "Attachment 1", maxPrice: 100 },
                { _id: "attach2", name: "Attachment 2", maxPrice: 200 }
            ];
            const successfulRolls = 3;
            const toDelete = new Set<string>();

            // Execute the method.
            insuranceController.attachmentDeletionByValue(attachments, successfulRolls, toDelete);

            // Verify that all attachments are added to the toDelete set.
            expect(toDelete).toEqual(new Set(["attach1", "attach2"]));
        });
    });

    describe("removeItemsFromInsurance", () =>
    {
        it("should remove items from insurance based on the toDelete set", () =>
        {
            const insured = {
                items: [
                    { _id: "item1" },
                    { _id: "item2" },
                    { _id: "item3" }
                ]
            };
            const toDelete = new Set<string>(["item1", "item3"]);

            // Execute the method.
            insuranceController.removeItemsFromInsurance(insured, toDelete);

            // Verify that items with _id "item1" and "item3" are removed
            expect(insured.items).toEqual([{ _id: "item2" }]);
        });

        it("should not remove any items if toDelete set is empty", () =>
        {
            const insured = {
                items: [
                    { _id: "item1" },
                    { _id: "item2" },
                    { _id: "item3" }
                ]
            };
            const toDelete = new Set<string>();

            // Execute the method.
            insuranceController.removeItemsFromInsurance(insured, toDelete);

            // Verify that no items are removed.
            expect(insured.items).toEqual([
                { _id: "item1" },
                { _id: "item2" },
                { _id: "item3" }
            ]);
        });

        it("should leave the insurance items empty if all are to be deleted", () =>
        {
            const insured = {
                items: [
                    { _id: "item1" },
                    { _id: "item2" }
                ]
            };
            const toDelete = new Set<string>(["item1", "item2"]);

            // Execute the method.
            insuranceController.removeItemsFromInsurance(insured, toDelete);

            // Verify that all items are removed.
            expect(insured.items).toEqual([]);
        });
    });

    describe("adoptOrphanedItems", () =>
    {
        it("should adopt orphaned items by resetting them as base-level items", () =>
        {
            const insured = {
                items: [
                    { _id: "1", parentId: "999", slotId: "main" }, // This is orphaned.
                    { _id: "2", parentId: "1", slotId: "main" }
                ]
            };
            const hideoutParentId = "hideout-parent";

            vi.spyOn(insuranceController, "fetchHideoutItemParent").mockReturnValue(hideoutParentId);

            // Execute the method.
            insuranceController.adoptOrphanedItems(insured);

            // Verify that the item with _id "1" has been adopted.
            expect(insured.items[0].parentId).toBe(hideoutParentId);
            expect(insured.items[0].slotId).toBe("hideout");
        });

        it("should not adopt items that are not orphaned", () =>
        {
            const insured = {
                items: [
                    { _id: "1", parentId: "999", slotId: "main" },
                    { _id: "2", parentId: "1", slotId: "main" } // This is not orphaned.
                ]
            };
            const hideoutParentId = "hideout-parent";

            vi.spyOn(insuranceController, "fetchHideoutItemParent").mockReturnValue(hideoutParentId);

            // Execute the method.
            insuranceController.adoptOrphanedItems(insured);

            // Verify that the item with _id "2" has not been adopted.
            expect(insured.items[1].parentId).toBe("1");
            expect(insured.items[1].slotId).not.toBe("hideout");
        });

        it("should remove location data from adopted items", () =>
        {
            const insured = {
                items: [
                    { _id: "1", parentId: "999", slotId: "main", location: "location-value" }, // This is orphaned.
                    { _id: "2", parentId: "1", slotId: "main", location: "location-value" }
                ]
            };
            const hideoutParentId = "hideout-parent";

            vi.spyOn(insuranceController, "fetchHideoutItemParent").mockReturnValue(hideoutParentId);

            // Execute the method.
            insuranceController.adoptOrphanedItems(insured);

            // Verify that the item with _id "1" has no location data.
            expect(insured.items[0]).not.toHaveProperty("location", "location-value");
        });
    });

    describe("fetchHideoutItemParent", () =>
    {
        it("should return the parentId of the hideout item if it exists", () =>
        {
            const hideoutId = "hideout_id";
            const items = [
                { id: "1", slotId: "hideout", parentId: hideoutId },
                { id: "2", slotId: "main", parentId: "not_hideout_id" }
            ];

            // Execute the method.
            const result = insuranceController.fetchHideoutItemParent(items);

            // Verify that the hideout item parentId is returned.
            expect(result).toBe(hideoutId);
        });

        it("should return an empty string if the hideout item does not exist", () =>
        {
            const items = [
                { id: "1", slotId: "mod_suppressor", parentId: "not_hideout_id" },
                { id: "2", slotId: "main", parentId: "not_hideout_id" }
            ];

            // Execute the method.
            const result = insuranceController.fetchHideoutItemParent(items);

            // Verify that an empty string is returned.
            expect(result).toBe("");
        });
    });

    describe("sendMail", () =>
    {
        it("should send insurance failed message when no items are present", () =>
        {
            const traderHelper = container.resolve<TraderHelper>("TraderHelper");

            const sessionID = "someSessionId";
            const insuranceFailedTpl = "failed-message-template";
            const insurance = {
                traderId: "54cb57776803fa99248b456e", // Therapist
                messageContent: {
                    templateId: null,
                    maxStorageTime: 100,
                    systemData: {}
                },
                items: []
            };

            // Mock the randomUtil to return a static failed template string.
            vi.spyOn(insuranceController.randomUtil, "getArrayValue").mockReturnValue(insuranceFailedTpl);

            // Don't actually send the message.
            const sendLocalisedNpcMessageToPlayerSpy = vi.spyOn(insuranceController.mailSendService, "sendLocalisedNpcMessageToPlayer").mockImplementation(() =>
            {});

            // Execute the method.
            insuranceController.sendMail(sessionID, insurance);

            // Verify that the insurance failed message was sent.
            expect(sendLocalisedNpcMessageToPlayerSpy).toHaveBeenCalledWith(
                sessionID,
                traderHelper.getTraderById(insurance.traderId),
                MessageType.INSURANCE_RETURN,
                insuranceFailedTpl,
                insurance.items,
                insurance.messageContent.maxStorageTime,
                insurance.messageContent.systemData
            );
        });

        it("should not send insurance failed message when items are present", () =>
        {
            const traderHelper = container.resolve<TraderHelper>("TraderHelper");

            const sessionID = "someSessionId";
            const itemMessageTpl = "item-message-template";
            const insuranceFailedTpl = "failed-message-template";
            const insurance = {
                traderId: "54cb57776803fa99248b456e", // Therapist
                messageContent: {
                    templateId: itemMessageTpl,
                    maxStorageTime: 100,
                    systemData: {}
                },
                items: ["item1", "item2"]
            };

            // Mock the randomUtil to return a static failed template string.
            vi.spyOn(insuranceController.randomUtil, "getArrayValue").mockReturnValue(insuranceFailedTpl);

            // Don't actually send the message.
            const sendLocalisedNpcMessageToPlayerSpy = vi.spyOn(insuranceController.mailSendService, "sendLocalisedNpcMessageToPlayer").mockImplementation(() =>
            {});

            // Execute the method.
            insuranceController.sendMail(sessionID, insurance);

            // Verify that the insurance failed message was not sent.
            expect(sendLocalisedNpcMessageToPlayerSpy).toHaveBeenCalledWith(
                sessionID,
                traderHelper.getTraderById(insurance.traderId),
                MessageType.INSURANCE_RETURN,
                itemMessageTpl,
                insurance.items,
                insurance.messageContent.maxStorageTime,
                insurance.messageContent.systemData
            );
        });
    });

    describe("rollForDelete", () =>
    {
        it("should return true when random roll is equal to trader return chance", () =>
        {
            vi.spyOn(insuranceController.randomUtil, "getInt").mockReturnValue(8500); // Our "random" roll.
            const traderId = "54cb57776803fa99248b456e"; // Therapist (85% return chance)
            insuranceController.insuranceConfig = {
                returnChancePercent: {
                    [traderId]: 85 // Force 85% return chance
                }
            };

            // Execute the method.
            const result = insuranceController.rollForDelete(traderId);

            // Verify that the result is true.
            expect(result).toBe(true);
        });

        it("should return true when random roll is greater than trader return chance", () =>
        {
            vi.spyOn(insuranceController.randomUtil, "getInt").mockReturnValue(8501); // Our "random" roll.
            const traderId = "54cb57776803fa99248b456e"; // Therapist (85% return chance)
            insuranceController.insuranceConfig = {
                returnChancePercent: {
                    [traderId]: 85 // Force 85% return chance
                }
            };

            // Execute the method.
            const result = insuranceController.rollForDelete(traderId);

            // Verify that the result is true.
            expect(result).toBe(true);
        });

        it("should return false when random roll is less than trader return chance", () =>
        {
            vi.spyOn(insuranceController.randomUtil, "getInt").mockReturnValue(8499); // Our "random" roll.
            const traderId = "54cb57776803fa99248b456e"; // Therapist (85% return chance)
            insuranceController.insuranceConfig = {
                returnChancePercent: {
                    [traderId]: 85 // Force 85% return chance
                }
            };

            // Execute the method.
            const result = insuranceController.rollForDelete(traderId);

            // Verify that the result is false.
            expect(result).toBe(false);
        });

        it("should log error if trader can not be found", () =>
        {
            const traderId = "invalid-trader-id";

            const loggerErrorSpy = vi.spyOn(insuranceController.logger, "error").mockImplementation(() =>
            {});

            // Execute the method.
            insuranceController.rollForDelete(traderId);

            // Verify that the logger.error method was called.
            expect(loggerErrorSpy).toHaveBeenCalled();
        });

        it("should return null if trader can not be found", () =>
        {
            const traderId = "invalid-trader-id";

            vi.spyOn(insuranceController.logger, "error").mockImplementation(() =>
            {});

            // Execute the method.
            const result = insuranceController.rollForDelete(traderId);

            // Verify that the result is null.
            expect(result).toBe(null);
        });
    });
});
