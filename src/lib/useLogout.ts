"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import useAuthStore from "@/store/auth.store";

// Shared logout: best-effort server-side invalidation, then clear the local
// session and return to the landing page.
export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.logout);

  return async function logout() {
    try {
      await authService.logout();
    } catch {
      // Session may already be gone / offline — clearing locally is enough.
    }
    clearSession();
    router.push("/");
  };
}

export default useLogout;
