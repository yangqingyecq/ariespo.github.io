import type {
  Lorebook,
  LorebookEntry,
  SillyTavernLorebookExport,
  SillyTavernEntry,
} from '../../types/lorebook';
import type { ChatPreset, PromptBlock, SillyTavernPresetExport } from '../../types/preset';

// SillyTavern position 映射
const POSITION_MAP: Record<number, LorebookEntry['position']> = {
  0: 'before_char',
  1: 'after_char',
  2: 'before_example',
  3: 'after_example',
  4: 'at_depth',
};

const REVERSE_POSITION_MAP: Record<LorebookEntry['position'], number> = {
  before_char: 0,
  after_char: 1,
  before_example: 2,
  after_example: 3,
  at_depth: 4,
};

// 选择性逻辑映射
const LOGIC_MAP: Record<number, 'and' | 'or'> = {
  0: 'and',
  1: 'or',
};

const REVERSE_LOGIC_MAP: Record<'and' | 'or', number> = {
  and: 0,
  or: 1,
};

export class SillyTavernImporter {
  /**
   * 导入 SillyTavern 世界书 JSON
   */
  static importLorebook(data: SillyTavernLorebookExport): Omit<Lorebook, 'id' | 'createdAt' | 'updatedAt'> {
    const entries: LorebookEntry[] = (data.entries || [])
      .filter((e) => !e.disable && !e.excluded)  // 过滤禁用的条目
      .map((e) => this.convertEntry(e));

    return {
      name: data.name || '导入的世界书',
      description: data.description,
      entries,
      recursiveScanning: data.settings?.recursive_scanning ?? false,
      caseSensitive: data.settings?.case_sensitive ?? false,
      matchWholeWords: data.settings?.match_whole_words ?? false,
    };
  }

  /**
   * 导出为 SillyTavern 格式
   */
  static exportLorebook(lorebook: Lorebook): SillyTavernLorebookExport {
    return {
      name: lorebook.name,
      description: lorebook.description,
      entries: lorebook.entries.map((e, index) => ({
        uid: index,
        key: e.keys,
        keysecondary: [],
        comment: e.comment || e.content.slice(0, 50),
        content: e.content,
        constant: e.constant,
        selective: e.selective,
        selectiveLogic: REVERSE_LOGIC_MAP[e.selectiveLogic] as 0 | 1,
        addMemo: e.addMemo,
        order: e.order,
        position: REVERSE_POSITION_MAP[e.position] as 0 | 1 | 2 | 3 | 4,
        disable: false,
        probability: e.probability,
        depth: e.depth ?? 4,
        group: '',
        useProbability: e.probability < 100,
        excluded: false,
      })),
      settings: {
        recursive_scanning: lorebook.recursiveScanning,
        case_sensitive: lorebook.caseSensitive,
        match_whole_words: lorebook.matchWholeWords,
      },
    };
  }

  private static convertEntry(entry: SillyTavernEntry): LorebookEntry {
    return {
      id: crypto.randomUUID(),
      keys: entry.key || [],
      content: entry.content || '',
      order: entry.order ?? 100,
      position: POSITION_MAP[entry.position ?? 1],
      depth: entry.depth,
      selective: entry.selective ?? false,
      selectiveLogic: LOGIC_MAP[entry.selectiveLogic ?? 1],
      constant: entry.constant ?? false,
      probability: entry.useProbability ? (entry.probability ?? 100) : 100,
      addMemo: entry.addMemo ?? false,
      comment: entry.comment,
    };
  }

  /**
   * 导入 SillyTavern 预设
   */
  static importPreset(data: SillyTavernPresetExport): Omit<ChatPreset, 'id' | 'createdAt' | 'updatedAt'> {
    const promptOrder: PromptBlock[] = (data.prompt_order || [])
      .filter((b) => b.enabled)
      .map((b) => ({
        id: b.identifier || crypto.randomUUID(),
        name: b.name,
        content: b.system_prompt || b.jailbreak || b.context || '',
        enabled: b.enabled,
        position: b.position,
        insertionType: this.mapRoleToInsertionType(b.role),
        role: this.mapRole(b.role),
      }));

    return {
      name: data.name || '导入的预设',
      description: data.description,
      promptOrder: promptOrder.sort((a, b) => a.position - b.position),
      parameters: {
        temperature: data.gen_params?.temperature ?? 0.8,
        maxTokens: data.gen_params?.max_tokens ?? 2048,
        topP: data.gen_params?.top_p ?? 0.9,
        topK: data.gen_params?.top_k ?? 40,
        frequencyPenalty: data.gen_params?.frequency_penalty ?? 0,
        presencePenalty: data.gen_params?.presence_penalty ?? 0,
        repetitionPenalty: data.gen_params?.repeat_penalty ?? 1.0,
        minTokens: data.gen_params?.min_tokens ?? 0,
      },
      contextLength: 4096,
    };
  }

  private static mapRole(role: number): PromptBlock['role'] {
    const map: Record<number, PromptBlock['role']> = {
      0: 'system',
      1: 'user',
      2: 'assistant',
      3: 'system',
    };
    return map[role] ?? 'system';
  }

  private static mapRoleToInsertionType(role: number): PromptBlock['insertionType'] {
    const map: Record<number, PromptBlock['insertionType']> = {
      0: 'system',
      1: 'user',
      2: 'assistant',
      3: 'system',
    };
    return map[role] ?? 'system';
  }
}

/**
 * 文件导入工具
 */
export async function importJsonFile<T>(): Promise<T | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        resolve(data as T);
      } catch (err) {
        console.error('Failed to parse JSON:', err);
        resolve(null);
      }
    };
    input.click();
  });
}

/**
 * 导出为 JSON 文件
 */
export function exportToJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
