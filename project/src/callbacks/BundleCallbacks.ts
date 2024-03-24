import { inject, injectable } from "tsyringe";

import { BundleLoader } from "@spt-aki/loaders/BundleLoader";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IHttpConfig } from "@spt-aki/models/spt/config/IHttpConfig";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";

@injectable()
export class BundleCallbacks
{
    protected httpConfig: IHttpConfig;

    constructor(
        @inject("HttpResponseUtil") protected httpResponse: HttpResponseUtil,
        @inject("BundleLoader") protected bundleLoader: BundleLoader,
        @inject("ConfigServer") protected configServer: ConfigServer,
    )
    {
        this.httpConfig = this.configServer.getConfig(ConfigTypes.HTTP);
    }

    /**
     * Handle singleplayer/bundles
     */
    public getBundles(url: string, info: any, sessionID: string): string
    {
        const local = this.httpConfig.ip === "127.0.0.1" || this.httpConfig.ip === "localhost";
        return this.httpResponse.noBody(this.bundleLoader.getBundles(local));
    }

    public getBundle(url: string, info: any, sessionID: string): string
    {
        return "BUNDLE";
    }
}
