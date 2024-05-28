import { error } from "console";
import { inject, injectable } from "tsyringe";
import { IGlobals } from "@spt/models/eft/common/IGlobals";
import { IMatch } from "@spt/models/eft/common/tables/IMatch";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ITrader } from "@spt/models/eft/common/tables/ITrader";
import { IBots } from "@spt/models/spt/bots/IBots";
import { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import { IHideout } from "@spt/models/spt/hideout/IHideout";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ILocaleBase } from "@spt/models/spt/server/ILocaleBase";
import { ILocations } from "@spt/models/spt/server/ILocations";
import { IServerBase } from "@spt/models/spt/server/IServerBase";
import { ISettingsBase } from "@spt/models/spt/server/ISettingsBase";
import { ITemplates } from "@spt/models/spt/templates/ITemplates";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { LocalisationService } from "./LocalisationService";

@injectable()
export class DatabaseService
{
    protected locationConfig: ILocationConfig;

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("DatabaseServer") protected databaseServer: DatabaseServer,
        @inject("LocalisationService") protected localisationService: LocalisationService,
    )
    {
    }

    /**
     * @returns assets/database/
     */
    public getTables(): IDatabaseTables
    {
        return this.databaseServer.getTables();
    }

    /**
     * @returns assets/database/bots/
     */
    public getBots(): IBots
    {
        if (!this.databaseServer.getTables().bots)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/bots"));
        }

        return this.databaseServer.getTables().bots!;
    }

    /**
     * @returns assets/database/globals.json
     */
    public getGlobals(): IGlobals
    {
        if (!this.databaseServer.getTables().globals)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/globals.json"));
        }

        return this.databaseServer.getTables().globals!;
    }

    /**
     * @returns assets/database/hideout/
     */
    public getHideout(): IHideout
    {
        if (!this.databaseServer.getTables().hideout)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/hideout"));
        }

        return this.databaseServer.getTables().hideout!;
    }

    /**
     * @returns assets/database/locales/
     */
    public getLocales(): ILocaleBase
    {
        if (!this.databaseServer.getTables().locales)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/locales"));
        }

        return this.databaseServer.getTables().locales!;
    }

    /**
     * @returns assets/database/locations
     */
    public getLocations(): ILocations
    {
        if (!this.databaseServer.getTables().locales)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/locales"));
        }

        return this.databaseServer.getTables().locations!;
    }

    /**
     * @returns assets/database/match/
     */
    public getMatch(): IMatch
    {
        if (!this.databaseServer.getTables().locales)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/locales"));
        }

        return this.databaseServer.getTables().match!;
    }

    /**
     * @returns assets/database/server.json
     */
    public getServer(): IServerBase
    {
        if (!this.databaseServer.getTables().locales)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/locales"));
        }

        return this.databaseServer.getTables().server!;
    }

    /**
     * @returns assets/database/settings.json
     */
    public getSettings(): ISettingsBase
    {
        if (!this.databaseServer.getTables().locales)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/locales"));
        }

        return this.databaseServer.getTables().settings!;
    }

    /**
     * @returns assets/database/templates/
     */
    public getTemplates(): ITemplates
    {
        if (!this.databaseServer.getTables().templates)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/templates"));
        }

        return this.databaseServer.getTables().templates!;
    }

    /**
     * @returns assets/database/templates/items.json
     */
    public getItems(): Record<string, ITemplateItem>
    {
        if (!this.databaseServer.getTables().templates!.items)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/templates/items.json"));
        }

        return this.databaseServer.getTables().templates!.items!;
    }

    /**
     * @returns assets/database/traders/
     */
    public getTraders(): Record<string, ITrader>
    {
        if (!this.databaseServer.getTables().traders)
        {
            throw new error(this.localisationService.getText("database-data_at_path_missing", "assets/database/traders"));
        }

        return this.databaseServer.getTables().traders!;
    }
}
