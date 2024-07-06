import { inject, injectable } from "tsyringe";
import { ApplicationContext } from "@spt/context/ApplicationContext";
import { ContextVariableType } from "@spt/context/ContextVariableType";
import { LocationLootGenerator } from "@spt/generators/LocationLootGenerator";
import { ILocationBase } from "@spt/models/eft/common/ILocationBase";
import { ILocationsGenerateAllResponse } from "@spt/models/eft/common/ILocationsSourceDestinationBase";
import { ILooseLoot, SpawnpointTemplate } from "@spt/models/eft/common/ILooseLoot";
import { IGetAirdropLootResponse } from "@spt/models/eft/location/IGetAirdropLootResponse";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ILocationConfig } from "@spt/models/spt/config/ILocationConfig";
import { IRaidChanges } from "@spt/models/spt/location/IRaidChanges";
import { ILocations } from "@spt/models/spt/server/ILocations";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { AirdropService } from "@spt/services/AirdropService";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { RaidTimeAdjustmentService } from "@spt/services/RaidTimeAdjustmentService";
import { ICloner } from "@spt/utils/cloners/ICloner";
import { TimeUtil } from "@spt/utils/TimeUtil";

@injectable()
export class LocationController
{
    protected locationConfig: ILocationConfig;

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("LocationLootGenerator") protected locationLootGenerator: LocationLootGenerator,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("RaidTimeAdjustmentService") protected raidTimeAdjustmentService: RaidTimeAdjustmentService,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("AirdropService") protected airdropService: AirdropService,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("ApplicationContext") protected applicationContext: ApplicationContext,
        @inject("PrimaryCloner") protected cloner: ICloner,
    )
    {
        this.locationConfig = this.configServer.getConfig(ConfigTypes.LOCATION);
    }

    /**
     * Generate a maps base location and loot
     * @param name Map name
     * @returns ILocationBase
     */
    public generate(name: string): ILocationBase
    {
        const location = this.databaseService.getLocation(name);
        const locationBaseClone = this.cloner.clone(location.base);

        // Update datetime property to now
        locationBaseClone.UnixDateTime = this.timeUtil.getTimestamp();

        // Don't generate loot for hideout
        if (name === "hideout")
        {
            return locationBaseClone;
        }

        // Check for a loot multipler adjustment in app context and apply if one is found
        let locationConfigClone: ILocationConfig;
        const raidAdjustments = this.applicationContext
            .getLatestValue(ContextVariableType.RAID_ADJUSTMENTS)
            ?.getValue<IRaidChanges>();
        if (raidAdjustments)
        {
            locationConfigClone = this.cloner.clone(this.locationConfig); // Clone values so they can be used to reset originals later
            this.raidTimeAdjustmentService.makeAdjustmentsToMap(raidAdjustments, locationBaseClone);
        }

        const staticAmmoDist = this.cloner.clone(location.staticAmmo);

        // Create containers and add loot to them
        const staticLoot = this.locationLootGenerator.generateStaticContainers(locationBaseClone, staticAmmoDist);
        locationBaseClone.Loot.push(...staticLoot);

        // Add dynamic loot to output loot
        const dynamicLootDistClone: ILooseLoot = this.cloner.clone(location.looseLoot);
        const dynamicSpawnPoints: SpawnpointTemplate[] = this.locationLootGenerator.generateDynamicLoot(
            dynamicLootDistClone,
            staticAmmoDist,
            name,
        );
        for (const spawnPoint of dynamicSpawnPoints)
        {
            locationBaseClone.Loot.push(spawnPoint);
        }

        // Done generating, log results
        this.logger.success(
            this.localisationService.getText("location-dynamic_items_spawned_success", dynamicSpawnPoints.length),
        );
        this.logger.success(this.localisationService.getText("location-generated_success", name));

        // Reset loot multipliers back to original values
        if (raidAdjustments)
        {
            this.logger.debug("Resetting loot multipliers back to their original values");
            this.locationConfig.staticLootMultiplier = locationConfigClone.staticLootMultiplier;
            this.locationConfig.looseLootMultiplier = locationConfigClone.looseLootMultiplier;

            this.applicationContext.clearValues(ContextVariableType.RAID_ADJUSTMENTS);
        }

        return locationBaseClone;
    }

    /**
     * Handle client/locations
     * Get all maps base location properties without loot data
     * @param sessionId Players Id
     * @returns ILocationsGenerateAllResponse
     */
    public generateAll(sessionId: string): ILocationsGenerateAllResponse
    {
        const locationsFromDb = this.databaseService.getLocations();
        const locations: ILocations = {};
        for (const mapName in locationsFromDb)
        {
            const mapBase = locationsFromDb[mapName]?.base;
            if (!mapBase)
            {
                this.logger.debug(`Map: ${mapName} has no base json file, skipping generation`);
                continue;
            }

            // Clear out loot array
            mapBase.Loot = [];
            // Add map base data to dictionary
            locations[mapBase._Id] = mapBase;
        }

        return { locations: locations, paths: locationsFromDb.base.paths };
    }

    public getAirdropLoot(): IGetAirdropLootResponse
    {
        return this.airdropService.generateAirdropLoot();
    }
}
