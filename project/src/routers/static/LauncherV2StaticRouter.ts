import { LauncherV2Callbacks } from "@spt/callbacks/Launcherv2Callbacks";
import { ProfileCallbacks } from "@spt/callbacks/ProfileCallbacks";
import { RouteAction, StaticRouter } from "@spt/di/Router";
import { IEmptyRequestData } from "@spt/models/eft/common/IEmptyRequestData";
import { IChangeRequestData } from "@spt/models/eft/launcher/IChangeRequestData";
import { ILoginRequestData } from "@spt/models/eft/launcher/ILoginRequestData";
import { IRegisterData } from "@spt/models/eft/launcher/IRegisterData";
import { ILauncherV2LoginResponse } from "@spt/models/spt/launcher/ILauncherV2LoginResponse";
import { ILauncherV2ModsResponse } from "@spt/models/spt/launcher/ILauncherV2ModsResponse";
import { ILauncherV2PasswordChangeResponse } from "@spt/models/spt/launcher/ILauncherV2PasswordChangeResponse";
import { ILauncherV2PingResponse } from "@spt/models/spt/launcher/ILauncherV2PingResponse";
import { ILauncherV2ProfilesResponse } from "@spt/models/spt/launcher/ILauncherV2ProfilesResponse";
import { ILauncherV2RegisterResponse } from "@spt/models/spt/launcher/ILauncherV2RegisterResponse";
import { ILauncherV2RemoveResponse } from "@spt/models/spt/launcher/ILauncherV2RemoveResponse";
import { ILauncherV2TypesResponse } from "@spt/models/spt/launcher/ILauncherV2TypesResponse";
import { ILauncherV2VersionResponse } from "@spt/models/spt/launcher/ILauncherV2VersionResponse";
import { inject, injectable } from "tsyringe";

@injectable()
export class LauncherV2StaticRouter extends StaticRouter {
    constructor(
        @inject("LauncherV2Callbacks") protected launcherV2Callbacks: LauncherV2Callbacks,
        @inject("ProfileCallbacks") protected profileCallbacks: ProfileCallbacks
    ) {
        super([
            new RouteAction(
                "/launcher/v2/ping",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2PingResponse> => {
                    return this.launcherV2Callbacks.ping();
                },
            ),
            new RouteAction(
                "/launcher/v2/types",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2TypesResponse> => {
                    return this.launcherV2Callbacks.types();
                },
            ),
            new RouteAction(
                "/launcher/v2/Login",
                async (url: string, info: ILoginRequestData, sessionID: string, output: string): Promise<ILauncherV2LoginResponse> => {
                    return this.launcherV2Callbacks.login(info);
                },
            ),
            new RouteAction(
                "/launcher/v2/Register",
                async (url: string, info: IRegisterData, sessionID: string, output: string): Promise<ILauncherV2RegisterResponse> => {
                    return this.launcherV2Callbacks.register(info);
                },
            ),
            new RouteAction(
                "/launcher/v2/passwordChange",
                async (url: string, info: IChangeRequestData, sessionID: string, output: string): Promise<ILauncherV2PasswordChangeResponse> => {
                    return this.launcherV2Callbacks.passwordChange(info);
                },
            ),
            new RouteAction(
                "/launcher/v2/Remove",
                async (url: string, info: ILoginRequestData, sessionID: string, output: string): Promise<ILauncherV2RemoveResponse> => {
                    return this.launcherV2Callbacks.remove(info);
                },
            ),
            new RouteAction(
                "/launcher/v2/version",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2VersionResponse> => {
                    return this.launcherV2Callbacks.compatibleVersion();
                },
            ),
            new RouteAction(
                "/launcher/v2/mods",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2ModsResponse> => {
                    return this.launcherV2Callbacks.mods();
                },
            ),
            new RouteAction(
                "/launcher/v2/profiles",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2ProfilesResponse> => {
                    return this.launcherV2Callbacks.profiles();
                },
            ),
            new RouteAction(
                "/launcher/v2/profile",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2ProfilesResponse> => {
                    return this.launcherV2Callbacks.profile();
                },
            ),
            new RouteAction(
                "/launcher/v2/profileMods",
                async (url: string, info: IEmptyRequestData, sessionID: string, output: string): Promise<ILauncherV2ProfilesResponse> => {
                    return this.launcherV2Callbacks.profileMods();
                },
            ),
        ]);
    }
}
