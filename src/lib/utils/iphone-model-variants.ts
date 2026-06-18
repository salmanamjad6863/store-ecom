import type { PhoneModelInput } from "@/lib/queries/phone-models";
import type { PhoneModel } from "@/types/phone-model";

import { slugify } from "./slug";

export const STANDARD_VARIANT_SUFFIXES = ["Pro Max", "Pro", ""] as const;

export type StandardVariantSuffix = (typeof STANDARD_VARIANT_SUFFIXES)[number];

export function buildIphoneModelName(generation: string, variantSuffix: string): string {
  const suffix = variantSuffix.trim();
  if (!suffix) {
    return `iPhone ${generation}`;
  }

  return `iPhone ${generation} ${suffix}`;
}

export function buildIphoneModelSlug(generation: string, variantSuffix: string): string {
  return slugify(buildIphoneModelName(generation, variantSuffix));
}

export function getStandardVariantLabel(variantSuffix: string): string {
  if (!variantSuffix) {
    return "Base";
  }

  return variantSuffix;
}

export function getStandardGenerationModels(
  generation: string,
  sortOrderStart: number,
): PhoneModelInput[] {
  return STANDARD_VARIANT_SUFFIXES.map((suffix, index) => {
    const name = buildIphoneModelName(generation, suffix);
    return {
      name,
      slug: slugify(name),
      sortOrder: sortOrderStart + index,
      active: true,
    };
  });
}

export function isDuplicatePhoneModel(slug: string, models: PhoneModel[]): boolean {
  return models.some((model) => model.slug === slug || model.id === slug);
}

export function getMissingStandardGenerationModels(
  generation: string,
  models: PhoneModel[],
  sortOrderStart: number,
): PhoneModelInput[] {
  return getStandardGenerationModels(generation, sortOrderStart).filter(
    (model) => !isDuplicatePhoneModel(model.slug, models),
  );
}

export function getAvailableStandardVariants(
  generation: string,
  models: PhoneModel[],
): StandardVariantSuffix[] {
  return STANDARD_VARIANT_SUFFIXES.filter(
    (suffix) => !isDuplicatePhoneModel(buildIphoneModelSlug(generation, suffix), models),
  );
}

export function parseIphoneGeneration(name: string): string | null {
  const match = name.match(/iPhone\s+(\d+)/i);
  return match?.[1] ?? null;
}

export function getGenerationNumbers(models: PhoneModel[]): string[] {
  const generations = new Set<string>();

  for (const model of models) {
    const generation = parseIphoneGeneration(model.name);
    if (generation) {
      generations.add(generation);
    }
  }

  return Array.from(generations).sort((a, b) => Number(b) - Number(a));
}
