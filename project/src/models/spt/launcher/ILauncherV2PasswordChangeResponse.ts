import { IMiniProfile } from "@spt/models/eft/launcher/IMiniProfile"

export interface ILauncherV2PasswordChangeResponse {
    response: boolean
    profiles: IMiniProfile[]
}