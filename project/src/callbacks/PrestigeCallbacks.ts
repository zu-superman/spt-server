import type { PrestigeController } from "@spt/controllers/PrestigeController";
import { HttpServerHelper } from "@spt/helpers/HttpServerHelper";
import type { IEmptyRequestData } from "@spt/models/eft/common/IEmptyRequestData";
import type { IGetBodyResponseData } from "@spt/models/eft/httpResponse/IGetBodyResponseData";
import type { INotifierChannel } from "@spt/models/eft/notifier/INotifier";
import { HttpResponseUtil } from "@spt/utils/HttpResponseUtil";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class PrestigeCallbacks {
    constructor(
        @inject("HttpServerHelper") protected httpServerHelper: HttpServerHelper,
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("JsonUtil") protected jsonUtil: JsonUtil,
        @inject("PrestigeController") protected prestigeController: PrestigeController,
    ) {}

    /** Handle client/prestige/list */
    public getPrestige(
        url: string,
        info: IEmptyRequestData,
        sessionID: string,
    ): IGetBodyResponseData<INotifierChannel> {
        return this.httpResponse.getBody(this.prestigeController.getPrestige(sessionID, info));
    }

    /** Handle client/prestige/obtain */
    public obtainPrestige(
        url: string,
        info: IEmptyRequestData,
        sessionID: string,
    ): IGetBodyResponseData<INotifierChannel> {
        return this.httpResponse.getBody(this.prestigeController.obtainPrestige(sessionID, info));
    }
}
