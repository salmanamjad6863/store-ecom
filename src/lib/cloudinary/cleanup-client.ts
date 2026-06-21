import { getClientAuth } from "@/lib/firebase/client";

export async function cleanupCloudinaryImages(urls: string[]): Promise<void> {
  if (urls.length === 0) {
    return;
  }

  const user = getClientAuth().currentUser;

  if (!user) {
    console.warn("[cloudinary] Skipping cleanup: no authenticated user.");
    return;
  }

  const token = await user.getIdToken();
  const response = await fetch("/api/admin/cloudinary/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Cloudinary cleanup failed.");
  }
}
