import "reflect-metadata";
import { container } from "tsyringe";
import { vi, beforeAll, afterEach, describe, expect, it } from "vitest";

import { PaymentService } from "@spt-aki/services/PaymentService";

describe("PaymentService", () =>
{
    let paymentService: PaymentService;

    beforeAll(() =>
    {
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
