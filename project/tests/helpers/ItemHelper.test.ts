import "reflect-metadata";

import { ItemHelper } from "@spt-aki/helpers/ItemHelper";

describe("ItemHelper", () =>
{
    let itemHelper: ItemHelper;

    beforeAll(() =>
    {
        itemHelper = globalThis.container.resolve<ItemHelper>("ItemHelper");
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
