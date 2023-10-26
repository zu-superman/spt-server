import "reflect-metadata";

import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { DependencyContainer } from "tsyringe";

describe("ItemHelper", () =>
{
    let container: DependencyContainer;
    let itemHelper: ItemHelper;

    beforeAll(() =>
    {
        container = globalThis.container;
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
