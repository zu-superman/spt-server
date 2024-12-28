import type { PrestigeController } from "@spt/controllers/PrestigeController";
import { HttpServerHelper } from "@spt/helpers/HttpServerHelper";
import type { IEmptyRequestData } from "@spt/models/eft/common/IEmptyRequestData";
import type { IGetBodyResponseData } from "@spt/models/eft/httpResponse/IGetBodyResponseData";
import { IGetPrestigeResponse } from "@spt/models/eft/prestige/IGetPrestigeResponse";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class PrestigeCallbacks {
    constructor(
        @inject("HttpServerHelper") protected httpServerHelper: HttpServerHelper,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("PrestigeController") protected prestigeController: PrestigeController,
    ) {}

    /** Handle client/prestige/list */
    public getPrestige(
        url: string,
        info: IEmptyRequestData,
        sessionID: string,
    ): IGetBodyResponseData<IGetPrestigeResponse> {
        return this.httpResponse.getBody(this.prestigeController.getPrestige(sessionID, info));
    }

    /** Handle client/prestige/obtain */
    public obtainPrestige(url: string, info: IEmptyRequestData, sessionID: string): IGetBodyResponseData<any> {
        return this.httpResponse.getBody(this.prestigeController.obtainPrestige(sessionID, info));
    }
}
