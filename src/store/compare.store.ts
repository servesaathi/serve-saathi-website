import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_COMPARE } from "@/components/services/data";

// Providers ticked "Compare" on Explore Services / a provider's detail page.
// Feeds the bottom CompareBar (Figma "02b_Homepage / Explore Service -
// Compare 1/2/3", nodes 3318:89060 / 3318:92478 / 3318:93597). Persisted to
// sessionStorage so the selection survives moving between the listing,
// a detail page and the compare table.

interface CompareState {
  ids: string[];
  /** Adds or removes `id`. Adding past MAX_COMPARE is a no-op — returns false. */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) });
          return true;
        }
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "servesaathi-compare",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : noopStorage
      ),
    }
  )
);

export default useCompareStore;
