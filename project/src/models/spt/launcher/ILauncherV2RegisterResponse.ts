import { IMiniProfile } from "@spt/models/eft/launcher/IMiniProfile"

export interface ILauncherV2RegisterResponse {
    response: boolean
    profiles: IMiniProfile[]
}