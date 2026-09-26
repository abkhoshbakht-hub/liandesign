"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "این ایمیل قبلاً ثبت شده است" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  return { ok: true };
}
