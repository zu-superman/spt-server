import { LauncherV2Controller } from "@spt/controllers/LauncherV2Controller";
import { ProfileController } from "@spt/controllers/ProfileController";
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
import { SaveServer } from "@spt/servers/SaveServer";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { Watermark } from "@spt/utils/Watermark";
import { inject, injectable } from "tsyringe";

@injectable()
export class LauncherV2Callbacks {

    constructor(
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("LauncherV2Controller") protected launcherV2Controller: LauncherV2Controller,
        @inject("ProfileController") protected profileController: ProfileController,
        @inject("SaveServer") protected saveServer: SaveServer,
        @inject("Watermark") protected watermark: Watermark,
    ) { }

    public ping(): ILauncherV2PingResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.ping(),
        });
    }

    public types(): ILauncherV2TypesResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.types(),
        })
    }

    public login(info: ILoginRequestData): ILauncherV2LoginResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.login(info),
        })
    }

    public register(info: IRegisterData): ILauncherV2RegisterResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.register(info),
            profiles: this.profileController.getMiniProfiles(),
        })
    }

    public passwordChange(info: IChangeRequestData): ILauncherV2PasswordChangeResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.passwordChange(info),
            profiles: this.profileController.getMiniProfiles(),
        })
    }

    public remove(info: ILoginRequestData): ILauncherV2RemoveResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.remove(info),
            profiles: this.profileController.getMiniProfiles(),
        })
    }

    public compatibleVersion(): ILauncherV2VersionResponse {
        return this.httpResponse.noBody({
            response: {
                sptVersion: this.launcherV2Controller.sptVersion(),
                eftVersion: this.launcherV2Controller.eftVersion(),
            }
        })
    }

    public mods(): ILauncherV2ModsResponse {
        return this.httpResponse.noBody({
            response: this.launcherV2Controller.loadedMods(),
        })
    }

    public profiles(): ILauncherV2ProfilesResponse {
        return this.httpResponse.noBody({
            response: this.profileController.getMiniProfiles(),
        })
    }

    public profile(): any {
        throw new Error("Method not implemented.");
    }

    public profileMods(): any {
        throw new Error("Method not implemented.");
    }
}