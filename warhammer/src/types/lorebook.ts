// SillyTavern 兼容的世界书类型定义

export interface LorebookEntry {
  id: string;
  keys: string[];           // 触发关键词
  content: string;          // 条目内容
  order: number;            // 插入顺序优先级 (0-1000, 越小越靠前)
  position: 'before_char' | 'after_char' | 'before_example' | 'after_example' | 'at_depth';
  depth?: number;           // 当 position='at_depth' 时的深度值 (0-999)
  selective: boolean;       // 是否选择性匹配
  selectiveLogic: 'and' | 'or';  // 选择性逻辑
  constant: boolean;        // 是否始终插入
  probability: number;      // 触发概率 0-100
  addMemo: boolean;         // 是否作为记忆添加
  comment?: string;         // 条目备注
}

export interface Lorebook {
  id: string;
  name: string;
  description?: string;
  entries: LorebookEntry[];
  recursiveScanning: boolean;  // 条目内容是否参与扫描
  caseSensitive: boolean;      // 关键词匹配是否区分大小写
  matchWholeWords: boolean;    // 是否匹配整词
  createdAt: number;
  updatedAt: number;
}

// SillyTavern 导出的 JSON 格式
export interface SillyTavernLorebookExport {
  name: string;
  description?: string;
  entries: SillyTavernEntry[];
  settings?: {
    recursive_scanning?: boolean;
    case_sensitive?: boolean;
    match_whole_words?: boolean;
  };
}

export interface SillyTavernEntry {
  uid: number;
  key: string[];
  keysecondary: string[];
  comment: string;
  content: string;
  constant: boolean;
  selective: boolean;
  selectiveLogic: 0 | 1;  // 0=AND, 1=OR
  addMemo: boolean;
  order: number;
  position: 0 | 1 | 2 | 3 | 4;  // 对应 position 枚举
  disable: boolean;
  probability: number;
  depth: number;
  group: string;
  useProbability: boolean;
  excluded: boolean;
}

// 匹配结果
export interface MatchedEntry {
  entry: LorebookEntry;
  score: number;
  matchedKeywords: string[];
}
