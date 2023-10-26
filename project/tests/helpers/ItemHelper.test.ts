import "reflect-metadata";

import { container } from "tsyringe";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";

describe("ItemHelper", () =>
{
    let itemHelper: ItemHelper;

    beforeEach(() =>
    {
        itemHelper = container.resolve<ItemHelper>("ItemHelper");
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    describe("isValidItem", () =>
    {
        it("should return false when item details are not available", () =>
        {
            const result = itemHelper.isValidItem("non-existent-item");
            expect(result).toBe(false);
        });
    });
});
