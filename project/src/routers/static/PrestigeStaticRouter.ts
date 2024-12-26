import type { PrestigeCallbacks } from "@project/src/callbacks/PrestigeCallbacks";
import type { IGetBodyResponseData } from "@project/src/models/eft/httpResponse/IGetBodyResponseData";
import { RouteAction, StaticRouter } from "@spt/di/Router";
import { inject, injectable } from "tsyringe";

@injectable()
export class PrestigeStaticRouter extends StaticRouter {
    constructor(@inject("PrestigeCallbacks") protected prestigeCallbacks: PrestigeCallbacks) {
        super([
            new RouteAction(
                "/client/prestige/list",
                async (
                    url: string,
                    info: any,
                    sessionID: string,
                    output: string,
                ): Promise<IGetBodyResponseData<any>> => {
                    return this.prestigeCallbacks.getPrestige(url, info, sessionID);
                },
            ),

            new RouteAction(
                "/client/prestige/obtain",
                async (
                    url: string,
                    info: any,
                    sessionID: string,
                    _output: string,
                ): Promise<IGetBodyResponseData<any>> => {
                    return this.prestigeCallbacks.obtainPrestige(url, info, sessionID);
                },
            ),
        ]);
    }
}
