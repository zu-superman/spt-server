import "reflect-metadata";

import { vi, beforeAll, afterEach, describe, expect, it } from "vitest";

import { DependencyContainer } from "tsyringe";
import { PaymentService } from "@spt-aki/services/PaymentService";

describe("PaymentService", () =>
{
    let container: DependencyContainer;
    let paymentService: PaymentService;

    beforeAll(() =>
    {
        container = global.container;
        paymentService = container.resolve<PaymentService>("PaymentService");
    });

    afterEach(() =>
    {
        vi.restoreAllMocks();
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
