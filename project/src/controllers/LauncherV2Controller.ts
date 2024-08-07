import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { IChangeRequestData } from "@spt/models/eft/launcher/IChangeRequestData";
import { ILoginRequestData } from "@spt/models/eft/launcher/ILoginRequestData";
import { IRegisterData } from "@spt/models/eft/launcher/IRegisterData";
import { Info } from "@spt/models/eft/profile/ISptProfile";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ICoreConfig } from "@spt/models/spt/config/ICoreConfig";
import { IPackageJsonData } from "@spt/models/spt/mod/IPackageJsonData";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { SaveServer } from "@spt/servers/SaveServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { HashUtil } from "@spt/utils/HashUtil";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { TimeUtil } from "@spt/utils/TimeUtil";
import { Watermark } from "@spt/utils/Watermark";
import { inject, injectable } from "tsyringe";

@injectable()
export class LauncherV2Controller {
    protected coreConfig: ICoreConfig

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("ConfigServer") protected configServer: ConfigServer,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("SaveServer") protected saveServer: SaveServer,
        @inject("HashUtil") protected hashUtil: HashUtil,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("Watermark") protected watermark: Watermark,
        @inject("PreSptModLoader") protected preSptModLoader: PreSptModLoader,
    ) {
        this.coreConfig = this.configServer.getConfig(ConfigTypes.CORE);
    }

    /**
     * Returns a simple string of pong!
     * @returns "pong!"
     */
    public ping(): string {
        return "pong!";
    }

    /**
     * Returns all available profile types and descriptions for creation.
     * - This is also localised.
     *
     * @returns Record of Profile types and Descriptions
     */
    public types(): Record<string, string> {

        const profileRecord: Record<string, string> = {};

        // Get all possible profile types, excluding blacklisted ones
        const profileKeys = Object.keys(this.databaseService.getProfiles()).filter(
            (key) => !this.coreConfig.features.createNewProfileTypesBlacklist.includes(key),
        );

        // Add them to record with description
        for (const profileKey in profileKeys) {
            profileRecord[profileKey] = this.getProfileDescription(profileKey);
        }

        return profileRecord;
    }

    /**
     * Returns a string that represents the Profile types description.
     * - This is also localised.
     *
     * @param key Profile Type Name: eg "standard"
     * @returns Profile Type Description
     */
    protected getProfileDescription(key: string): string {
        const dbProfiles = this.databaseService.getProfiles();
        const descKey = dbProfiles[key]?.descriptionLocaleKey;
        if (!descKey) {
            this.logger.warning(this.localisationService.getText("launcher-missing_property", key));
            return "";
        }

        return this.localisationService.getText(key);
    }

    /**
     * Checks if login details were correct.
     *
     * @param info ILoginRequestData
     * @returns If login was successful or not
     */
    public login(info: ILoginRequestData): boolean {
        const sessionID = this.getSessionID(info);

        if (!sessionID) {
            return false;
        }

        return true;
    }

    /**
     * Register a new profile.
     *
     * @param info IRegisterData
     * @returns If register was successful or not
     */
    public register(info: IRegisterData): boolean {
        for (const sessionID in this.saveServer.getProfiles()) {
            if (info.username === this.saveServer.getProfile(sessionID).info.username) {
                return false;
            }
        }

        this.createAccount(info);
        return true;
    }

    /**
     * Make a password change.
     *
     * @param info IChangeRequestData
     * @returns If change was successful or not
     */
    public passwordChange(info: IChangeRequestData): boolean {
        const sessionID = this.getSessionID(info);

        if (!sessionID) {
            return false;
        }

        this.saveServer.getProfile(sessionID).info.password = info.change;
        return true;
    }

    /**
     * Remove profile from server.
     *
     * @param info ILoginRequestData
     * @returns If removal was successful or not
     */
    public remove(info: ILoginRequestData): boolean {
        const sessionID = this.getSessionID(info);

        if (!sessionID) {
            return false;
        }

        return this.saveServer.removeProfile(sessionID);
    }

    /**
     * Gets the Servers SPT Version.
     *
     * @returns "3.10.0"
     */
    public sptVersion(): string {
        return this.watermark.getVersionTag();
    }

    /**
     * Gets the compatible EFT Version.
     *
     * @returns "0.14.9.31124"
     */
    public eftVersion(): string {
        return this.coreConfig.compatibleTarkovVersion;
    }

    /**
     * Gets the Servers loaded mods.
     *
     * @returns Record of Mod names to Mod Package Json Details
     */
    public loadedMods(): Record<string, IPackageJsonData> {
        return this.preSptModLoader.getImportedModDetails();
    }

    /**
     * Creates the account from provided details.
     *
     * @param info IRegisterData
     * @returns ProfileID of new account
     */
    protected createAccount(info: IRegisterData): string {
        const profileId = this.generateProfileId();
        const scavId = this.generateProfileId();
        const newProfileDetails: Info = {
            id: profileId,
            scavId: scavId,
            aid: this.hashUtil.generateAccountId(),
            username: info.username,
            password: info.password,
            wipe: true,
            edition: info.edition,
        };
        this.saveServer.createProfile(newProfileDetails);

        this.saveServer.loadProfile(profileId);
        this.saveServer.saveProfile(profileId);

        return profileId;
    }

    /**
     * Generates a new ProfileID to use.
     *
     * @returns ProfileID generated
     */
    protected generateProfileId(): string {
        const timestamp = this.timeUtil.getTimestamp();

        return this.formatID(timestamp, timestamp * this.randomUtil.getInt(1, 1000000));
    }

    /**
     * Formats ID by lower-casing.
     *
     * @param timeStamp number
     * @param counter number
     * @returns Formatted ID
     */
    protected formatID(timeStamp: number, counter: number): string {
        const timeStampStr = timeStamp.toString(16).padStart(8, "0");
        const counterStr = counter.toString(16).padStart(16, "0");

        return timeStampStr.toLowerCase() + counterStr.toLowerCase();
    }

    /**
     * Gets ProfileID from profile.
     *
     * @param info ILoginRequestData
     * @returns ProfileID if successful otherwise empty string
     */
    protected getSessionID(info: ILoginRequestData): string {
        for (const sessionID in this.saveServer.getProfiles()) {
            const account = this.saveServer.getProfile(sessionID).info;
            if (info.username === account.username && info.password === account.password) {
                return sessionID;
            }
        }

        return "";
    }
}