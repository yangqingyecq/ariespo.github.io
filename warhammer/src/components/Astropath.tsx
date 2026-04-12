import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ScrollText, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../stores/settingsStore';
import { useLorebookStore } from '../stores/lorebookStore';
import { usePresetStore } from '../stores/presetStore';
import { db } from '../lib/db';
import { createLorebookEngine } from '../lib/lorebook/engine';
import { DEFAULT_PROMPT_BLOCKS } from '../types/preset';
import type { ChatMessage } from '../types/settings';
import type { MatchedEntry } from '../types/lorebook';

interface MessageWithMeta extends ChatMessage {
  matchedEntries?: MatchedEntry[];
}

export default function Astropath() {
  const { settings, currentChat, createChat, addMessage } = useSettingsStore();
  const { activeLorebookIds, lorebooks } = useLorebookStore();
  const { activePresetId, presets } = usePresetStore();

  const [messages, setMessages] = useState<MessageWithMeta[]>([
    { role: 'system', content: '星语庭连接已建立。总督大人，您的仆人正在聆听。', timestamp: Date.now() },
    { role: 'assistant', content: '大人，内政部发来紧急报告：农业世界"丰饶"的粮食产量本季度下降了15%。当地总督声称是由于罕见的基因枯萎病。如果不采取行动，巢都世界"哥特 Prime"将在三个月内面临饥荒。请指示。', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePreset = presets.find(p => p.id === activePresetId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 组装提示词
  const assemblePrompt = useCallback((userInput: string, history: MessageWithMeta[]) => {
    const preset = activePreset;
    if (!preset) {
      // 无预设时的默认行为
      return {
        messages: [
          ...history.filter(m => m.role !== 'system'),
          { role: 'user', content: userInput } as ChatMessage,
        ],
        matchedEntries: [] as MatchedEntry[],
      };
    }

    // 加载激活的世界书
    const activeBooks = lorebooks.filter(b => activeLorebookIds.includes(b.id));

    // 扫描世界书
    const allMatchedEntries: MatchedEntry[] = [];
    const scanText = userInput + ' ' + history.slice(-3).map(m => m.content).join(' ');

    for (const book of activeBooks) {
      const engine = createLorebookEngine(book);
      const matches = engine.recursiveScan(scanText, 3);
      allMatchedEntries.push(...matches);
    }

    // 去重并按顺序排序
    const uniqueEntries = Array.from(
      new Map(allMatchedEntries.map(e => [e.entry.id, e])).values()
    ).sort((a, b) => a.score - b.score);

    // 组装提示词
    const assembledMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
    let systemContent = '';

    for (const block of preset.promptOrder.filter(b => b.enabled).sort((a, b) => a.position - b.position)) {
      let content = block.content;

      // 替换宏
      content = content
        .replace(/\{\{user\}\}/g, settings.userName)
        .replace(/\{\{char\}\}/g, settings.characterName)
        .replace(/\{\{original\}\}/g, userInput);

      // 插入世界书内容
      if (block.id === DEFAULT_PROMPT_BLOCKS.WORLD_INFO) {
        const worldInfoContent = uniqueEntries.map(e => e.entry.content).join('\n\n');
        if (worldInfoContent) {
          content = worldInfoContent;
        } else {
          continue; // 跳过空的世界书块
        }
      }

      if (!content.trim()) continue;

      if (block.role === 'system' || block.insertionType === 'system') {
        systemContent += (systemContent ? '\n\n' : '') + content;
      } else if (block.id === DEFAULT_PROMPT_BLOCKS.CHAT_HISTORY) {
        // 历史消息已包含在后面的逻辑中
      } else {
        assembledMessages.push({
          role: block.role || block.insertionType,
          content,
        });
      }
    }

    // 添加系统消息
    if (systemContent) {
      assembledMessages.unshift({ role: 'system', content: systemContent });
    }

    // 添加历史消息（应用上下文长度限制）
    const maxContextTokens = preset.contextLength || 4096;
    let currentTokens = systemContent.length / 4; // 粗略估算

    const recentHistory: typeof assembledMessages = [];
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.role === 'system') continue;

      const msgTokens = msg.content.length / 4;
      if (currentTokens + msgTokens > maxContextTokens * 0.8) break;

      recentHistory.unshift({ role: msg.role, content: msg.content });
      currentTokens += msgTokens;
    }

    assembledMessages.push(...recentHistory);

    // 添加用户输入
    assembledMessages.push({ role: 'user', content: userInput });

    return {
      messages: assembledMessages,
      matchedEntries: uniqueEntries,
    };
  }, [activePreset, activeLorebookIds, lorebooks, settings.userName, settings.characterName]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userInput = input.trim();
    setInput('');
    setError(null);

    // 添加用户消息到本地状态
    const userMessage: MessageWithMeta = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // 组装提示词
      const { messages: assembledMessages, matchedEntries } = assemblePrompt(userInput, messages);

      // 检查 API 配置
      if (!settings.api.apiKey) {
        throw new Error('未配置 API 密钥。请在设置中配置 API。');
      }

      // 调用 API
      const response = await fetch(`${settings.api.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.api.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.api.model,
          messages: assembledMessages,
          temperature: activePreset?.parameters.temperature ?? 0.8,
          max_tokens: activePreset?.parameters.maxTokens ?? 2048,
          top_p: activePreset?.parameters.topP ?? 0.9,
          frequency_penalty: activePreset?.parameters.frequencyPenalty ?? 0,
          presence_penalty: activePreset?.parameters.presencePenalty ?? 0,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 错误: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content;

      if (!assistantContent) {
        throw new Error('API 返回数据格式异常');
      }

      // 添加 AI 回复
      const assistantMessage: MessageWithMeta = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
        matchedEntries,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
      console.error('Chat error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-gothic text-4xl text-gold mb-2 text-glow">星语通讯阵列</h1>
          <p className="text-gold-dim tracking-widest">跨越星海的低语，传达您的神圣意志。</p>
        </div>
        <div className="flex items-center space-x-2 text-gold-dim">
          <div className="w-2 h-2 rounded-full bg-green-800 animate-pulse"></div>
          <span className="font-gothic text-sm tracking-widest">连接稳定</span>
        </div>
      </header>

      <div className="flex-1 bg-parchment-texture border-ornate p-8 flex flex-col relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        {/* Scroll decorative top/bottom */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-ink/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-ink/20 to-transparent"></div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-blood/20 border border-blood/50 text-blood-dark flex items-center gap-2"
          >
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs hover:underline"
            >
              关闭
            </button>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id || idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'system' ? 'mx-auto text-center' : ''}`}>
                {msg.role !== 'system' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-gothic text-xs text-ink/60 font-bold tracking-widest">
                      {msg.role === 'user' ? settings.userName || '总督敕令' : settings.characterName || '星语接收'}
                    </span>
                    {msg.role === 'assistant' && <ScrollText size={12} className="text-ink/60" />}
                  </div>
                )}
                <div className={`
                  ${msg.role === 'system' ? 'text-ink/50 italic text-sm border-b border-ink/20 pb-2' : ''}
                  ${msg.role === 'user' ? 'bg-ink/10 border-l-4 border-blood p-4 text-ink font-semibold' : ''}
                  ${msg.role === 'assistant' ? 'text-ink font-body leading-relaxed text-lg' : ''}
                `}>
                  {msg.content}
                </div>
                {/* World Info Indicator */}
                {msg.matchedEntries && msg.matchedEntries.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px] text-gold-dim/60 bg-gold/10 px-2 py-0.5 rounded">
                      触发 {msg.matchedEntries.length} 条世界书
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-ink/40"
            >
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs italic">星语者正在传达您的意志...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-6 pt-6 border-t border-ink/20 flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="在此口述您的命令，总督大人..."
              disabled={isGenerating}
              className="w-full bg-transparent border-b-2 border-ink/30 focus:border-blood text-ink placeholder:text-ink/40 p-2 resize-none outline-none font-body text-lg transition-colors disabled:opacity-50"
              rows={3}
            />
            <div className="absolute bottom-2 right-2 text-xs text-ink/40 font-gothic">
              {isGenerating ? '传输中...' : '按 Enter 发送'}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="wax-seal w-16 h-16 flex items-center justify-center text-parchment hover:scale-105 transition-transform flex-shrink-0 group disabled:opacity-50 disabled:cursor-not-allowed"
            title="盖章并发送"
          >
            {isGenerating ? (
              <Loader2 size={24} className="relative z-10 animate-spin" />
            ) : (
              <Send size={24} className="relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
