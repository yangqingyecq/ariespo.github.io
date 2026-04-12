// 对话补全预设类型定义

export interface PromptBlock {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  position: number;
  insertionType: 'system' | 'user' | 'assistant';
  role?: 'system' | 'user' | 'assistant';
  description?: string;
}

export interface GenerationParameters {
  temperature: number;           // 0.0 - 2.0
  maxTokens: number;            // 最大生成token数
  topP: number;                 // 0.0 - 1.0
  topK?: number;                // Top-K采样
  frequencyPenalty: number;     // -2.0 - 2.0
  presencePenalty: number;      // -2.0 - 2.0
  repetitionPenalty?: number;   // 重复惩罚
  minTokens?: number;           // 最小token数
}

export interface ChatPreset {
  id: string;
  name: string;
  description?: string;
  promptOrder: PromptBlock[];
  parameters: GenerationParameters;
  contextLength?: number;       // 上下文长度限制
  createdAt: number;
  updatedAt: number;
}

// SillyTavern 预设导出格式
export interface SillyTavernPresetExport {
  name: string;
  description?: string;
  prompt_order: SillyTavernPromptBlock[];
  gen_params: Partial<SillyTavernGenParams>;
}

export interface SillyTavernPromptBlock {
  identifier: string;
  name: string;
  system_prompt?: string;
  jailbreak?: string;
  context?: string;
  enabled: boolean;
  role: 0 | 1 | 2 | 3;  // 0=system, 1=user, 2=assistant, 3=custom
  position: number;
}

export interface SillyTavernGenParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  presence_penalty: number;
  frequency_penalty: number;
  min_tokens: number;
}

// 默认预设块ID
export const DEFAULT_PROMPT_BLOCKS = {
  SYSTEM_PROMPT: 'system_prompt',
  WORLD_INFO: 'world_info',
  CHARACTER_DESCRIPTION: 'character_description',
  SCENARIO: 'scenario',
  EXAMPLE_MESSAGES: 'example_messages',
  CHAT_HISTORY: 'chat_history',
  USER_INPUT: 'user_input',
} as const;

// 默认预设
export const createDefaultPreset = (): Omit<ChatPreset, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '默认预设',
  description: '基础对话预设',
  promptOrder: [
    {
      id: DEFAULT_PROMPT_BLOCKS.SYSTEM_PROMPT,
      name: '系统提示',
      content: '你是一个有帮助的AI助手。',
      enabled: true,
      position: 0,
      insertionType: 'system',
      role: 'system',
    },
    {
      id: DEFAULT_PROMPT_BLOCKS.WORLD_INFO,
      name: '世界书',
      content: '',
      enabled: true,
      position: 100,
      insertionType: 'system',
      role: 'system',
      description: '动态插入的世界书条目',
    },
    {
      id: DEFAULT_PROMPT_BLOCKS.CHARACTER_DESCRIPTION,
      name: '角色定义',
      content: '',
      enabled: true,
      position: 200,
      insertionType: 'system',
      role: 'system',
    },
    {
      id: DEFAULT_PROMPT_BLOCKS.EXAMPLE_MESSAGES,
      name: '示例对话',
      content: '',
      enabled: true,
      position: 300,
      insertionType: 'system',
      role: 'system',
    },
    {
      id: DEFAULT_PROMPT_BLOCKS.CHAT_HISTORY,
      name: '聊天记录',
      content: '',
      enabled: true,
      position: 400,
      insertionType: 'user',
      description: '历史消息（自动管理）',
    },
  ],
  parameters: {
    temperature: 0.8,
    maxTokens: 2048,
    topP: 0.9,
    topK: 40,
    frequencyPenalty: 0,
    presencePenalty: 0,
    repetitionPenalty: 1.0,
    minTokens: 0,
  },
  contextLength: 4096,
});
