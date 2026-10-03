import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
if (!m) { console.error("DATABASE_URL not found"); process.exit(1); }
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: m[1] }) });

// ariatech / gallery-amir raw source was removed from /public (paid templates),
// so their public live demo link must go too.
for (const slug of ["corporate-onepage", "portfolio-gallery"]) {
  await db.product.update({ where: { slug }, data: { demoUrl: null } });
  const p = await db.product.findUnique({ where: { slug }, select: { name: true, demoUrl: true, images: true, includes: true, fileUrl: true } });
  console.log(`${p.name} | demo=${p.demoUrl} | images=${p.images.length} | includes=${p.includes.length} | file=${p.fileUrl}`);
}

const all = await db.product.findMany({
  select: { slug: true, demoUrl: true, images: true, fileUrl: true },
  orderBy: { slug: "asc" },
});
console.log("\n--- all products ---");
for (const p of all) {
  console.log(`${p.slug.padEnd(22)} demo=${p.demoUrl ? "YES" : "-"} img=${p.images.length} file=${p.fileUrl ?? "-"}`);
}

await db.$disconnect();