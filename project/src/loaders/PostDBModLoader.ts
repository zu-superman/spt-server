import { DependencyContainer, inject, injectable } from "tsyringe";

import { OnLoad } from "@spt-aki/di/OnLoad";
import { BundleLoader } from "@spt-aki/loaders/BundleLoader";
import { ModTypeCheck } from "@spt-aki/loaders/ModTypeCheck";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { IPostDBLoadModAsync } from "@spt-aki/models/external/IPostDBLoadModAsync";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LocalisationService } from "@spt-aki/services/LocalisationService";

@injectable()
export class PostDBModLoader implements OnLoad
{
    protected container: DependencyContainer;

    constructor(
        @inject("WinstonLogger") protected logger: ILogger,
        @inject("BundleLoader") protected bundleLoader: BundleLoader,
        @inject("PreAkiModLoader") protected preAkiModLoader: PreAkiModLoader,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("ModTypeCheck") protected modTypeCheck: ModTypeCheck,
    )
    {}

    public async onLoad(): Promise<void>
    {
        if (globalThis.G_MODS_ENABLED)
        {
            this.container = this.preAkiModLoader.getContainer();
            await this.executeModsAsync();
            this.addBundles();
        }
    }

    public getRoute(): string
    {
        return "aki-mods";
    }

    public getModPath(mod: string): string
    {
        return this.preAkiModLoader.getModPath(mod);
    }

    protected async executeModsAsync(): Promise<void>
    {
        const mods = this.preAkiModLoader.sortModsLoadOrder();
        for (const modName of mods)
        {
            // import class
            const filepath = `${this.preAkiModLoader.getModPath(modName)}${
                this.preAkiModLoader.getImportedModDetails()[modName].main
            }`;
            const modpath = `${process.cwd()}/${filepath}`;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require(modpath);

            if (this.modTypeCheck.isPostDBAkiLoadAsync(mod.mod))
            {
                try
                {
                    await (mod.mod as IPostDBLoadModAsync).postDBLoadAsync(this.container);
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

            if (this.modTypeCheck.isPostDBAkiLoad(mod.mod))
            {
                (mod.mod as IPostDBLoadMod).postDBLoad(this.container);
            }
        }
    }

    protected addBundles(): void
    {
        const importedMods = this.preAkiModLoader.getImportedModDetails();
        for (const [mod, pkg] of Object.entries(importedMods))
        {
            const modPath = this.preAkiModLoader.getModPath(mod);

            if (pkg.isBundleMod ?? false)
            {
                this.bundleLoader.addBundles(modPath);
            }
        }
    }
}
