import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import {
  Sliders,
  Plus,
  Import,
  FileDown,
  Trash2,
  Edit3,
  Check,
  GripVertical,
  Settings,
  Thermometer,
  Hash,
  Clock,
  AlertCircle,
} from 'lucide-react';
import ModalBase from './ModalBase';
import { usePresetStore } from '../../stores/presetStore';
import { useModalStore } from '../../stores/modalStore';
import type { ChatPreset, PromptBlock, GenerationParameters } from '../../types/preset';

export default function PresetModal() {
  const { activeModal, closeModal } = useModalStore();
  const {
    presets,
    activePresetId,
    loadPresets,
    createPreset,
    duplicatePreset,
    deletePreset,
    importPreset,
    exportPreset,
    setActivePreset,
    updatePreset,
    updatePromptBlock,
    reorderPromptBlocks,
    toggleBlockEnabled,
  } = usePresetStore();

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [activeTab, setActiveTab] = useState<'prompts' | 'params'>('prompts');

  useEffect(() => {
    if (activeModal === 'preset') {
      loadPresets();
      if (activePresetId) {
        setSelectedPresetId(activePresetId);
      }
    }
  }, [activeModal, loadPresets, activePresetId]);

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  const handleCreate = async () => {
    if (!newPresetName.trim()) return;
    const preset = await createPreset(newPresetName);
    setNewPresetName('');
    setIsCreating(false);
    setSelectedPresetId(preset.id);
  };

  const handleImport = async () => {
    const success = await importPreset();
    if (success) {
      loadPresets();
    }
  };

  return (
    <ModalBase
      isOpen={activeModal === 'preset'}
      onClose={closeModal}
      title="对话预设"
      subtitle="CHAT PRESETS - 提示词工程配置"
      maxWidth="full"
    >
      <div className="flex h-[60vh] gap-6">
        {/* Left Panel - Preset List */}
        <div className="w-72 flex flex-col border-r border-gold-dim/30 pr-4">
          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsCreating(true)}
              className="flex-1 btn-gothic bg-blood/20 border border-blood/50 text-gold-light py-2 px-3 flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={16} />
              新建
            </button>
            <button
              onClick={handleImport}
              className="flex-1 btn-gothic bg-stone border border-gold-dim/50 text-gold-dim py-2 px-3 flex items-center justify-center gap-2 text-sm hover:text-gold"
            >
              <Import size={16} />
              导入
            </button>
          </div>

          {/* Create Form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-stone p-3 border border-gold-dim/30">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="预设名称..."
                    className="w-full bg-void border border-gold-dim/30 p-2 text-parchment placeholder:text-gold-dim/50 text-sm focus:border-gold outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreate}
                      className="flex-1 bg-blood/40 text-gold-light py-1 text-xs border border-blood/50"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 bg-void text-gold-dim py-1 text-xs border border-gold-dim/30"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                className={`p-3 cursor-pointer border transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-blood/20 border-gold/50'
                    : 'bg-stone/50 border-gold-dim/20 hover:border-gold-dim/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-gold-dim flex-shrink-0" />
                      <span className="text-parchment font-gothic text-sm truncate">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-xs text-gold-dim/60 mt-1">
                      T: {preset.parameters.temperature} | Max: {preset.parameters.maxTokens}
                    </p>
                  </div>
                  {activePresetId === preset.id && (
                    <span className="text-[10px] bg-blood/60 text-gold px-1.5 py-0.5">
                      使用中
                    </span>
                  )}
                </div>
              </div>
            ))}

            {presets.length === 0 && (
              <div className="text-center py-8 text-gold-dim/50">
                <Sliders size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">暂无预设</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedPreset ? (
            <PresetEditor
              preset={selectedPreset}
              isActive={activePresetId === selectedPreset.id}
              onSetActive={() => setActivePreset(selectedPreset.id)}
              onDuplicate={(name) => duplicatePreset(selectedPreset.id, name)}
              onDelete={() => {
                deletePreset(selectedPreset.id);
                setSelectedPresetId(null);
              }}
              onExport={() => exportPreset(selectedPreset.id)}
              onUpdate={(updates) => updatePreset(selectedPreset.id, updates)}
              onUpdateBlock={(blockId, updates) => updatePromptBlock(selectedPreset.id, blockId, updates)}
              onReorderBlocks={(ids) => reorderPromptBlocks(selectedPreset.id, ids)}
              onToggleBlock={(blockId) => toggleBlockEnabled(selectedPreset.id, blockId)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gold-dim/50">
              <Sliders size={48} className="mb-4 opacity-30" />
              <p className="font-gothic tracking-widest">选择一个预设以编辑</p>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
}

// Preset Editor Component
function PresetEditor({
  preset,
  isActive,
  onSetActive,
  onDuplicate,
  onDelete,
  onExport,
  onUpdate,
  onUpdateBlock,
  onReorderBlocks,
  onToggleBlock,
  activeTab,
  setActiveTab,
}: {
  preset: ChatPreset;
  isActive: boolean;
  onSetActive: () => void;
  onDuplicate: (name: string) => void;
  onDelete: () => void;
  onExport: () => void;
  onUpdate: (updates: Partial<ChatPreset>) => void;
  onUpdateBlock: (blockId: string, updates: Partial<PromptBlock>) => void;
  onReorderBlocks: (ids: string[]) => void;
  onToggleBlock: (blockId: string) => void;
  activeTab: 'prompts' | 'params';
  setActiveTab: (tab: 'prompts' | 'params') => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(preset.name);
  const [showDuplicateForm, setShowDuplicateForm] = useState(false);
  const [duplicateName, setDuplicateName] = useState(preset.name + ' 副本');

  const handleSaveName = () => {
    onUpdate({ name: nameValue });
    setIsEditingName(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gold-dim/30">
        <div className="flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="bg-void border border-gold/50 p-2 text-gold-light font-gothic text-xl outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              onBlur={handleSaveName}
              autoFocus
            />
          ) : (
            <h3
              className="text-xl font-gothic text-gold-light cursor-pointer hover:text-gold"
              onClick={() => setIsEditingName(true)}
            >
              {preset.name}
            </h3>
          )}
          {preset.description && (
            <p className="text-xs text-gold-dim mt-1">{preset.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isActive ? (
            <button
              onClick={onSetActive}
              className="btn-gothic bg-blood/20 border border-blood/50 text-gold-light py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Check size={14} />
              设为当前
            </button>
          ) : (
            <span className="text-xs text-gold bg-blood/30 px-3 py-1.5 border border-blood/50">
              当前使用中
            </span>
          )}

          <button
            onClick={() => setShowDuplicateForm(true)}
            className="p-2 text-gold-dim hover:text-gold border border-gold-dim/30 hover:border-gold/50"
            title="复制"
          >
            <Edit3 size={16} />
          </button>

          <button
            onClick={onExport}
            className="p-2 text-gold-dim hover:text-gold border border-gold-dim/30 hover:border-gold/50"
            title="导出"
          >
            <FileDown size={16} />
          </button>

          <button
            onClick={onDelete}
            className="p-2 text-gold-dim hover:text-blood-light border border-gold-dim/30 hover:border-blood/50"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Duplicate Form */}
      <AnimatePresence>
        {showDuplicateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-stone p-3 border border-gold-dim/30 flex items-center gap-3">
              <input
                type="text"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                className="flex-1 bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none"
                onKeyDown={(e) => e.key === 'Enter' && (onDuplicate(duplicateName), setShowDuplicateForm(false))}
              />
              <button
                onClick={() => {
                  onDuplicate(duplicateName);
                  setShowDuplicateForm(false);
                }}
                className="bg-blood/40 text-gold-light py-2 px-4 text-sm border border-blood/50"
              >
                复制
              </button>
              <button
                onClick={() => setShowDuplicateForm(false)}
                className="bg-void text-gold-dim py-2 px-4 text-sm border border-gold-dim/30"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gold-dim/30">
        <button
          onClick={() => setActiveTab('prompts')}
          className={`py-2 px-4 text-sm font-gothic tracking-wider border-b-2 transition-all ${
            activeTab === 'prompts'
              ? 'text-gold border-gold bg-blood/10'
              : 'text-gold-dim border-transparent hover:text-gold-light'
          }`}
        >
          提示词组装
        </button>
        <button
          onClick={() => setActiveTab('params')}
          className={`py-2 px-4 text-sm font-gothic tracking-wider border-b-2 transition-all ${
            activeTab === 'params'
              ? 'text-gold border-gold bg-blood/10'
              : 'text-gold-dim border-transparent hover:text-gold-light'
          }`}
        >
          生成参数
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'prompts' ? (
        <PromptOrderEditor
          blocks={preset.promptOrder}
          onUpdateBlock={onUpdateBlock}
          onReorderBlocks={onReorderBlocks}
          onToggleBlock={onToggleBlock}
        />
      ) : (
        <ParametersEditor
          params={preset.parameters}
          onUpdate={(params) => onUpdate({ parameters: { ...preset.parameters, ...params } })}
        />
      )}
    </div>
  );
}

