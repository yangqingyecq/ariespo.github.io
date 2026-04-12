import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../lib/db';
import type { AppSettings, ApiSettings, ChatSession, ChatMessage } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

interface SettingsState {
  settings: AppSettings;
  currentChat: ChatSession | null;
  isLoading: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateApiSettings: (updates: Partial<ApiSettings>) => Promise<void>;

  // Chat actions
  createChat: (name: string, characterName?: string) => Promise<ChatSession>;
  loadChat: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => Promise<void>;
  clearChat: () => void;
  exportChat: () => void;
  importChat: () => Promise<boolean>;

  // Import/Export all data
  exportAllData: () => void;
  importAllData: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      currentChat: null,
      isLoading: false,

      loadSettings: async () => {
        const stored = await db.settings.toArray();
        if (stored.length > 0) {
          set({ settings: { ...DEFAULT_SETTINGS, ...stored[0] } });
        }
      },

      updateSettings: async (updates) => {
        const newSettings = { ...get().settings, ...updates };
        await db.settings.put(newSettings);
        set({ settings: newSettings });
      },

      updateApiSettings: async (updates) => {
        await get().updateSettings({
          api: { ...get().settings.api, ...updates },
        });
      },

      createChat: async (name, characterName) => {
        const now = Date.now();
        const newChat: ChatSession = {
          id: crypto.randomUUID(),
          name,
          messages: [],
          characterName: characterName || get().settings.characterName,
          userName: get().settings.userName,
          presetId: get().settings.activePresetId,
          lorebookIds: get().settings.activeLorebookIds,
          createdAt: now,
          updatedAt: now,
        };
        await db.chats.add(newChat);
        set({ currentChat: newChat });
        return newChat;
      },

      loadChat: async (id) => {
        const chat = await db.chats.get(id);
        if (chat) {
          set({ currentChat: chat });
        }
      },

      deleteChat: async (id) => {
        await db.chats.delete(id);
        if (get().currentChat?.id === id) {
          set({ currentChat: null });
        }
      },

      addMessage: async (messageData) => {
        const chat = get().currentChat;
        if (!chat) return;

        const newMessage: ChatMessage = {
          ...messageData,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        const updatedChat = {
          ...chat,
          messages: [...chat.messages, newMessage],
          updatedAt: Date.now(),
        };

        await db.chats.update(chat.id, updatedChat);
        set({ currentChat: updatedChat });
      },

      updateMessage: async (messageId, updates) => {
        const chat = get().currentChat;
        if (!chat) return;

        const updatedMessages = chat.messages.map(m =>
          m.id === messageId ? { ...m, ...updates } : m
        );

        const updatedChat = {
          ...chat,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };

        await db.chats.update(chat.id, updatedChat);
        set({ currentChat: updatedChat });
      },

      clearChat: () => {
        set({ currentChat: null });
      },

      exportChat: () => {
        const chat = get().currentChat;
        if (!chat) return;

        const data = {
          ...chat,
          exportVersion: '1.0',
          exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      importChat: async () => {
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json,application/json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
              resolve(false);
              return;
            }
            try {
              const text = await file.text();
              const data = JSON.parse(text) as ChatSession;

              // 验证数据结构
              if (!data.messages || !Array.isArray(data.messages)) {
                resolve(false);
                return;
              }

              const newChat: ChatSession = {
                ...data,
                id: crypto.randomUUID(),
                name: data.name + ' (导入)',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };

              await db.chats.add(newChat);
              set({ currentChat: newChat });
              resolve(true);
            } catch (err) {
              console.error('Failed to import chat:', err);
              resolve(false);
            }
          };
          input.click();
        });
      },

      exportAllData: async () => {
        const [lorebooks, presets, settings, chats] = await Promise.all([
          db.lorebooks.toArray(),
          db.presets.toArray(),
          db.settings.toArray(),
          db.chats.toArray(),
        ]);

        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          data: {
            lorebooks,
            presets,
            settings: settings[0] || DEFAULT_SETTINGS,
            chats,
          },
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sillytavern_web_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      importAllData: async () => {
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json,application/json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
              resolve(false);
              return;
            }
            try {
              const text = await file.text();
              const data = JSON.parse(text);

              if (!data.data) {
                resolve(false);
                return;
              }

              // 导入所有数据
              if (data.data.lorebooks) {
                for (const book of data.data.lorebooks) {
                  await db.lorebooks.put({ ...book, id: book.id || crypto.randomUUID() });
                }
              }
              if (data.data.presets) {
                for (const preset of data.data.presets) {
                  await db.presets.put({ ...preset, id: preset.id || crypto.randomUUID() });
                }
              }
              if (data.data.settings) {
                await db.settings.put(data.data.settings);
              }
              if (data.data.chats) {
                for (const chat of data.data.chats) {
                  await db.chats.put({ ...chat, id: chat.id || crypto.randomUUID() });
                }
              }

              // 重新加载
              await get().loadSettings();
              resolve(true);
            } catch (err) {
              console.error('Failed to import data:', err);
              resolve(false);
            }
          };
          input.click();
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
