import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { DEFAULT_PHONE_MODELS, slugToModelId } from "@/lib/data/default-phone-models";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import type { PhoneModel, PhoneModelDocument } from "@/types/phone-model";

import { mapPhoneModelDoc } from "./mappers";

export type PhoneModelInput = {
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

export async function fetchPhoneModels(options?: {
  activeOnly?: boolean;
}): Promise<PhoneModel[]> {
  const { activeOnly = true } = options ?? {};
  const db = getClientFirestore();

  try {
    const constraints = activeOnly ? [where("active", "==", true)] : [];
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.phoneModels), ...constraints),
    );

    const models = snapshot.docs
      .map((modelDoc) => mapPhoneModelDoc(modelDoc))
      .filter((model): model is PhoneModel => model !== null);

    if (models.length > 0) {
      return models.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    }
  } catch {
    // Fall through to defaults when collection is empty or unavailable.
  }

  return DEFAULT_PHONE_MODELS.map((model, index) => ({
    id: slugToModelId(model.slug),
    ...model,
    sortOrder: model.sortOrder ?? index + 1,
  }));
}

export async function fetchAllPhoneModelsAdmin(): Promise<PhoneModel[]> {
  return fetchPhoneModels({ activeOnly: false });
}

export async function fetchPhoneModelById(id: string): Promise<PhoneModel | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.phoneModels, id));

  const mapped = mapPhoneModelDoc(snapshot);
  if (mapped) {
    return mapped;
  }

  const fallback = DEFAULT_PHONE_MODELS.find((model) => slugToModelId(model.slug) === id);
  return fallback ? { id, ...fallback } : null;
}

export async function seedDefaultPhoneModels(): Promise<number> {
  const db = getClientFirestore();
  const existing = await getDocs(collection(db, COLLECTIONS.phoneModels));
  const existingIds = new Set(existing.docs.map((modelDoc) => modelDoc.id));

  const batch = writeBatch(db);
  let added = 0;

  for (const model of DEFAULT_PHONE_MODELS) {
    const id = slugToModelId(model.slug);
    if (existingIds.has(id)) {
      continue;
    }

    batch.set(doc(db, COLLECTIONS.phoneModels, id), {
      name: model.name,
      slug: model.slug,
      sortOrder: model.sortOrder,
      active: model.active,
    } satisfies PhoneModelDocument);
    added++;
  }

  if (added > 0) {
    await batch.commit();
  }

  return added;
}

export async function createPhoneModel(input: PhoneModelInput): Promise<string> {
  const db = getClientFirestore();
  const id = slugToModelId(input.slug);

  await setDoc(doc(db, COLLECTIONS.phoneModels, id), {
    ...input,
  } satisfies PhoneModelDocument);

  return id;
}

export async function createPhoneModelsBatch(inputs: PhoneModelInput[]): Promise<string[]> {
  if (inputs.length === 0) {
    return [];
  }

  const db = getClientFirestore();
  const batch = writeBatch(db);
  const ids: string[] = [];

  for (const input of inputs) {
    const id = slugToModelId(input.slug);
    batch.set(doc(db, COLLECTIONS.phoneModels, id), {
      ...input,
    } satisfies PhoneModelDocument);
    ids.push(id);
  }

  await batch.commit();
  return ids;
}

export async function updatePhoneModel(id: string, input: PhoneModelInput): Promise<void> {
  const db = getClientFirestore();
  await updateDoc(doc(db, COLLECTIONS.phoneModels, id), input);
}

export async function deletePhoneModel(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, COLLECTIONS.phoneModels, id));
}

export async function fetchPhoneModelBySlug(slug: string): Promise<PhoneModel | null> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.phoneModels), where("slug", "==", slug)),
  );

  const modelDoc = snapshot.docs[0];
  if (modelDoc) {
    return mapPhoneModelDoc(modelDoc);
  }

  const fallback = DEFAULT_PHONE_MODELS.find((model) => model.slug === slug);
  return fallback ? { id: slugToModelId(fallback.slug), ...fallback } : null;
}
