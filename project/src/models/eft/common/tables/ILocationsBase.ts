import { ILocations } from "@spt/models/spt/server/ILocations";

export interface ILocationsBase {
    locations: ILocations;
    paths: IPath[];
}

export interface IPath {
    Source: string;
    Event: boolean;
    Destination: string;
}
