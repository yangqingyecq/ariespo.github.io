import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Plus,
  Import,
  FileDown,
  Trash2,
  Edit3,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  Key,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import ModalBase from './ModalBase';
import { useLorebookStore } from '../../stores/lorebookStore';
import { useModalStore } from '../../stores/modalStore';
import type { Lorebook, LorebookEntry } from '../../types/lorebook';

export default function LorebookModal() {
  const { activeModal, closeModal } = useModalStore();
  const {
    lorebooks,
    activeLorebookIds,
    loadLorebooks,
    createLorebook,
    deleteLorebook,
    importLorebook,
    exportLorebook,
    toggleActiveLorebook,
    addEntry,
    updateEntry,
    deleteEntry,
    updateLorebook,
  } = useLorebookStore();

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [editingEntry, setEditingEntry] = useState<LorebookEntry | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);

  useEffect(() => {
    if (activeModal === 'lorebook') {
      loadLorebooks();
    }
  }, [activeModal, loadLorebooks]);

  const selectedBook = lorebooks.find((b) => b.id === selectedBookId);

  const handleCreateBook = async () => {
    if (!newBookName.trim()) return;
    const book = await createLorebook(newBookName);
    setNewBookName('');
    setIsCreating(false);
    setSelectedBookId(book.id);
  };

  const handleImport = async () => {
    const success = await importLorebook();
    if (success) {
      loadLorebooks();
    }
  };

  return (
    <ModalBase
      isOpen={activeModal === 'lorebook'}
      onClose={closeModal}
      title="创意工坊"
      subtitle="WORLD ANVIL - 世界书管理"
      maxWidth="full"
    >
      <div className="flex h-[60vh] gap-6">
        {/* Left Panel - Lorebook List */}
        <div className="w-80 flex flex-col border-r border-gold-dim/30 pr-4">
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
                    value={newBookName}
                    onChange={(e) => setNewBookName(e.target.value)}
                    placeholder="世界书名称..."
                    className="w-full bg-void border border-gold-dim/30 p-2 text-parchment placeholder:text-gold-dim/50 text-sm focus:border-gold outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBook()}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateBook}
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
            {lorebooks.map((book) => (
              <div
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className={`p-3 cursor-pointer border transition-all ${
                  selectedBookId === book.id
                    ? 'bg-blood/20 border-gold/50'
                    : 'bg-stone/50 border-gold-dim/20 hover:border-gold-dim/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-gold-dim flex-shrink-0" />
                      <span className="text-parchment font-gothic text-sm truncate">
                        {book.name}
                      </span>
                    </div>
                    <p className="text-xs text-gold-dim/60 mt-1">
                      {book.entries.length} 条目
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActiveLorebook(book.id);
                    }}
                    className={`w-6 h-6 flex items-center justify-center border transition-all ${
                      activeLorebookIds.includes(book.id)
                        ? 'bg-blood/60 border-blood text-gold'
                        : 'bg-void border-gold-dim/30 text-gold-dim/30 hover:text-gold-dim'
                    }`}
                    title={activeLorebookIds.includes(book.id) ? '已激活' : '点击激活'}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            ))}

            {lorebooks.length === 0 && (
              <div className="text-center py-8 text-gold-dim/50">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">暂无世界书</p>
                <p className="text-xs">导入或创建一个新的</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedBook ? (
            <LorebookEditor
              book={selectedBook}
              onDelete={() => {
                deleteLorebook(selectedBook.id);
                setSelectedBookId(null);
              }}
              onExport={() => exportLorebook(selectedBook.id)}
              onUpdate={(updates) => updateLorebook(selectedBook.id, updates)}
              onAddEntry={(entry) => addEntry(selectedBook.id, entry)}
              onUpdateEntry={(id, updates) => updateEntry(selectedBook.id, id, updates)}
              onDeleteEntry={(id) => deleteEntry(selectedBook.id, id)}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              showEntryForm={showEntryForm}
              setShowEntryForm={setShowEntryForm}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gold-dim/50">
              <BookOpen size={48} className="mb-4 opacity-30" />
              <p className="font-gothic tracking-widest">选择一个世界书以编辑</p>
              <p className="text-xs mt-2 opacity-50">或从左侧创建新的</p>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
}

// Entry Editor Component
function LorebookEditor({
  book,
  onDelete,
  onExport,
  onUpdate,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  editingEntry,
  setEditingEntry,
  showEntryForm,
  setShowEntryForm,
}: {
  book: Lorebook;
  onDelete: () => void;
  onExport: () => void;
  onUpdate: (updates: Partial<Lorebook>) => void;
  onAddEntry: (entry: Omit<LorebookEntry, 'id'>) => void;
  onUpdateEntry: (id: string, updates: Partial<LorebookEntry>) => void;
  onDeleteEntry: (id: string) => void;
  editingEntry: LorebookEntry | null;
  setEditingEntry: (entry: LorebookEntry | null) => void;
  showEntryForm: boolean;
  setShowEntryForm: (show: boolean) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(book.name);

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
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="bg-void border border-gold/50 p-2 text-gold-light font-gothic text-xl outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                onBlur={handleSaveName}
                autoFocus
              />
            </div>
          ) : (
            <h3
              className="text-xl font-gothic text-gold-light cursor-pointer hover:text-gold"
              onClick={() => setIsEditingName(true)}
            >
              {book.name}
            </h3>
          )}
          <p className="text-xs text-gold-dim mt-1">
            {book.entries.length} 条目 | 创建于{' '}
            {new Date(book.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="p-2 text-gold-dim hover:text-gold border border-gold-dim/30 hover:border-gold/50 transition-all"
            title="导出"
          >
            <FileDown size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gold-dim hover:text-blood-light border border-gold-dim/30 hover:border-blood/50 transition-all"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-6 p-4 bg-stone/30 border border-gold-dim/20">
        <h4 className="text-sm font-gothic text-gold mb-3 flex items-center gap-2">
          <Settings size={14} />
          世界书设置
        </h4>
        <div className="flex gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={book.recursiveScanning}
              onChange={(e) => onUpdate({ recursiveScanning: e.target.checked })}
              className="accent-blood"
            />
            <span className="text-parchment">递归扫描</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={book.caseSensitive}
              onChange={(e) => onUpdate({ caseSensitive: e.target.checked })}
              className="accent-blood"
            />
            <span className="text-parchment">区分大小写</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={book.matchWholeWords}
              onChange={(e) => onUpdate({ matchWholeWords: e.target.checked })}
              className="accent-blood"
            />
            <span className="text-parchment">整词匹配</span>
          </label>
        </div>
      </div>

      {/* Add Entry Button */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-gothic text-gold">条目列表</h4>
        <button
          onClick={() => {
            setEditingEntry(null);
            setShowEntryForm(!showEntryForm);
          }}
          className="btn-gothic bg-blood/20 border border-blood/50 text-gold-light py-1.5 px-3 flex items-center gap-2 text-xs"
        >
          <Plus size={14} />
          {showEntryForm ? '取消' : '添加条目'}
        </button>
      </div>

      {/* Entry Form */}
      <AnimatePresence>
        {(showEntryForm || editingEntry) && (
          <EntryForm
            entry={editingEntry}
            onSave={(data) => {
              if (editingEntry) {
                onUpdateEntry(editingEntry.id, data);
                setEditingEntry(null);
              } else {
                onAddEntry(data);
              }
              setShowEntryForm(false);
            }}
            onCancel={() => {
              setEditingEntry(null);
              setShowEntryForm(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Entries List */}
      <div className="space-y-3">
        {book.entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            index={index}
            onEdit={() => {
              setEditingEntry(entry);
              setShowEntryForm(true);
            }}
            onDelete={() => onDeleteEntry(entry.id)}
          />
        ))}

        {book.entries.length === 0 && !showEntryForm && (
          <div className="text-center py-8 border border-dashed border-gold-dim/30">
            <Key size={24} className="mx-auto mb-2 text-gold-dim/30" />
            <p className="text-xs text-gold-dim/50">暂无条目</p>
            <p className="text-xs text-gold-dim/30">点击上方按钮添加</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Entry Card Component
function EntryCard({
  entry,
  index,
  onEdit,
  onDelete,
}: {
  entry: LorebookEntry;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  key?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const positionLabels: Record<string, string> = {
    before_char: '角色前',
    after_char: '角色后',
    before_example: '示例前',
    after_example: '示例后',
    at_depth: `深度 ${entry.depth}`,
  };

  return (
    <div className="border border-gold-dim/30 bg-stone/20 hover:bg-stone/40 transition-all">
      <div
        className="p-3 flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gold-dim/50 font-mono">#{index + 1}</span>
            <div className="flex flex-wrap gap-1">
              {entry.keys.slice(0, 3).map((k, i) => (
                <span
                  key={i}
                  className="text-xs bg-blood/20 text-gold-light px-1.5 py-0.5 border border-blood/30"
                >
                  {k}
                </span>
              ))}
              {entry.keys.length > 3 && (
                <span className="text-xs text-gold-dim/50">+{entry.keys.length - 3}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gold-dim/60">
            <span>顺序: {entry.order}</span>
            <span>位置: {positionLabels[entry.position]}</span>
            {entry.constant && <span className="text-blood-light">始终插入</span>}
            {entry.probability < 100 && (
              <span>概率: {entry.probability}%</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-gold-dim/20 pt-3">
              <div className="bg-void p-3 text-sm text-parchment/80 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                {entry.content || <span className="text-gold-dim/40 italic">无内容</span>}
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="text-xs text-gold-dim hover:text-gold flex items-center gap-1"
                >
                  <Edit3 size={12} /> 编辑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-xs text-gold-dim hover:text-blood-light flex items-center gap-1"
                >
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Entry Form Component
function EntryForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: LorebookEntry | null;
  onSave: (data: Omit<LorebookEntry, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Omit<LorebookEntry, 'id'>>(
    entry || {
      keys: [],
      content: '',
      order: 100,
      position: 'after_char',
      selective: false,
      selectiveLogic: 'or',
      constant: false,
      probability: 100,
      addMemo: true,
    }
  );
  const [keysInput, setKeysInput] = useState(entry?.keys.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      keys: keysInput.split(',').map((k) => k.trim()).filter(Boolean),
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-blood/5 border border-blood/30"
    >
      <h4 className="text-sm font-gothic text-gold mb-4">
        {entry ? '编辑条目' : '新条目'}
      </h4>

      <div className="space-y-4">
        {/* Keywords */}
        <div>
          <label className="text-xs text-gold-dim block mb-1.5">
            关键词 (用逗号分隔)
          </label>
          <input
            type="text"
            value={keysInput}
            onChange={(e) => setKeysInput(e.target.value)}
            placeholder="例如: forest, woods, tree"
            className="w-full bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-xs text-gold-dim block mb-1.5">内容</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            placeholder="当关键词匹配时插入的内容..."
            className="w-full bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none resize-none"
          />
        </div>

        {/* Position & Order */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gold-dim block mb-1.5">插入位置</label>
            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value as LorebookEntry['position'] })
              }
              className="w-full bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none"
            >
              <option value="before_char">角色定义前</option>
              <option value="after_char">角色定义后</option>
              <option value="before_example">示例消息前</option>
              <option value="after_example">示例消息后</option>
              <option value="at_depth">指定深度</option>
            </select>
          </div>

          {formData.position === 'at_depth' && (
            <div>
              <label className="text-xs text-gold-dim block mb-1.5">深度</label>
              <input
                type="number"
                value={formData.depth || 4}
                onChange={(e) => setFormData({ ...formData, depth: parseInt(e.target.value) })}
                min={0}
                max={999}
                className="w-full bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gold-dim block mb-1.5">顺序 (越小越前)</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              min={0}
              max={1000}
              className="w-full bg-void border border-gold-dim/30 p-2 text-parchment text-sm focus:border-gold outline-none"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.constant}
              onChange={(e) => setFormData({ ...formData, constant: e.target.checked })}
              className="accent-blood"
            />
            <span className="text-parchment">始终插入</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.selective}
              onChange={(e) => setFormData({ ...formData, selective: e.target.checked })}
              className="accent-blood"
            />
            <span className="text-parchment">选择性匹配</span>
          </label>
          {formData.selective && (
            <select
              value={formData.selectiveLogic}
              onChange={(e) =>
                setFormData({ ...formData, selectiveLogic: e.target.value as 'and' | 'or' })
              }
              className="bg-void border border-gold-dim/30 text-parchment text-xs"
            >
              <option value="or">OR (任一匹配)</option>
              <option value="and">AND (全部匹配)</option>
            </select>
          )}
        </div>

        {/* Probability */}
        {!formData.constant && (
          <div>
            <label className="text-xs text-gold-dim block mb-1.5">
              触发概率: {formData.probability}%
            </label>
            <input
              type="range"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
              min={1}
              max={100}
              className="w-full accent-blood"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="flex-1 bg-blood/40 text-gold-light py-2 text-sm border border-blood/50 btn-gothic"
        >
          {entry ? '保存修改' : '添加条目'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-void text-gold-dim py-2 text-sm border border-gold-dim/30"
        >
          取消
        </button>
      </div>
    </motion.form>
  );
}
