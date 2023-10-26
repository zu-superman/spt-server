import "reflect-metadata";
import { container } from "tsyringe";

import NodeEnvironment from "jest-environment-node";
import type { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";

import { Container } from "@spt-aki/di/Container";

export default class CustomEnvironment extends NodeEnvironment
{
    constructor(config: JestEnvironmentConfig, context: EnvironmentContext)
    {
        super(config, context);
    }

    async setup(): Promise<void>
    {
        await super.setup();

        Container.registerTypes(container);
        this.global.container = container;
    }

    async teardown(): Promise<void>
    {
        await super.teardown();
    }
}