// Prompt Order Editor
function PromptOrderEditor({
  blocks,
  onUpdateBlock,
  onReorderBlocks,
  onToggleBlock,
}: {
  blocks: PromptBlock[];
  onUpdateBlock: (blockId: string, updates: Partial<PromptBlock>) => void;
  onReorderBlocks: (ids: string[]) => void;
  onToggleBlock: (blockId: string) => void;
}) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState(blocks.sort((a, b) => a.position - b.position));

  useEffect(() => {
    setOrderItems(blocks.sort((a, b) => a.position - b.position));
  }, [blocks]);

  const handleReorder = (newOrder: PromptBlock[]) => {
    setOrderItems(newOrder);
    onReorderBlocks(newOrder.map((b) => b.id));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gold-dim mb-4">
        拖动调整提示词插入顺序。顺序影响最终发送给AI的上下文结构。
      </p>

      {orderItems.map((block, index) => (
        <div
          key={block.id}
          className={`border transition-all ${
            block.enabled ? 'bg-stone/40 border-gold-dim/30' : 'bg-void/50 border-gold-dim/10 opacity-50'
          }`}
        >
          <div className="p-3 flex items-start gap-3">
            {/* Drag Handle */}
            <div className="mt-1 text-gold-dim/30 cursor-grab active:cursor-grabbing">
              <GripVertical size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gold-dim/50 font-mono">{index + 1}</span>
                <span className="font-gothic text-sm text-gold-light">{block.name}</span>
                <span className="text-xs text-gold-dim/60">({block.role})</span>

                <label className="ml-auto flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={block.enabled}
                    onChange={() => onToggleBlock(block.id)}
                    className="accent-blood"
                  />
                  <span className="text-xs text-parchment">启用</span>
                </label>
              </div>

              {editingBlockId === block.id ? (
                <BlockEditor
                  block={block}
                  onSave={(updates) => {
                    onUpdateBlock(block.id, updates);
                    setEditingBlockId(null);
                  }}
                  onCancel={() => setEditingBlockId(null)}
                />
              ) : (
                <div
                  onClick={() => setEditingBlockId(block.id)}
                  className="bg-void p-2 text-xs text-parchment/70 cursor-pointer hover:border-gold/30 border border-transparent"
                >
                  {block.content ? (
                    <span className="line-clamp-2">{block.content}</span>
                  ) : (
                    <span className="text-gold-dim/40 italic">点击编辑内容...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Block Editor
function BlockEditor({
  block,
  onSave,
  onCancel,
}: {
  block: PromptBlock;
  onSave: (updates: Partial<PromptBlock>) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(block.content);
  const [role, setRole] = useState(block.role || 'system');

  return (
    <div className="bg-blood/5 p-3 border border-blood/30">
      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-gold-dim">角色:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as PromptBlock['role'])}
          className="bg-void border border-gold-dim/30 text-parchment text-xs p-1"
        >
          <option value="system">System</option>
          <option value="user">User</option>
          <option value="assistant">Assistant</option>
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none resize-none"
        placeholder="输入提示词内容..."
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSave({ content, role })}
          className="bg-blood/40 text-gold-light py-1 px-3 text-xs border border-blood/50"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="bg-void text-gold-dim py-1 px-3 text-xs border border-gold-dim/30"
        >
          取消
        </button>
      </div>
    </div>
  );
}

// Parameters Editor
function ParametersEditor({
  params,
  onUpdate,
}: {
  params: GenerationParameters;
  onUpdate: (params: Partial<GenerationParameters>) => void;
}) {
  const paramConfigs = [
    {
      key: 'temperature' as const,
      label: 'Temperature',
      icon: Thermometer,
      min: 0,
      max: 2,
      step: 0.1,
      description: '控制输出的随机性。值越高，回答越多样化。',
    },
    {
      key: 'maxTokens' as const,
      label: 'Max Tokens',
      icon: Hash,
      min: 1,
      max: 8192,
      step: 1,
      description: '生成内容的最大长度（token数）。',
    },
    {
      key: 'topP' as const,
      label: 'Top P',
      icon: Sliders,
      min: 0,
      max: 1,
      step: 0.05,
      description: '核采样阈值。与Temperature类似，但不要同时大幅调整两者。',
    },
    {
      key: 'frequencyPenalty' as const,
      label: 'Frequency Penalty',
      icon: AlertCircle,
      min: -2,
      max: 2,
      step: 0.1,
      description: '频率惩罚，减少重复用词。',
    },
    {
      key: 'presencePenalty' as const,
      label: 'Presence Penalty',
      icon: AlertCircle,
      min: -2,
      max: 2,
      step: 0.1,
      description: '存在惩罚，鼓励引入新话题。',
    },
  ];

  return (
    <div className="space-y-6">
      {paramConfigs.map((config) => (
        <div key={config.key} className="bg-stone/30 p-4 border border-gold-dim/20">
          <div className="flex items-center gap-2 mb-2">
            <config.icon size={16} className="text-gold-dim" />
            <label className="text-sm text-gold font-gothic">{config.label}</label>
            <span className="text-sm text-blood-light font-mono ml-auto">
              {params[config.key]}
            </span>
          </div>

          <input
            type="range"
            value={params[config.key]}
            onChange={(e) =>
              onUpdate({
                [config.key]:
                  config.step < 1
                    ? parseFloat(e.target.value)
                    : parseInt(e.target.value),
              })
            }
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full accent-blood mb-2"
          />

          <p className="text-xs text-gold-dim/60">{config.description}</p>
        </div>
      ))}
    </div>
  );
}
