export interface IPinItemRequest {
    Action: "PinLock";
    /** Id of item being pinned */
    Item: string;
    /** "Pinned"/"" */
    State: string;
}
