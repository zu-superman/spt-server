import { IMiniProfile } from "@spt/models/eft/launcher/IMiniProfile"

export interface ILauncherV2RemoveResponse {
    response: boolean
    profiles: IMiniProfile[]
}