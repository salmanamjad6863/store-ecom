export async function revalidateStorefrontCatalog(token: string, slug?: string): Promise<void> {
  const response = await fetch("/api/admin/revalidate-catalog", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug: slug?.trim() || undefined }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Storefront revalidation failed.");
  }
}
