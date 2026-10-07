import { create } from "zustand";
import { favoriteService } from "@/lib/api/services/favorite.service";
import useAuthStore from "./auth.store";

// The signed-in user's saved providers (GET/POST/DELETE /favorites). Not
// persisted: the server is the source of truth, loaded once per session the
// first time a FavoriteButton mounts while signed in, then kept in sync by
// optimistic toggles. Cleared on logout so the next account starts fresh.

type Status = "idle" | "loading" | "ready" | "error";

interface FavoritesState {
  ids: string[];
  status: Status;
  /** Provider ids with a save/unsave request in flight. */
  pending: string[];
  load: () => Promise<void>;
  /** Optimistically flips `id`; rolls back and rethrows if the request fails. */
  toggle: (id: string) => Promise<void>;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  ids: [],
  status: "idle",
  pending: [],

  load: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading" });
    try {
      const providers = await favoriteService.list();
      set({ ids: providers.map((p) => String(p.id)), status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },

  toggle: async (id) => {
    if (get().pending.includes(id)) return;
    const wasSaved = get().ids.includes(id);
    set((s) => ({
      ids: wasSaved ? s.ids.filter((x) => x !== id) : [...s.ids, id],
      pending: [...s.pending, id],
    }));
    try {
      await (wasSaved ? favoriteService.remove(id) : favoriteService.add(id));
    } catch (err) {
      set((s) => ({ ids: wasSaved ? [...s.ids, id] : s.ids.filter((x) => x !== id) }));
      throw err;
    } finally {
      set((s) => ({ pending: s.pending.filter((x) => x !== id) }));
    }
  },

  reset: () => set({ ids: [], status: "idle", pending: [] }),
}));

// Logout or a different account signing in: drop the old account's list.
useAuthStore.subscribe((state, prev) => {
  if (state.token !== prev.token) useFavoritesStore.getState().reset();
});

export default useFavoritesStore;
