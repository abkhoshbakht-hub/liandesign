import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// آپلود بنر (§55): فقط تصویر، سقف ۲MB، نام یکتا
// NOTE تولید: Object Storage (S3/Blob) جایگزین شود — مسیر از env خوانده شود.
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ ok: false, error: "فایل لازم است" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "فقط PNG/JPG/WebP/GIF" }, { status: 400 });
    }
    if (file.size > MAX_BYTES || file.size === 0) {
      return NextResponse.json({ ok: false, error: "حجم باید کمتر از ۲ مگابایت باشد" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] ?? "png";
    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads", "ads");
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, name), buf);
    return NextResponse.json({ ok: true, url: `/uploads/ads/${name}` });
  } catch {
    return NextResponse.json({ ok: false, error: "خطا در آپلود" }, { status: 500 });
  }
}
