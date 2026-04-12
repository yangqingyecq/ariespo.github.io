import Dexie, { Table } from 'dexie';
import type { Lorebook } from '../types/lorebook';
import type { ChatPreset } from '../types/preset';
import type { AppSettings, ChatSession } from '../types/settings';

class AppDatabase extends Dexie {
  lorebooks!: Table<Lorebook>;
  presets!: Table<ChatPreset>;
  settings!: Table<AppSettings>;
  chats!: Table<ChatSession>;

  constructor() {
    super('SillyTavernWebDB');
    this.version(1).stores({
      lorebooks: '++id, name, updatedAt',
      presets: '++id, name, updatedAt',
      settings: 'key',
      chats: '++id, name, updatedAt',
    });
  }
}

export const db = new AppDatabase();

// 初始化默认数据
export async function initializeDatabase(): Promise<void> {
  // 检查是否有预设，如果没有则创建默认预设
  const presetCount = await db.presets.count();
  if (presetCount === 0) {
    const { createDefaultPreset } = await import('../types/preset');
    const defaultPreset = createDefaultPreset();
    await db.presets.add({
      ...defaultPreset,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as ChatPreset);
  }

  // 检查是否有设置，如果没有则创建默认设置
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    const { DEFAULT_SETTINGS } = await import('../types/settings');
    await db.settings.put(DEFAULT_SETTINGS);
  }
}
