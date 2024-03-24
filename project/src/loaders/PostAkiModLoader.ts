import { DependencyContainer, inject, injectable } from "tsyringe";

import { ModTypeCheck } from "@spt-aki/loaders/ModTypeCheck";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostAkiLoadModAsync } from "@spt-aki/models/external/IPostAkiLoadModAsync";
import { IModLoader } from "@spt-aki/models/spt/mod/IModLoader";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LocalisationService } from "@spt-aki/services/LocalisationService";

@injectable()
export class PostAkiModLoader implements IModLoader
{
    protected container: DependencyContainer;

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("PreAkiModLoader") protected preAkiModLoader: PreAkiModLoader,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("ModTypeCheck") protected modTypeCheck: ModTypeCheck,
    )
    {}

    public getModPath(mod: string): string
    {
        return this.preAkiModLoader.getModPath(mod);
    }

    public async load(): Promise<void>
    {
        if (globalThis.G_MODS_ENABLED)
        {
            this.container = this.preAkiModLoader.getContainer();
            await this.executeModsAsync();
        }
    }

    protected async executeModsAsync(): Promise<void>
    {
        const mods = this.preAkiModLoader.sortModsLoadOrder();
        for (const modName of mods)
        {
            // // import class
            const filepath = `${this.preAkiModLoader.getModPath(modName)}${
                this.preAkiModLoader.getImportedModDetails()[modName].main
            }`;
            const modpath = `${process.cwd()}/${filepath}`;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require(modpath);

            if (this.modTypeCheck.isPostAkiLoadAsync(mod.mod))
            {
                try
                {
                    await (mod.mod as IPostAkiLoadModAsync).postAkiLoadAsync(this.container);
                }
                catch (err)
                {
                    this.logger.error(
                        this.localisationService.getText(
                            "modloader-async_mod_error",
                            `${err?.message ?? ""}\n${err.stack ?? ""}`,
                        ),
                    );
                }
            }

            if (this.modTypeCheck.isPostAkiLoad(mod.mod))
            {
                (mod.mod as IPostAkiLoadMod).postAkiLoad(this.container);
            }
        }
    }
}
