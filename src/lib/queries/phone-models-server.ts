import { collection, getDocs, query, where } from "firebase/firestore";

import { DEFAULT_PHONE_MODELS, slugToModelId } from "@/lib/data/default-phone-models";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getServerFirestore } from "@/lib/firebase/server";
import type { PhoneModel } from "@/types/phone-model";

import { mapPhoneModelDoc } from "./mappers";

export async function fetchPhoneModelsOnServer(options?: {
  activeOnly?: boolean;
}): Promise<PhoneModel[]> {
  const { activeOnly = true } = options ?? {};
  const db = getServerFirestore();

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
