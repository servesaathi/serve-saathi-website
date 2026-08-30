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
  setRole: (role: ApiRole) => void;
  setPhone: (phone: string) => void;
  setPhoneVerificationToken: (token: string | null) => void;
  reset: () => void;
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
      setRole: (role) => set({ role }),
      setPhone: (phone) => set({ phone }),
      setPhoneVerificationToken: (phoneVerificationToken) => set({ phoneVerificationToken }),
      reset: () => set({ role: null, phone: null, phoneVerificationToken: null }),
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
