import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";

// For the Vitest Custom Environment.
import type { Environment } from "vitest";
import { populateGlobal } from "vitest/environments";
import { Container } from "@spt-aki/di/Container";

// Required for importing the database.
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";

// Required for creating a temporary test account/profile.
import path from "node:path";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import { LauncherController } from "@spt-aki/controllers/LauncherController";
import { IRegisterData } from "@spt-aki/models/eft/launcher/IRegisterData";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { ProfileController } from "@spt-aki/controllers/ProfileController";
import { IProfileCreateRequestData } from "@spt-aki/models/eft/profile/IProfileCreateRequestData";

export default <Environment> {
    name: "spt-aki-server",
    transformMode: "ssr",
    async setup()
    {
        // Register all of the dependencies in the container.
        Container.registerTypes(container);
        Container.registerListTypes(container);

        // Import the database.
        await importDatabase(container);

        // Create a temporary test account/profile.
        const sessionId = await createTestAccount();

        // Populate the global scope with the session ID of the test account/profile.
        populateGlobal(global, { sessionId: sessionId });

        return {
            async teardown()
            {
                // Delete the temporary test account/profile.
                await deleteTestAccount(sessionId);
            }
        };
    }
};

/**
 * Reads the database JSON files and imports them into memory.
 *
 * @param container The dependency container.
 * @returns A void promise.
 */
async function importDatabase(container: DependencyContainer): Promise<void>
{
    const importerUtil = container.resolve<ImporterUtil>("ImporterUtil");
    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

    // Read the data from the JSON files.
    const databaseDir = path.resolve("./assets/database");
    const dataToImport = await importerUtil.loadAsync<IDatabaseTables>(`${databaseDir}/`);

    // Save the data to memory.
    databaseServer.setTables(dataToImport);
}

/**
 * Creates a temporary test account/profile for testing purposes. Is deleted after testing is completed. The account is
 * created with a random username, and the profile is created with the same username.
 *
 * @returns The session id of the created profile.
 */
async function createTestAccount(): Promise<string>
{
    const launcherController = container.resolve<LauncherController>("LauncherController");
    const randomUtil = container.resolve<RandomUtil>("RandomUtil");
    const profileController = container.resolve<ProfileController>("ProfileController");

    const username = `DarkHelmet-Test-${randomUtil.randInt(999999)}`;

    // Register a new account.
    const registerData: IRegisterData = {
        edition: "Standard",
        username: username,
        password: "12345" // Get it? Heh
    };
    const sessionId = launcherController.register(registerData);

    // It *could* happen. I guess.
    if (!sessionId)
    {
        throw new Error("Failed to register a test account. Account already exists with this random username. Crazy.");
    }

    // Create a new profile for the account.
    const profileCreateRequestData: IProfileCreateRequestData = {
        side: "Usec",
        nickname: username,
        headId: "5cde96047d6c8b20b577f016",
        voiceId: "5fc1223595572123ae7384a3"
    };
    profileController.createProfile(profileCreateRequestData, sessionId);

    return sessionId;
}

/**
 * Deletes the temporary test account/profile.
 *
 * @param $sessionId Session id of the profile to delete.
 * @returns true when deleted, false when profile not found.
 */
async function deleteTestAccount($sessionId: string): Promise<boolean>
{
    const saveServer = container.resolve<SaveServer>("SaveServer");
    return saveServer.removeProfile($sessionId);
}
