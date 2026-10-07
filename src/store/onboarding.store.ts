import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ApiRole } from "@/lib/api/types";

// Carries the few values collected across the "Start + Setting up new account"
// flow (Join → Phone Verify → OTP → Create account → …). Persisted to
// sessionStorage so a refresh mid-flow doesn't lose the user's place, but it
// doesn't outlive the browser session.

interface OnboardingState {
  /** Chosen on the Join step; sent to authService.requestOtp / register. */
  role: ApiRole | null;
  /** E.164, e.g. "+919876543210". Set on the Phone Verify step. */
  phone: string | null;
  /** Returned by verifyOtp for a new user; passed to register(). */
  phoneVerificationToken: string | null;
  /** Same-origin path to land on after sign-in (e.g. back to /services after "Unlock"). */
  returnTo: string | null;
  setRole: (role: ApiRole) => void;
  setPhone: (phone: string) => void;
  setPhoneVerificationToken: (token: string | null) => void;
  setReturnTo: (path: string | null) => void;
  reset: () => void;
}

/** Only same-origin absolute paths — never `//evil.com` or `https://…` (open redirect). */
export function safeReturnPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  return path;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      role: null,
      phone: null,
      phoneVerificationToken: null,
      returnTo: null,
      setRole: (role) => set({ role }),
      setPhone: (phone) => set({ phone }),
      setPhoneVerificationToken: (phoneVerificationToken) => set({ phoneVerificationToken }),
      setReturnTo: (returnTo) => set({ returnTo: safeReturnPath(returnTo) }),
      reset: () => set({ role: null, phone: null, phoneVerificationToken: null, returnTo: null }),
    }),
    {
      name: "servesaathi-onboarding",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : noopStorage
      ),
    }
  )
);

export default useOnboardingStore;
