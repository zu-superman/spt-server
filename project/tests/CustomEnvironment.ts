import "reflect-metadata";
import { container } from "tsyringe";

import NodeEnvironment from "jest-environment-node";
import type { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";

import { Container } from "@spt-aki/di/Container";
import { DatabaseImporter } from "@spt-aki/utils/DatabaseImporter";

export default class CustomEnvironment extends NodeEnvironment
{
    constructor(config: JestEnvironmentConfig, context: EnvironmentContext)
    {
        super(config, context);
    }

    async setup(): Promise<void>
    {
        await super.setup();

        await Container.registerTypes(container);

        const databaseImporter = container.resolve<DatabaseImporter>("DatabaseImporter");
        await databaseImporter.onLoad();

        this.global.container = container;
    }

    async teardown(): Promise<void>
    {
        await super.teardown();
    }
}
