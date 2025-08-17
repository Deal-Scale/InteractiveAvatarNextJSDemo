import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BookmarkFolder = { id: string; name: string };
export type BookmarkMeta = { folderId?: string; tags?: string[] };

export type BookmarkState = {
  bookmarkedIds: Set<string>;
  folders: BookmarkFolder[];
  meta: Record<string, BookmarkMeta>;
  hasMigratedLegacy?: boolean;

  // actions
  addBookmark: (id: string) => void;
  removeBookmark: (id: string) => void;
  setBookmarkMeta: (id: string, meta: BookmarkMeta) => void;
  clearBookmarkMeta: (id: string) => void;
  upsertFolder: (name: string) => string; // returns id
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  reset: () => void;
};

const initialState = {
  bookmarkedIds: new Set<string>(),
  folders: [] as BookmarkFolder[],
  meta: {} as Record<string, BookmarkMeta>,
  hasMigratedLegacy: false as boolean,
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addBookmark: (id) =>
        set((state) => ({
          bookmarkedIds: new Set([...Array.from(state.bookmarkedIds), id]),
        })),
      removeBookmark: (id) =>
        set((state) => {
          const next = new Set(state.bookmarkedIds);

          next.delete(id);

          return { bookmarkedIds: next };
        }),
      setBookmarkMeta: (id, meta) =>
        set((state) => ({
          meta: { ...state.meta, [id]: { ...state.meta[id], ...meta } },
        })),
      clearBookmarkMeta: (id) =>
        set((state) => {
          const next = { ...state.meta };

          delete next[id];

          return { meta: next };
        }),
      upsertFolder: (name) => {
        const trimmed = name.trim();

        if (!trimmed) return "";
        const { folders } = get();
        const existing = folders.find(
          (f) => f.name.toLowerCase() === trimmed.toLowerCase(),
        );

        if (existing) return existing.id;
        const id = `f-${Date.now()}`;

        set({ folders: [...folders, { id, name: trimmed }] });

        return id;
      },
      renameFolder: (id, name) =>
        set((state) => ({
          folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)),
        })),
      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          meta: Object.fromEntries(
            Object.entries(state.meta).map(([k, v]) => [
              k,
              { ...v, folderId: v.folderId === id ? undefined : v.folderId },
            ]),
          ),
        })),
      reset: () => set(initialState),
    }),
    {
      name: "sidebar.bookmarks.store.v1",
      storage: createJSONStorage(() => localStorage),
      // Custom serialize/deserialize to handle Set
      partialize: (state) => ({
        bookmarkedIds: Array.from(state.bookmarkedIds),
        folders: state.folders,
        meta: state.meta,
        hasMigratedLegacy: state.hasMigratedLegacy,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) return;
        // Re-wrap bookmarkedIds as Set after hydration

        const s = state as any;

        if (Array.isArray(s.bookmarkedIds)) {
          s.bookmarkedIds = new Set<string>(s.bookmarkedIds);
        }

        // Migrate legacy keys on first hydration
        if (!s.hasMigratedLegacy) {
          try {
            const legacyIdsRaw = localStorage.getItem("sidebar.bookmarks.v1");
            const legacyFoldersRaw = localStorage.getItem(
              "sidebar.bookmarkFolders.v1",
            );
            const legacyMetaRaw = localStorage.getItem(
              "sidebar.bookmarkMeta.v1",
            );

            const legacyIds: string[] = legacyIdsRaw
              ? JSON.parse(legacyIdsRaw)
              : [];
            const legacyFolders: BookmarkFolder[] = legacyFoldersRaw
              ? JSON.parse(legacyFoldersRaw)
              : [];
            const legacyMeta: Record<string, BookmarkMeta> = legacyMetaRaw
              ? JSON.parse(legacyMetaRaw)
              : {};

            if (
              legacyIds.length ||
              legacyFolders.length ||
              Object.keys(legacyMeta).length
            ) {
              s.bookmarkedIds = new Set<string>([
                ...Array.from(s.bookmarkedIds as Set<string>),
                ...legacyIds,
              ]);
              s.folders = s.folders?.length ? s.folders : legacyFolders;
              s.meta = { ...(s.meta ?? {}), ...legacyMeta };
            }

            s.hasMigratedLegacy = true;
          } catch {
            // ignore migration errors
            s.hasMigratedLegacy = true;
          }
        }
      },
    },
  ),
);
