import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../lib/db';
import type { ChatPreset, PromptBlock } from '../types/preset';
import { createDefaultPreset, DEFAULT_PROMPT_BLOCKS } from '../types/preset';
import { SillyTavernImporter, importJsonFile, exportToJson } from '../lib/importers/sillytavern';

interface PresetState {
  presets: ChatPreset[];
  activePresetId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPresets: () => Promise<void>;
  createPreset: (name: string, description?: string) => Promise<ChatPreset>;
  duplicatePreset: (id: string, newName: string) => Promise<void>;
  updatePreset: (id: string, updates: Partial<ChatPreset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  importPreset: () => Promise<boolean>;
  exportPreset: (id: string) => void;
  setActivePreset: (id: string | null) => void;

  // Prompt block actions
  updatePromptBlock: (presetId: string, blockId: string, updates: Partial<PromptBlock>) => Promise<void>;
  reorderPromptBlocks: (presetId: string, blockIds: string[]) => Promise<void>;
  toggleBlockEnabled: (presetId: string, blockId: string) => Promise<void>;
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      activePresetId: null,
      isLoading: false,
      error: null,

      loadPresets: async () => {
        set({ isLoading: true, error: null });
        try {
          const presets = await db.presets.toArray();
          set({ presets: presets.sort((a, b) => b.updatedAt - a.updatedAt) });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to load presets' });
        } finally {
          set({ isLoading: false });
        }
      },

      createPreset: async (name, description) => {
        const defaultPreset = createDefaultPreset();
        const now = Date.now();
        const newPreset: ChatPreset = {
          ...defaultPreset,
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: now,
          updatedAt: now,
        };
        await db.presets.add(newPreset);
        await get().loadPresets();
        return newPreset;
      },

      duplicatePreset: async (id, newName) => {
        const preset = get().presets.find(p => p.id === id);
        if (!preset) return;

        const now = Date.now();
        const duplicated: ChatPreset = {
          ...preset,
          id: crypto.randomUUID(),
          name: newName,
          createdAt: now,
          updatedAt: now,
        };
        await db.presets.add(duplicated);
        await get().loadPresets();
      },

      updatePreset: async (id, updates) => {
        await db.presets.update(id, {
          ...updates,
          updatedAt: Date.now(),
        });
        await get().loadPresets();
      },

      deletePreset: async (id) => {
        await db.presets.delete(id);
        if (get().activePresetId === id) {
          set({ activePresetId: null });
        }
        await get().loadPresets();
      },

      importPreset: async () => {
        const data = await importJsonFile<import('../types/preset').SillyTavernPresetExport>();
        if (!data) return false;

        try {
          const imported = SillyTavernImporter.importPreset(data);
          const now = Date.now();
          const newPreset: ChatPreset = {
            ...imported,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          };
          await db.presets.add(newPreset);
          await get().loadPresets();
          return true;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to import preset' });
          return false;
        }
      },

      exportPreset: (id) => {
        const preset = get().presets.find(p => p.id === id);
        if (!preset) return;

        // 转换为 SillyTavern 格式导出
        const exportData = {
          name: preset.name,
          description: preset.description,
          prompt_order: preset.promptOrder.map((block, idx) => ({
            identifier: block.id,
            name: block.name,
            system_prompt: block.content,
            enabled: block.enabled,
            role: block.role === 'user' ? 1 : block.role === 'assistant' ? 2 : 0,
            position: block.position,
          })),
          gen_params: {
            temperature: preset.parameters.temperature,
            max_tokens: preset.parameters.maxTokens,
            top_p: preset.parameters.topP,
            top_k: preset.parameters.topK,
            frequency_penalty: preset.parameters.frequencyPenalty,
            presence_penalty: preset.parameters.presencePenalty,
            repeat_penalty: preset.parameters.repetitionPenalty,
            min_tokens: preset.parameters.minTokens,
          },
        };
        exportToJson(exportData, `${preset.name.replace(/[^a-z0-9]/gi, '_')}_preset.json`);
      },

      setActivePreset: (id) => {
        set({ activePresetId: id });
      },

      updatePromptBlock: async (presetId, blockId, updates) => {
        const preset = get().presets.find(p => p.id === presetId);
        if (!preset) return;

        const updatedBlocks = preset.promptOrder.map(b =>
          b.id === blockId ? { ...b, ...updates } : b
        );

        await get().updatePreset(presetId, { promptOrder: updatedBlocks });
      },

      reorderPromptBlocks: async (presetId, blockIds) => {
        const preset = get().presets.find(p => p.id === presetId);
        if (!preset) return;

        const reordered = blockIds
          .map(id => preset.promptOrder.find(b => b.id === id))
          .filter((b): b is PromptBlock => !!b)
          .map((b, idx) => ({ ...b, position: idx * 100 }));

        await get().updatePreset(presetId, { promptOrder: reordered });
      },

      toggleBlockEnabled: async (presetId, blockId) => {
        const preset = get().presets.find(p => p.id === presetId);
        if (!preset) return;

        const block = preset.promptOrder.find(b => b.id === blockId);
        if (!block) return;

        await get().updatePromptBlock(presetId, blockId, { enabled: !block.enabled });
      },
    }),
    {
      name: 'preset-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activePresetId: state.activePresetId }),
    }
  )
);
