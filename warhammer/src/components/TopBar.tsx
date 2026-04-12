import React from 'react';
import { BookOpen, Sliders, Settings } from 'lucide-react';
import { useModalStore } from '../stores/modalStore';
import { useLorebookStore } from '../stores/lorebookStore';
import { usePresetStore } from '../stores/presetStore';

export default function TopBar() {
  const { openModal } = useModalStore();
  const { activeLorebookIds } = useLorebookStore();
  const { activePresetId, presets } = usePresetStore();

  const activePreset = presets.find(p => p.id === activePresetId);

  return (
    <header className="h-16 bg-obsidian/80 backdrop-blur-md border-b border-gold-dim/30 flex items-center justify-between px-8 z-20 sticky top-0">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-1 bg-blood"></div>
        <div>
          <h2 className="font-gothic text-xl text-gold-light tracking-widest">哥特星区总督府</h2>
          <p className="text-xs text-gold-dim font-sans tracking-widest uppercase">Sector Governor Sanctum</p>
        </div>

        {/* Active Status Indicators */}
        <div className="ml-8 flex items-center gap-4">
          {activeLorebookIds.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gold-dim/70">
              <BookOpen size={12} />
              <span>{activeLorebookIds.length} 世界书</span>
            </div>
          )}
          {activePreset && (
            <div className="flex items-center gap-1.5 text-xs text-gold-dim/70">
              <Sliders size={12} />
              <span className="truncate max-w-[100px]">{activePreset.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-8">
        {/* Function Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('lorebook')}
            className="btn-gothic flex items-center gap-2 px-3 py-1.5 border border-gold-dim/30 text-gold-dim hover:text-gold hover:border-gold/50 transition-all text-xs"
            title="世界书管理"
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">创意工坊</span>
            {activeLorebookIds.length > 0 && (
              <span className="bg-blood/60 text-gold px-1.5 py-0.5 text-[10px] rounded-sm">
                {activeLorebookIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => openModal('preset')}
            className="btn-gothic flex items-center gap-2 px-3 py-1.5 border border-gold-dim/30 text-gold-dim hover:text-gold hover:border-gold/50 transition-all text-xs"
            title="对话预设"
          >
            <Sliders size={14} />
            <span className="hidden sm:inline">预设</span>
          </button>

          <button
            onClick={() => openModal('settings')}
            className="btn-gothic flex items-center gap-2 px-3 py-1.5 border border-gold-dim/30 text-gold-dim hover:text-gold hover:border-gold/50 transition-all text-xs"
            title="系统设置"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">设置</span>
          </button>
        </div>

        <div className="flex items-center space-x-8">
          <div className="text-right">
            <p className="text-xs text-gold-dim uppercase tracking-widest font-sans">当前纪元</p>
            <p className="font-gothic text-gold tracking-widest">0 120 999.M41</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gold-dim uppercase tracking-widest font-sans">威胁等级</p>
            <p className="font-gothic text-blood-light font-bold tracking-widest animate-pulse">极度危险 (EXTREME)</p>
          </div>
        </div>
      </div>
    </header>
  );
}
