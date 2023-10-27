import "reflect-metadata";
import { DependencyContainer } from "tsyringe";

import { PaymentService } from "@spt-aki/services/PaymentService";

describe("PaymentService", () =>
{
    let container: DependencyContainer;
    let paymentService: PaymentService;

    beforeAll(() =>
    {
        container = globalThis.container;
        paymentService = container.resolve<PaymentService>("PaymentService");
    });

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    describe("should be registered", () =>
    {
        it("should be registered", () =>
        {
            expect(paymentService).toBeDefined();
            expect(container.isRegistered("PaymentService")).toBe(true);
        });
    });
});
