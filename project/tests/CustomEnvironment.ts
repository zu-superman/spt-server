import "reflect-metadata";

import NodeEnvironment from "jest-environment-node";
import type {EnvironmentContext} from "@jest/environment";
import type {JestEnvironmentConfig} from "@jest/environment";

import { container } from "tsyringe";
import { Container } from "@spt-aki/di/Container";

class CustomEnvironment extends NodeEnvironment
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

module.exports = CustomEnvironment;
