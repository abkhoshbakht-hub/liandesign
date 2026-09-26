"use server";

import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ── Phase C: user settings (§83) ──

async function me() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id ?? null;
}

export async function getMyProfile() {
  const id = await me();
  if (!id) throw new Error("FORBIDDEN");
  return db.user.findUnique({ where: { id }, select: { name: true, email: true } });
}

export async function updateMyName(
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = await me();
  if (!id) return { ok: false, error: "FORBIDDEN" };
  const clean = name.trim();
  if (clean.length < 2) return { ok: false, error: "نام کوتاه است" };
  await db.user.update({ where: { id }, data: { name: clean } });
  return { ok: true };
}

export async function changeMyPassword(
  current: string,
  next: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = await me();
  if (!id) return { ok: false, error: "FORBIDDEN" };
  if (next.length < 8) return { ok: false, error: "رمز جدید حداقل ۸ حرف باشد" };
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { ok: false, error: "FORBIDDEN" };
  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) return { ok: false, error: "رمز فعلی اشتباه است" };
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  await db.auditLog.create({ data: { action: "user.password_change", entity: "User", entityId: id, actorId: id } });
  return { ok: true };
}
