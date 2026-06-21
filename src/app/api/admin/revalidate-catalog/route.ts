import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdminEmail } from "@/lib/auth/admin";
import { getBearerToken, verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-token";

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const verified = await verifyFirebaseIdToken(token);

    if (!isAdminEmail(verified.email)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { slug?: string };
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    revalidatePath("/");
    revalidatePath("/shop", "layout");

    if (slug) {
      revalidatePath(`/shop/${slug}`);
    }

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not revalidate storefront cache.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
