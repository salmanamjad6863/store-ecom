import type { PhoneModel } from "@/types/phone-model";

export type PhoneModelGroup = {
  generation: string;
  label: string;
  models: PhoneModel[];
};

function parseGeneration(name: string): string | null {
  const match = name.match(/iPhone\s+(\d+)/i);
  return match?.[1] ?? null;
}

/** Group catalog models by iPhone generation (17, 16, 15, …). */
export function groupPhoneModelsByGeneration(models: PhoneModel[]): PhoneModelGroup[] {
  const groups = new Map<string, PhoneModelGroup>();

  for (const model of models) {
    const generation = parseGeneration(model.name) ?? model.id;
    const label = parseGeneration(model.name) ? `iPhone ${generation}` : model.name;

    const existing = groups.get(generation);
    if (existing) {
      existing.models.push(model);
      continue;
    }

    groups.set(generation, { generation, label, models: [model] });
  }

  return Array.from(groups.values())
    .sort((a, b) => {
      const aNum = Number(a.generation);
      const bNum = Number(b.generation);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return bNum - aNum;
      }
      return a.label.localeCompare(b.label);
    })
    .map((group) => ({
      ...group,
      models: [...group.models].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    }));
}

/** Short label inside a generation accordion (e.g. "17 Pro Max", "17"). */
export function getPhoneModelVariantLabel(model: PhoneModel, generation: string): string {
  const base = `iPhone ${generation}`;
  if (model.name === base) {
    return generation;
  }

  return model.name.replace(/^iPhone\s+/i, "");
}
