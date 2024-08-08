import { IChangeRequestData } from "@spt/models/eft/launcher/IChangeRequestData";
import { ILoginRequestData } from "@spt/models/eft/launcher/ILoginRequestData";
import { IRegisterData } from "@spt/models/eft/launcher/IRegisterData";
import { ILauncherV2LoginResponse } from "../launcher/ILauncherV2LoginResponse";
import { ILauncherV2ModsResponse } from "../launcher/ILauncherV2ModsResponse";
import { ILauncherV2PasswordChangeResponse } from "../launcher/ILauncherV2PasswordChangeResponse";
import { ILauncherV2PingResponse } from "../launcher/ILauncherV2PingResponse";
import { ILauncherV2ProfilesResponse } from "../launcher/ILauncherV2ProfilesResponse";
import { ILauncherV2RegisterResponse } from "../launcher/ILauncherV2RegisterResponse";
import { ILauncherV2TypesResponse } from "../launcher/ILauncherV2TypesResponse";
import { ILauncherV2VersionResponse } from "../launcher/ILauncherV2VersionResponse";

export interface ILauncherV2Callbacks {
    ping(): ILauncherV2PingResponse;
    types(): ILauncherV2TypesResponse;
    login(info: ILoginRequestData): ILauncherV2LoginResponse;
    register(info: IRegisterData): ILauncherV2RegisterResponse;
    passwordChange(info: IChangeRequestData): ILauncherV2PasswordChangeResponse;
    remove(info: ILoginRequestData): ILauncherV2LoginResponse;
    compatibleVersion(): ILauncherV2VersionResponse;
    mods(): ILauncherV2ModsResponse;
    profiles(): ILauncherV2ProfilesResponse;
    profile(): any
    profileMods(): any
}