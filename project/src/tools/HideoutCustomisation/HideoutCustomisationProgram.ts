import "reflect-metadata";
import "source-map-support/register";

import { ErrorHandler } from "@spt/ErrorHandler";
import { Container } from "@spt/di/Container";
import { HideoutCustomisationGen } from "@spt/tools/HideoutCustomisation/HideoutCustomisationGen";
import { Lifecycle, container } from "tsyringe";

export class HideoutCustomisationProgram {
    constructor() {
        // set window properties
        process.stdout.setEncoding("utf8");
        process.title = "SPT hideoutCustomisationProgram";
    }

    public async start(): Promise<void> {
        try {
            Container.registerTypes(container);
            const childContainer = container.createChildContainer();

            Container.registerListTypes(childContainer);
            container.register<HideoutCustomisationGen>("HideoutCustomisationGen", HideoutCustomisationGen, {
                lifecycle: Lifecycle.Singleton,
            });

            Container.registerListTypes(childContainer);
            Container.registerPostLoadTypes(container, childContainer);

            childContainer.resolve<HideoutCustomisationGen>("HideoutCustomisationGen").run();
        } catch (err: unknown) {
            new ErrorHandler().handleCriticalError(err instanceof Error ? err : new Error(String(err)));
        }

        // Kill the process, something holds it open so we need to manually kill it
        process.exit();
    }
}

const program = new HideoutCustomisationProgram();
program.start();
