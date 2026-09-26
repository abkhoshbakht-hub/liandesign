// Payment architecture (MASTER PROMPT §24).
// The provider is ABSTRACT — a real gateway plugs in later.
// Nothing here talks to any bank; manual review comes first.

export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

export interface CreatePaymentInput {
  orderId: string;
  amount: number; // تومان
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<{ reference: string; status: PaymentStatus }>;
  verifyPayment(reference: string): Promise<{ status: PaymentStatus }>;
  refundPayment(reference: string): Promise<{ status: PaymentStatus }>;
  getPaymentStatus(reference: string): Promise<{ status: PaymentStatus }>;
}
