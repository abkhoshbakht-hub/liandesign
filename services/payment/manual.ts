import { db } from "@/lib/db";
import type { CreatePaymentInput, PaymentProvider, PaymentStatus } from "./provider";

// Manual provider: order is recorded as PENDING and confirmed by the team.
// A real gateway (e.g. ZarinPal) will implement PaymentProvider later
// without changing any caller.
export const manualProvider: PaymentProvider = {
  name: "manual",

  async createPayment(input: CreatePaymentInput): Promise<{ reference: string; status: PaymentStatus }> {
    const reference = `MAN-${Date.now().toString(36).toUpperCase()}`;
    await db.payment.create({
      data: {
        orderId: input.orderId,
        provider: "manual",
        status: "PENDING",
        amount: input.amount,
        reference,
      },
    });
    return { reference, status: "PENDING" };
  },

  async verifyPayment(reference: string): Promise<{ status: PaymentStatus }> {
    const payment = await db.payment.findFirst({ where: { reference } });
    return { status: (payment?.status ?? "PENDING") as PaymentStatus };
  },

  async refundPayment(reference: string): Promise<{ status: PaymentStatus }> {
    await db.payment.updateMany({ where: { reference }, data: { status: "REFUNDED" } });
    await db.order.updateMany({ where: { payment: { reference } }, data: { status: "REFUNDED" } });
    return { status: "REFUNDED" };
  },

  async getPaymentStatus(reference: string): Promise<{ status: PaymentStatus }> {
    return this.verifyPayment(reference);
  },
};
