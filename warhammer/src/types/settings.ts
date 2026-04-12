// 应用设置类型

export interface ApiSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeout: number;
}

export interface AppSettings {
  api: ApiSettings;
  activePresetId: string | null;
  activeLorebookIds: string[];  // 可同时激活多个世界书
  userName: string;
  characterName: string;
  theme: 'gothic' | 'light' | 'dark';
  language: 'zh' | 'en';
  autoSave: boolean;
  autoSaveInterval: number;  // 秒
}

export const DEFAULT_SETTINGS: AppSettings = {
  api: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    timeout: 60000,
  },
  activePresetId: null,
  activeLorebookIds: [],
  userName: '用户',
  characterName: 'AI',
  theme: 'gothic',
  language: 'zh',
  autoSave: true,
  autoSaveInterval: 30,
};

// 聊天记录
export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    tokenCount?: number;
    lorebookEntries?: string[];  // 哪些世界书条目被触发
    processingTime?: number;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  characterName: string;
  userName: string;
  presetId: string | null;
  lorebookIds: string[];
  createdAt: number;
  updatedAt: number;
}
