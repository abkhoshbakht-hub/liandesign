"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/data/coupons";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics";

async function currentUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id ? { id: user.id, role: user.role } : null;
}

export async function getUserTickets() {
  const me = await currentUser();
  if (!me) throw new Error("FORBIDDEN");
  return db.ticket.findMany({
    where: { userId: me.id },
    include: { _count: { select: { messages: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTicketForUser(id: string) {
  const me = await currentUser();
  if (!me) throw new Error("FORBIDDEN");
  return db.ticket.findFirst({
    where: { id, userId: me.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createTicket(
  subject: string,
  body: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const me = await currentUser();
  if (!me) return { ok: false, error: "LOGIN_REQUIRED" };
  if (subject.trim().length < 3) return { ok: false, error: "موضوع خیلی کوتاه است" };
  if (body.trim().length < 3) return { ok: false, error: "متن پیام خیلی کوتاه است" };
  const ticket = await db.ticket.create({
    data: {
      userId: me.id,
      subject: subject.trim().slice(0, 200),
      messages: { create: { userId: me.id, isStaff: false, body: body.trim().slice(0, 2000) } },
    },
  });
  return { ok: true, id: ticket.id };
}

export async function replyTicket(
  ticketId: string,
  body: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await currentUser();
  if (!me) return { ok: false, error: "LOGIN_REQUIRED" };
  if (body.trim().length < 2) return { ok: false, error: "متن پیام خیلی کوتاه است" };

  if (me.role === "ADMIN") {
    const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { ok: false, error: "تیکت پیدا نشد" };
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        messages: { create: { userId: me.id, isStaff: true, body: body.trim().slice(0, 2000) } },
      },
    });
    return { ok: true };
  }

  const ticket = await db.ticket.findFirst({ where: { id: ticketId, userId: me.id } });
  if (!ticket) return { ok: false, error: "تیکت پیدا نشد" };
  if (ticket.status === "CLOSED") return { ok: false, error: "این تیکت بسته شده است" };
  await db.ticket.update({
    where: { id: ticketId },
    data: {
      messages: { create: { userId: me.id, isStaff: false, body: body.trim().slice(0, 2000) } },
    },
  });
  return { ok: true };
}

export async function closeTicket(ticketId: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.ticket.update({ where: { id: ticketId }, data: { status: "CLOSED" } });
  return { ok: true };
}

export async function listTicketsAdmin(status?: "OPEN" | "CLOSED") {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.ticket.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}

export async function getTicketAdmin(id: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

// ایونت درخواست طراحی اختصاصی (§81) — سمت سرور لاگ می‌شود
export async function logCustomDesignRequest(ticketId: string): Promise<void> {
  const user = await currentUser();
  await logEvent("custom_design_request", { ticketId }, user?.id);
}
