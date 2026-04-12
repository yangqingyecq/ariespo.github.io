import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../lib/db';
import type { Lorebook, LorebookEntry } from '../types/lorebook';
import { SillyTavernImporter, importJsonFile, exportToJson } from '../lib/importers/sillytavern';

interface LorebookState {
  lorebooks: Lorebook[];
  activeLorebookIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadLorebooks: () => Promise<void>;
  createLorebook: (name: string, description?: string) => Promise<Lorebook>;
  updateLorebook: (id: string, updates: Partial<Lorebook>) => Promise<void>;
  deleteLorebook: (id: string) => Promise<void>;
  importLorebook: () => Promise<boolean>;
  exportLorebook: (id: string) => void;
  addEntry: (lorebookId: string, entry: Omit<LorebookEntry, 'id'>) => Promise<void>;
  updateEntry: (lorebookId: string, entryId: string, updates: Partial<LorebookEntry>) => Promise<void>;
  deleteEntry: (lorebookId: string, entryId: string) => Promise<void>;
  toggleActiveLorebook: (id: string) => void;
  setActiveLorebooks: (ids: string[]) => void;
}

export const useLorebookStore = create<LorebookState>()(
  persist(
    (set, get) => ({
      lorebooks: [],
      activeLorebookIds: [],
      isLoading: false,
      error: null,

      loadLorebooks: async () => {
        set({ isLoading: true, error: null });
        try {
          const books = await db.lorebooks.toArray();
          set({ lorebooks: books.sort((a, b) => b.updatedAt - a.updatedAt) });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to load lorebooks' });
        } finally {
          set({ isLoading: false });
        }
      },

      createLorebook: async (name, description) => {
        const now = Date.now();
        const newBook: Lorebook = {
          id: crypto.randomUUID(),
          name,
          description,
          entries: [],
          recursiveScanning: false,
          caseSensitive: false,
          matchWholeWords: false,
          createdAt: now,
          updatedAt: now,
        };
        await db.lorebooks.add(newBook);
        await get().loadLorebooks();
        return newBook;
      },

      updateLorebook: async (id, updates) => {
        await db.lorebooks.update(id, {
          ...updates,
          updatedAt: Date.now(),
        });
        await get().loadLorebooks();
      },

      deleteLorebook: async (id) => {
        await db.lorebooks.delete(id);
        // 从激活列表中移除
        set(state => ({
          activeLorebookIds: state.activeLorebookIds.filter(lid => lid !== id),
        }));
        await get().loadLorebooks();
      },

      importLorebook: async () => {
        const data = await importJsonFile<import('../types/lorebook').SillyTavernLorebookExport>();
        if (!data) return false;

        try {
          const imported = SillyTavernImporter.importLorebook(data);
          const now = Date.now();
          const newBook: Lorebook = {
            ...imported,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          };
          await db.lorebooks.add(newBook);
          await get().loadLorebooks();
          return true;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to import lorebook' });
          return false;
        }
      },

      exportLorebook: (id) => {
        const book = get().lorebooks.find(b => b.id === id);
        if (!book) return;
        const exportData = SillyTavernImporter.exportLorebook(book);
        exportToJson(exportData, `${book.name.replace(/[^a-z0-9]/gi, '_')}_lorebook.json`);
      },

      addEntry: async (lorebookId, entryData) => {
        const book = get().lorebooks.find(b => b.id === lorebookId);
        if (!book) return;

        const newEntry: LorebookEntry = {
          ...entryData,
          id: crypto.randomUUID(),
        };

        await db.lorebooks.update(lorebookId, {
          entries: [...book.entries, newEntry],
          updatedAt: Date.now(),
        });
        await get().loadLorebooks();
      },

      updateEntry: async (lorebookId, entryId, updates) => {
        const book = get().lorebooks.find(b => b.id === lorebookId);
        if (!book) return;

        const updatedEntries = book.entries.map(e =>
          e.id === entryId ? { ...e, ...updates } : e
        );

        await db.lorebooks.update(lorebookId, {
          entries: updatedEntries,
          updatedAt: Date.now(),
        });
        await get().loadLorebooks();
      },

      deleteEntry: async (lorebookId, entryId) => {
        const book = get().lorebooks.find(b => b.id === lorebookId);
        if (!book) return;

        await db.lorebooks.update(lorebookId, {
          entries: book.entries.filter(e => e.id !== entryId),
          updatedAt: Date.now(),
        });
        await get().loadLorebooks();
      },

      toggleActiveLorebook: (id) => {
        set(state => {
          const isActive = state.activeLorebookIds.includes(id);
          return {
            activeLorebookIds: isActive
              ? state.activeLorebookIds.filter(lid => lid !== id)
              : [...state.activeLorebookIds, id],
          };
        });
      },

      setActiveLorebooks: (ids) => {
        set({ activeLorebookIds: ids });
      },
    }),
    {
      name: 'lorebook-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeLorebookIds: state.activeLorebookIds }),
    }
  )
);
