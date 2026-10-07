import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError } from "@/lib/api/types";
import { providerService } from "@/lib/api/services/provider.service";
import { isProviderId, toProvider, type Provider } from "./data";

// Server-side profile fetch for /services/[id] and its request-callback page.
// `cache` dedupes the call between generateMetadata and the page render.
// A non-numeric id or a backend 404 is a Next 404; anything else (backend
// down, 500) throws so the error boundary shows instead of a fake "not found".
export const loadProvider = cache(async (id: string): Promise<Provider> => {
  if (!isProviderId(id)) notFound();
  try {
    return toProvider(await providerService.getProfile(id));
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }
});
