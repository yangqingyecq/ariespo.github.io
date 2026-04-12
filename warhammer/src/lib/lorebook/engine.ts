import type { Lorebook, LorebookEntry, MatchedEntry } from '../../types/lorebook';

/**
 * 世界书匹配引擎
 * 实现 SillyTavern 兼容的关键词扫描和插入逻辑
 */
export class LorebookEngine {
  private lorebook: Lorebook;

  constructor(lorebook: Lorebook) {
    this.lorebook = lorebook;
  }

  /**
   * 扫描文本，返回匹配的世界书条目
   * @param text 要扫描的文本
   * @param additionalContext 额外的上下文文本（用于选择性匹配）
   */
  scan(text: string, additionalContext?: string): MatchedEntry[] {
    const normalizedText = this.lorebook.caseSensitive ? text : text.toLowerCase();
    const normalizedContext = additionalContext
      ? this.lorebook.caseSensitive ? additionalContext : additionalContext.toLowerCase()
      : normalizedText;

    const matched: MatchedEntry[] = [];

    for (const entry of this.lorebook.entries) {
      // 处理始终插入的条目
      if (entry.constant) {
        matched.push({
          entry,
          score: -9999, // 最高优先级
          matchedKeywords: ['constant'],
        });
        continue;
      }

      // 检查概率
      if (Math.random() * 100 >= entry.probability) {
        continue;
      }

      // 关键词匹配
      const isMatch = this.checkEntryMatch(entry, normalizedText, normalizedContext);

      if (isMatch) {
        matched.push({
          entry,
          score: entry.order,
          matchedKeywords: entry.keys.filter(k =>
            this.containsKeyword(normalizedText, this.normalizeKeyword(k))
          ),
        });
      }
    }

    // 按 order 排序
    return matched.sort((a, b) => a.score - b.score);
  }

  /**
   * 递归扫描
   * 扫描条目的内容，看是否触发其他条目
   */
  recursiveScan(
    initialText: string,
    maxDepth: number = 3,
    additionalContext?: string
  ): MatchedEntry[] {
    if (!this.lorebook.recursiveScanning || maxDepth <= 0) {
      return this.scan(initialText, additionalContext);
    }

    const allMatched = new Map<string, MatchedEntry>();
    let currentText = initialText;
    let depth = 0;

    while (depth < maxDepth) {
      const newMatches = this.scan(currentText, additionalContext);
      let hasNewMatches = false;

      for (const match of newMatches) {
        if (!allMatched.has(match.entry.id)) {
          allMatched.set(match.entry.id, match);
          currentText += ' ' + match.entry.content;
          hasNewMatches = true;
        }
      }

      if (!hasNewMatches) break;
      depth++;
    }

    return Array.from(allMatched.values()).sort((a, b) => a.score - b.score);
  }

  /**
   * 按 position 分组匹配结果
   */
  groupByPosition(matched: MatchedEntry[]): Record<LorebookEntry['position'], MatchedEntry[]> {
    const grouped: Record<LorebookEntry['position'], MatchedEntry[]> = {
      before_char: [],
      after_char: [],
      before_example: [],
      after_example: [],
      at_depth: [],
    };

    for (const m of matched) {
      grouped[m.entry.position].push(m);
    }

    return grouped;
  }

  /**
   * 格式化匹配条目为文本
   */
  formatEntriesContent(entries: MatchedEntry[]): string {
    if (entries.length === 0) return '';
    return entries.map(e => e.entry.content).join('\n\n');
  }

  private checkEntryMatch(
    entry: LorebookEntry,
    text: string,
    context: string
  ): boolean {
    const { keys, selective, selectiveLogic } = entry;

    if (keys.length === 0) return false;

    // 检查主关键词
    const primaryMatches = keys.map(k =>
      this.containsKeyword(text, this.normalizeKeyword(k))
    );

    if (!selective) {
      return primaryMatches.some(m => m);
    }

    // 选择性匹配逻辑
    if (selectiveLogic === 'and') {
      return primaryMatches.every(m => m);
    } else {
      return primaryMatches.some(m => m);
    }
  }

  private normalizeKeyword(keyword: string): string {
    return this.lorebook.caseSensitive ? keyword : keyword.toLowerCase();
  }

  private containsKeyword(text: string, keyword: string): boolean {
    if (this.lorebook.matchWholeWords) {
      const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i');
      return regex.test(text);
    }
    return text.includes(keyword);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * 创建引擎实例的工厂函数
 */
export function createLorebookEngine(lorebook: Lorebook): LorebookEngine {
  return new LorebookEngine(lorebook);
}
