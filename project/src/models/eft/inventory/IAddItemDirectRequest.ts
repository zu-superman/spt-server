import { Item } from "../common/tables/IItem"

export interface IAddItemDirectRequest
{
    /** Item and child mods to add to player inventory */
    itemWithModsToAdd: Item[];
    foundInRaid: boolean;
    callback: () => void;
    useSortingTable: boolean;
}