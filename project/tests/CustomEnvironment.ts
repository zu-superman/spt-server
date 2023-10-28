import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";
import path from "node:path";

// For the Vitest Custom Environment.
import type { Environment } from "vitest";

// Import everything we intend to test so we can register it in the Jest custom environment.
import { Container } from "@spt-aki/di/Container";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";

export default <Environment> {
    name: "spt-aki-server",
    transformMode: "ssr",
    async setup()
    {
        Container.registerTypes(container);
        Container.registerListTypes(container);

        // Import the database.
        await importDatabase(container);

        // TODO: Create test account/profile

        return {
            teardown()
            {
                // TODO: Delete test account/profile
            }
        };
    }
};

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
