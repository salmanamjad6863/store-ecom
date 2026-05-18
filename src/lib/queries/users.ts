import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getClientFirestore } from "@/lib/firebase/client";
import { timestampToDate } from "@/lib/utils/firestore";
import type { UserProfile, UserProfileDocument } from "@/types/user";

type UpsertUserProfileInput = {
  email: string;
  displayName?: string;
  phone?: string;
};

export async function upsertUserProfile(
  uid: string,
  data: UpsertUserProfileInput,
): Promise<void> {
  const db = getClientFirestore();
  const userRef = doc(db, COLLECTIONS.users, uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    return;
  }

  await setDoc(userRef, {
    email: data.email,
    ...(data.displayName ? { displayName: data.displayName } : {}),
    ...(data.phone ? { phone: data.phone } : {}),
    createdAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as UserProfileDocument;

  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    phone: data.phone,
    createdAt: timestampToDate(data.createdAt as never) ?? new Date(),
  };
}
