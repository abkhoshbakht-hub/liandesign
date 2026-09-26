"use server";

import { db } from "@/lib/db";
import {
  sanitizeValues,
  type CustomizationOptionDTO,
  type CustomValues,
} from "@/lib/customizer-utils";

function toDTO(o: {
  key: string;
  label: string;
  type: string;
  choices: unknown;
}): CustomizationOptionDTO {
  return {
    key: o.key,
    label: o.label,
    type: o.type as CustomizationOptionDTO["type"],
    choices: o.choices as CustomizationOptionDTO["choices"],
  };
}

export async function getCustomizationOptions(): Promise<CustomizationOptionDTO[]> {
  const options = await db.customizationOption.findMany({
    where: { active: true },
    orderBy: { key: "asc" },
  });
  return options.map(toDTO);
}

export async function getCustomization(
  userId: string,
  websiteId: string
): Promise<CustomValues | null> {
  const row = await db.customization.findUnique({
    where: { userId_websiteId: { userId, websiteId } },
  });
  return row ? (row.values as CustomValues) : null;
}

export async function saveCustomization(
  userId: string,
  websiteId: string,
  values: CustomValues
): Promise<{ ok: true } | { ok: false; error: string }> {
  const website = await db.website.findFirst({ where: { id: websiteId, status: "PUBLISHED" } });
  if (!website) return { ok: false, error: "سایت پیدا نشد" };

  const options = await getCustomizationOptions();
  const clean = sanitizeValues(options, values);

  await db.customization.upsert({
    where: { userId_websiteId: { userId, websiteId } },
    update: { values: clean },
    create: { userId, websiteId, values: clean },
  });
  return { ok: true };
}
