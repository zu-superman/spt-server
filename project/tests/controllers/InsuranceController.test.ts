import "reflect-metadata";
import { container } from "tsyringe";
import { vi, afterEach, describe, expect, it, beforeEach } from "vitest";

import { InsuranceController } from "@spt-aki/controllers/InsuranceController";
import { ProfileInsuranceFactory } from "@tests/__factories__/ProfileInsurance.factory";

import { MessageType } from "@spt-aki/models/enums/MessageType";
import { TraderHelper } from "@spt-aki/helpers/TraderHelper";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { Insurance } from "@spt-aki/models/eft/profile/IAkiProfile";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";

describe("InsuranceController", () =>
{
    let insuranceController: any; // Using "any" to access private/protected methods without type errors.
    let insuranceFixture: Insurance[];

    beforeEach(() =>
    {
        // (Re)resolve the test target.
        insuranceController = container.resolve<InsuranceController>("InsuranceController");

        // Reset the insurance fixture before each test.
        insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
    });

    afterEach(() =>
    {
        // Restore all mocks to their original implementations.
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    describe("processReturn", () =>
    {
        it("should process return for all profiles", () =>
        {
            const session1 = "session1";
            const session2 = "session2";
            const profiles = {
                [session1]: {},
                [session2]: {}
            };
            const getProfilesSpy = vi.spyOn(insuranceController.saveServer, "getProfiles").mockReturnValue(profiles);
            const processReturnByProfileSpy = vi.spyOn(insuranceController, "processReturnByProfile").mockReturnValue(vi.fn());

            // Execute the method.
            insuranceController.processReturn();

            // Should make a call to get all of the profiles.
            expect(getProfilesSpy).toHaveBeenCalledTimes(1);

            // Should process each returned profile.
            expect(processReturnByProfileSpy).toHaveBeenCalledTimes(2);
            expect(processReturnByProfileSpy).toHaveBeenCalledWith(session1);
            expect(processReturnByProfileSpy).toHaveBeenCalledWith(session2);
        });

        it("should not attempt to process profiles if no profiles exist", () =>
        {
            vi.spyOn(insuranceController.saveServer, "getProfiles").mockReturnValue({});
            const processReturnByProfileSpy = vi.spyOn(insuranceController, "processReturnByProfile").mockImplementation(vi.fn());

            // Execute the method.
            insuranceController.processReturn();

            // Should not process any profiles.
            expect(processReturnByProfileSpy).not.toHaveBeenCalled();
        });
    });

    describe("findItemsToDelete", () =>
    {

        it("should handle an empty insurance package", () =>
        {
            const insurancePackage = insuranceFixture[0];
            insurancePackage.items = [];

            const result = insuranceController.findItemsToDelete(insurancePackage);
            expect(result.size).toBe(0);
        });

        it("should handle regular items", () =>
        {
            // Remove attachment items from the fixture.
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().removeAttachmentItems().get();
            const insured = insuranceFixture[0];
            const numberOfItems = insured.items.length;

            // Mock helper methods.
            const mockPopulateItemsMap = vi.spyOn(insuranceController, "populateItemsMap");
            const mockPopulateParentAttachmentsMap = vi.spyOn(insuranceController, "populateParentAttachmentsMap");
            const mockIsAttachmentAttached = vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached");
            const mockProcessAttachments = vi.spyOn(insuranceController, "processAttachments").mockImplementation(vi.fn());

            // Add all items to the toDelete set. Not realistic, but it's fine for this test.
            const mockProcessRegularItems = vi.fn((insured, toDelete) =>
            {
                insured.items.forEach(item => toDelete.add(item._id));
            });
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called.
            expect(mockPopulateItemsMap).toHaveBeenCalledTimes(1);
            expect(mockPopulateParentAttachmentsMap).toHaveBeenCalledTimes(1);
            expect(mockIsAttachmentAttached).toHaveBeenCalledTimes(numberOfItems + 1); // Once for each item, plus once more
            expect(mockProcessRegularItems).toHaveBeenCalledTimes(1);
            expect(mockProcessAttachments).not.toHaveBeenCalled();

            // Verify that the result is correct.
            expect(result.size).toBe(numberOfItems);
            expect(result).toEqual(new Set(insured.items.map(item => item._id)));
        });

        it("should ignore orphaned attachments", () =>
        {
            // Remove regular items from the fixture, creating orphaned attachments.
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().removeRegularItems().get();
            const insured = insuranceFixture[0];

            // Mock helper methods.
            const mockPopulateItemsMap = vi.spyOn(insuranceController, "populateItemsMap");
            const mockProcessRegularItems = vi.spyOn(insuranceController, "processRegularItems");
            const mockProcessAttachments = vi.spyOn(insuranceController, "processAttachments");

            // Since no parent attachments exist, the map should be empty.
            const mockPopulateParentAttachmentsMap = vi.fn(() =>
            {
                return new Map<string, Item[]>();
            });
            vi.spyOn(insuranceController, "populateParentAttachmentsMap").mockImplementation(mockPopulateParentAttachmentsMap);

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called.
            expect(mockPopulateItemsMap).toHaveBeenCalled();
            expect(mockPopulateParentAttachmentsMap).toHaveBeenCalled();
            expect(mockProcessRegularItems).not.toHaveBeenCalled();
            expect(mockProcessAttachments).not.toHaveBeenCalled();

            // Verify that the result is correct.
            expect(result.size).toBe(0);
            expect(result).toEqual(new Set());
        });

        it("should handle a mix of regular items and attachments", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const numberOfItems = insured.items.length;

            // Mock helper methods.
            const mockPopulateItemsMap = vi.spyOn(insuranceController, "populateItemsMap");
            const mockPopulateParentAttachmentsMap = vi.spyOn(insuranceController, "populateParentAttachmentsMap");

            // Add all items to the toDelete set. Not realistic, but it's fine for this test.
            const mockProcessRegularItems = vi.fn((insured, toDelete) =>
            {
                insured.items.forEach(item => toDelete.add(item._id));
            });
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);
            const mockProcessAttachments = vi.fn((parentAttachmentsMap, itemsMap, traderId, toDelete) =>
            {
                insured.items.forEach(item => toDelete.add(item._id));
            });
            vi.spyOn(insuranceController, "processAttachments").mockImplementation(mockProcessAttachments);

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called.
            expect(mockPopulateItemsMap).toHaveBeenCalled();
            expect(mockPopulateParentAttachmentsMap).toHaveBeenCalled();
            expect(mockProcessRegularItems).toHaveBeenCalled();
            expect(mockProcessAttachments).toHaveBeenCalled();

            // Verify that the result is correct.
            expect(result.size).toBe(numberOfItems);
            expect(result).toEqual(new Set(insured.items.map(item => item._id)));
        });

        it("should return an empty set if no items are to be deleted", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];

            // Mock helper methods.
            const mockPopulateItemsMap = vi.spyOn(insuranceController, "populateItemsMap");
            const mockPopulateParentAttachmentsMap = vi.spyOn(insuranceController, "populateParentAttachmentsMap");

            // Don't add any items to the toDelete set.
            const mockProcessRegularItems = vi.spyOn(insuranceController, "processRegularItems").mockImplementation(vi.fn());
            const mockProcessAttachments = vi.spyOn(insuranceController, "processAttachments").mockImplementation(vi.fn());

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the correct methods were called.
            expect(mockPopulateItemsMap).toHaveBeenCalled();
            expect(mockPopulateParentAttachmentsMap).toHaveBeenCalled();
            expect(mockProcessRegularItems).toHaveBeenCalled();
            expect(mockProcessAttachments).toHaveBeenCalled();

            // Verify that the result is correct.
            expect(result.size).toBe(0);
            expect(result).toEqual(new Set());
        });

        it("should log the number of items to be deleted", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const numberOfItems = insured.items.length;

            // Mock helper methods.
            const mockLoggerDebug = vi.spyOn(insuranceController.logger, "debug");

            // Add all items to the toDelete set. Not realistic, but it's fine for this test.
            const mockProcessRegularItems = vi.fn((insured, toDelete) =>
            {
                insured.items.forEach(item => toDelete.add(item._id));
            });
            vi.spyOn(insuranceController, "processRegularItems").mockImplementation(mockProcessRegularItems);
            const mockProcessAttachments = vi.fn((parentAttachmentsMap, itemsMap, traderId, toDelete) =>
            {
                insured.items.forEach(item => toDelete.add(item._id));
            });
            vi.spyOn(insuranceController, "processAttachments").mockImplementation(mockProcessAttachments);

            // Execute the method.
            const result = insuranceController.findItemsToDelete(insured);

            // Verify that the result is the correct size, and the size is logged.
            expect(result.size).toBe(numberOfItems);
            expect(mockLoggerDebug).toBeCalledWith(`Marked ${numberOfItems} items for deletion from insurance.`);
        });
    });

    describe("populateParentAttachmentsMap", () =>
    {
        it("should correctly map gun to all of its attachments", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];

            // Generate the items map.
            const itemsMap = insuranceController.populateItemsMap(insured);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that the map is populated correctly.
            expect(result.size).toBe(6); // There are 6 base-level items in this insurance package.

            const gun = result.get("911a0f04d5d9c7e239807ae0");
            expect(gun.length).toBe(7); // This AK has 7 attachments.

            // The attachments should be mapped to the AK properly...
            const validAttachmentTemplates = [
                "677c209ebb45445ebb42c405",
                "4bd10f89836fd9f86aedcac1",
                "8b1327270791b142ac341b03",
                "da8cde1b3024c336f6e06152",
                "bc041c0011d76f714b898400",
                "9f8d7880a6e0a47a211ec5d3",
                "db2ef9442178910eba985b51"
            ];
            validAttachmentTemplates.forEach(value =>
            {
                // Verify that each template is present in the array of attachments.
                expect(gun.some(item => item._id === value)).toBe(true);
            });
        });

        it("should ignore gun accessories that cannot be modified in-raid", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];

            // Generate the items map.
            const itemsMap = insuranceController.populateItemsMap(insured);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that the map is populated correctly.
            expect(result.size).toBe(6); // There are 6 base-level items in this insurance package.

            const gun = result.get("911a0f04d5d9c7e239807ae0");
            expect(gun.length).toBe(7); // This AK has 7 valid attachments.

            // These are attachments for the AK, but they are not raid moddable, so they should not be mapped.
            const invalidAttachmentTemplates = [
                "1e0b177df108c0c117028812",
                "c9278dd8251e99578bf7a274",
                "402b4086535a50ef7d9cef88",
                "566335b3df586f34b47f5e35"
            ];
            invalidAttachmentTemplates.forEach(value =>
            {
                expect(gun.every(item => item._id !== value)).toBe(true);
            });
        });

        it("should correctly map helmet to all of its attachments", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];

            // Generate the items map.
            const itemsMap = insuranceController.populateItemsMap(insured);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that the map is populated correctly.
            expect(result.size).toBe(6); // There are 6 base-level items in this insurance package.

            const gun = result.get("3679078e05f5b14466d6a730");
            expect(gun.length).toBe(5); // This LShZ-2DTM has 5 valid attachments.

            // The attachments should be mapped to the AK properly...
            const validAttachmentTemplates = [
                "a2b0c716162c5e31ec28c55a",
                "dc565f750342cb2d19eeda06",
                "e9ff62601669d9e2ea9c2fbb",
                "ac134d7cf6c9d8e25edd0015",
                "22274b895ecc80d51c3cba1c"
            ];
            validAttachmentTemplates.forEach(value =>
            {
                // Verify that each template is present in the array of attachments.
                expect(gun.some(item => item._id === value)).toBe(true);
            });
        });

        it("should correctly map gun to all of its attachments when gun is within a container", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];

            // Generate the items map.
            const itemsMap = insuranceController.populateItemsMap(insured);

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that the map is populated correctly.
            expect(result.size).toBe(6); // There are 6 base-level items in this insurance package.

            const gun = result.get("351180f3248d45c71cb2ebdc");
            expect(insured.items.find(item => item._id === "351180f3248d45c71cb2ebdc").slotId).toBe("main");
            expect(gun.length).toBe(14); // This AS VAL has 14 valid attachments.
        });

        it("should not map items that do not have a main-parent", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().removeRegularItems().get();
            const insured = insuranceFixture[0];

            // Generate the items map.
            const itemsMap = insuranceController.populateItemsMap(insured);

            // Suppress warnings.
            vi.spyOn(insuranceController.logger, "warning").mockImplementation(vi.fn());

            // Execute the method.
            const result = insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that the map is populated correctly.
            expect(result.size).toBe(0);
        });

        it("should log a warning when an item does not have a main-parent", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().removeRegularItems().get();
            const insured = insuranceFixture[0];

            // Generate the items map.
            const itemsMap = insuranceController.populateItemsMap(insured);

            // Suppress warnings.
            const mockLoggerWarning = vi.spyOn(insuranceController.logger, "warning").mockImplementation(vi.fn());

            // Execute the method.
            insuranceController.populateParentAttachmentsMap(insured, itemsMap);

            // Verify that the warning was logged.
            expect(mockLoggerWarning).toHaveBeenCalled();
        });
    });

    describe("processRegularItems", () =>
    {
        it("should process regular items and their non-attachment children", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().removeAttachmentItems().get();
            const insured = insuranceFixture[0];
            const numberOfItems = insured.items.length;
            const toDelete = new Set<string>();

            // Mock helper methods.
            const mockIsAttachmentAttached = vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached");
            const mockFindAndReturnChildrenAsItems = vi.spyOn(insuranceController.itemHelper, "findAndReturnChildrenAsItems");

            // Mock rollForDelete to return true for all items. Not realistic, but it's fine for this test.
            const mockRollForDelete = vi.spyOn(insuranceController, "rollForDelete").mockReturnValue(true);

            // Execute the method.
            insuranceController.processRegularItems(insured, toDelete);

            // Verify that the correct methods were called.
            expect(mockIsAttachmentAttached).toHaveBeenCalled();
            expect(mockFindAndReturnChildrenAsItems).toHaveBeenCalled();
            expect(mockRollForDelete).toHaveBeenCalledTimes(numberOfItems);

            // Verify that all items were added to the toDelete set.
            expect(toDelete).toEqual(new Set(insured.items.map(item => item._id)));
        });

        it("should not roll attached attachments", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const toDelete = new Set<string>();

            // Mock helper methods.
            vi.spyOn(insuranceController.itemHelper, "findAndReturnChildrenAsItems");

            // Mock isAttachmentAttached to return true for all items.
            vi.spyOn(insuranceController.itemHelper, "isAttachmentAttached").mockReturnValue(true);

            // Mock rollForDelete to return true for all items.
            const mockRollForDelete = vi.spyOn(insuranceController, "rollForDelete").mockReturnValue(true);

            // Execute the method.
            insuranceController.processRegularItems(insured, toDelete);

            // Verify that a roll was not made for any items.
            expect(mockRollForDelete).not.toHaveBeenCalled();

            // Verify that no items were added to the toDelete set.
            expect(toDelete).toEqual(new Set());
        });

        it("should mark attachments for deletion when parent is marked for deletion", () =>
        {
            const itemHelper = container.resolve<ItemHelper>("ItemHelper");

            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const toDelete = new Set<string>();

            // Mock rollForDelete to return true for all base-parent items.
            const mockRollForDelete = vi.fn((traderId, insuredItem) =>
            {
                return !itemHelper.isAttachmentAttached(insuredItem);
            });
            vi.spyOn(insuranceController, "rollForDelete").mockImplementation(mockRollForDelete);

            // Execute the method.
            insuranceController.processRegularItems(insured, toDelete);

            // Verify that all items were added to the toDelete set.
            expect(toDelete).toEqual(new Set(insured.items.map(item => item._id)));
        });
    });

    describe("processAttachments", () =>
    {
        it("should iterate over each parent item", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const itemsMap = insuranceController.populateItemsMap(insured);
            const parentToAttachmentMap = insuranceController.populateParentAttachmentsMap(insured, itemsMap);
            const toDelete = new Set<string>();

            // Mock helper methods.
            const mockProcessAttachmentByParent = vi.spyOn(insuranceController, "processAttachmentByParent");

            // Execute the method.
            insuranceController.processAttachments(parentToAttachmentMap, itemsMap, insured.traderId, toDelete);

            // Verify
            expect(mockProcessAttachmentByParent).toHaveBeenCalledTimes(parentToAttachmentMap.size);
        });

        it("should log the name of each parent item", () =>
        {
            const itemHelper = container.resolve<ItemHelper>("ItemHelper");

            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const itemsMap = insuranceController.populateItemsMap(insured);
            const parentToAttachmentMap = insuranceController.populateParentAttachmentsMap(insured, itemsMap);
            const toDelete = new Set<string>();

            // Mock helper methods.
            const mockLoggerDebug = vi.spyOn(insuranceController.logger, "debug");

            // Execute the method.
            insuranceController.processAttachments(parentToAttachmentMap, itemsMap, insured.traderId, toDelete);

            // Verify that the name of each parent item is logged.
            for (const [parentId] of parentToAttachmentMap)
            {
                const parentItem = itemsMap.get(parentId);
                if (parentItem)
                {
                    const expectedMessage = `Processing attachments for parent item: ${itemHelper.getItemName(parentItem._tpl)}`;
                    expect(mockLoggerDebug).toHaveBeenCalledWith(expectedMessage);
                }
            }
        });
    });

    describe("processAttachmentByParent", () =>
    {
        it("should handle sorting, rolling, and deleting attachments by calling helper methods", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const itemsMap = insuranceController.populateItemsMap(insured);
            const parentToAttachmentMap = insuranceController.populateParentAttachmentsMap(insured, itemsMap);
            const attachments = parentToAttachmentMap.entries().next().value;
            const toDelete = new Set<string>();

            // Mock helper methods.
            const mockSortAttachmentsByPrice = vi.spyOn(insuranceController, "sortAttachmentsByPrice");
            const mockCountSuccessfulRolls = vi.spyOn(insuranceController, "countSuccessfulRolls").mockReturnValue(4);
            const mockAttachmentDeletionByValue = vi.spyOn(insuranceController, "attachmentDeletionByValue");

            // Execute the method.
            insuranceController.processAttachmentByParent(attachments, insured.traderId, toDelete);

            // Verify that helper methods are called.
            expect(mockSortAttachmentsByPrice).toHaveBeenCalledWith(attachments);
            expect(mockCountSuccessfulRolls).toHaveBeenCalled();
            expect(mockAttachmentDeletionByValue).toHaveBeenCalled();
        });

        it("should log attachment details and number of successful rolls", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const itemsMap = insuranceController.populateItemsMap(insured);
            const parentToAttachmentMap = insuranceController.populateParentAttachmentsMap(insured, itemsMap);
            const attachments = parentToAttachmentMap.values().next().value;
            const toDelete = new Set<string>();
            const successfulRolls = 4;

            // Mock helper methods.
            const mockLogAttachmentsDetails = vi.spyOn(insuranceController, "logAttachmentsDetails");
            vi.spyOn(insuranceController, "countSuccessfulRolls").mockReturnValue(successfulRolls);
            const mockLoggerDebug = vi.spyOn(insuranceController.logger, "debug").mockImplementation(vi.fn());

            // Execute the method.
            insuranceController.processAttachmentByParent(attachments, insured.traderId, toDelete);

            // Verify that the logs were called/written.
            expect(mockLogAttachmentsDetails).toBeCalled();
            expect(mockLoggerDebug).toHaveBeenCalledWith(`Number of successful rolls: ${successfulRolls}`);
        });
    });

    describe("sortAttachmentsByPrice", () =>
    {
        it("should sort the attachments array by maxPrice in descending order", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const itemsMap = insuranceController.populateItemsMap(insured);
            const parentToAttachmentMap = insuranceController.populateParentAttachmentsMap(insured, itemsMap);
            const attachments = parentToAttachmentMap.values().next().value;

            // Execute the method.
            const sortedAttachments = insuranceController.sortAttachmentsByPrice(attachments);

            // Verify the length of the sorted attachments array
            expect(sortedAttachments.length).toBe(5);

            // Verify that the attachments are sorted by maxPrice in descending order
            for (let i = 1; i < sortedAttachments.length; i++)
            {
                expect(sortedAttachments[i - 1].maxPrice).toBeGreaterThanOrEqual(sortedAttachments[i].maxPrice);
            }
        });

        it("should place attachments with null maxPrice at the bottom of the sorted list", () =>
        {
            insuranceFixture = new ProfileInsuranceFactory().adjustPackageDates().get();
            const insured = insuranceFixture[0];
            const itemsMap = insuranceController.populateItemsMap(insured);
            const parentToAttachmentMap = insuranceController.populateParentAttachmentsMap(insured, itemsMap);
            const attachments = parentToAttachmentMap.values().next().value;

            // Set the maxPrice of the first two attachments to null.
            vi.spyOn(insuranceController.itemHelper, "getItemMaxPrice").mockReturnValueOnce(null).mockReturnValueOnce(null);

            // Execute the method.
            const sortedAttachments = insuranceController.sortAttachmentsByPrice(attachments);

            // Verify that the attachments with null maxPrice are at the bottom of the list
            const nullPriceAttachments = sortedAttachments.slice(-2);
            nullPriceAttachments.forEach(attachment =>
            {
                expect(attachment.maxPrice).toBeNull();
            });

            // Verify that the rest of the attachments are sorted by maxPrice in descending order
            for (let i = 1; i < sortedAttachments.length - 2; i++)
            {
                expect(sortedAttachments[i - 1].maxPrice).toBeGreaterThanOrEqual(sortedAttachments[i].maxPrice);
            }
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
