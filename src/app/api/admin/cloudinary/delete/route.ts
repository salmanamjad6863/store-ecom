import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { getBearerToken, verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-token";
import { deleteImagesFromCloudinary } from "@/lib/cloudinary/delete";

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

    const body = (await request.json()) as { urls?: string[] };
    const urls = Array.isArray(body.urls) ? body.urls.filter(Boolean) : [];

    if (urls.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    const { publicIds } = await deleteImagesFromCloudinary(urls);

    return NextResponse.json({ deleted: publicIds.length, publicIds });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cloudinary cleanup failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
