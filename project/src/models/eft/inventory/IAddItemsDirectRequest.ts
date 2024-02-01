import { Item } from "../common/tables/IItem";

export interface IAddItemsDirectRequest
{
    /** Item and child mods to add to player inventory */
    itemsWithModsToAdd: Item[][];
    foundInRaid: boolean;
    /** Runs after EACH item with children is added */
    callback: (buyCount: number) => void;
    useSortingTable: boolean;
}