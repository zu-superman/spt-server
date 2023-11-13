import "reflect-metadata";
import { DependencyContainer, Lifecycle, container } from "tsyringe";

import path from "node:path";
import { Container } from "@spt-aki/di/Container";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import type { Environment } from "vitest";

// Manually mock the logger.
import { WinstonLogger } from "@tests/__mocks__/WinstonLogger.mock";

export default <Environment>{
    name: "spt-aki-server",
    transformMode: "ssr",
    async setup()
    {
        // Register all of the dependencies in the container.
        Container.registerTypes(container);
        Container.registerListTypes(container);

        // Override registration to the container.
        container.register<WinstonLogger>("WinstonLogger", WinstonLogger, { lifecycle: Lifecycle.Singleton });

        // Import the database.
        await importDatabase(container);

        return {
            async teardown()
            {},
        };
    },
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
