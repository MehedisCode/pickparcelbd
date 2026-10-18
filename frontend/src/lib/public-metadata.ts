import type { Metadata } from "next";
export async function publicMetadata(
  path: string,
  fallback: string,
): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/v1${path}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return { title: fallback };
    const data = await response.json();
    const title = data.product?.name || data.user?.name || fallback;
    const description = String(
      data.product?.description ||
        data.user?.news ||
        "Discover local businesses and connected delivery on PickParcelBD.",
    ).slice(0, 180);
    return { title, description, openGraph: { title, description } };
  } catch {
    return { title: fallback };
  }
}
