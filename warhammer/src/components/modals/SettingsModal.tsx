import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Key,
  Server,
  Database,
  Download,
  Upload,
  AlertTriangle,
  Check,
  User,
  Bot,
  Save,
  Trash2,
} from 'lucide-react';
import ModalBase from './ModalBase';
import { useSettingsStore } from '../../stores/settingsStore';
import { useModalStore } from '../../stores/modalStore';
import { useLorebookStore } from '../../stores/lorebookStore';
import { usePresetStore } from '../../stores/presetStore';

export default function SettingsModal() {
  const { activeModal, closeModal } = useModalStore();
  const { settings, loadSettings, updateSettings, updateApiSettings, exportAllData, importAllData } = useSettingsStore();
  const { loadLorebooks } = useLorebookStore();
  const { loadPresets } = usePresetStore();

  const [activeTab, setActiveTab] = useState<'api' | 'profile' | 'backup'>('api');
  const [localApiSettings, setLocalApiSettings] = useState(settings.api);
  const [localProfile, setLocalProfile] = useState({
    userName: settings.userName,
    characterName: settings.characterName,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (activeModal === 'settings') {
      loadSettings();
      setLocalApiSettings(settings.api);
      setLocalProfile({
        userName: settings.userName,
        characterName: settings.characterName,
      });
    }
  }, [activeModal, loadSettings]);

  const handleSaveApi = async () => {
    setSaveStatus('saving');
    await updateApiSettings(localApiSettings);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    await updateSettings(localProfile);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handleExport = () => {
    exportAllData();
  };

  const handleImport = async () => {
    const success = await importAllData();
    if (success) {
      await Promise.all([loadSettings(), loadLorebooks(), loadPresets()]);
    }
  };

  return (
    <ModalBase
      isOpen={activeModal === 'settings'}
      onClose={closeModal}
      title="系统设置"
      subtitle="SYSTEM CONFIGURATION"
      maxWidth="lg"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gold-dim/30">
        <button
          onClick={() => setActiveTab('api')}
          className={`py-2 px-4 text-sm font-gothic tracking-wider border-b-2 transition-all ${
            activeTab === 'api'
              ? 'text-gold border-gold bg-blood/10'
              : 'text-gold-dim border-transparent hover:text-gold-light'
          }`}
        >
          <div className="flex items-center gap-2">
            <Key size={14} />
            API 配置
          </div>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-4 text-sm font-gothic tracking-wider border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'text-gold border-gold bg-blood/10'
              : 'text-gold-dim border-transparent hover:text-gold-light'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={14} />
            角色配置
          </div>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2 px-4 text-sm font-gothic tracking-wider border-b-2 transition-all ${
            activeTab === 'backup'
              ? 'text-gold border-gold bg-blood/10'
              : 'text-gold-dim border-transparent hover:text-gold-light'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database size={14} />
            备份管理
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-blood/5 border border-blood/30 p-4">
            <div className="flex items-center gap-2 text-blood-light mb-2">
              <AlertTriangle size={16} />
              <span className="text-xs font-gothic">安全提示</span>
            </div>
            <p className="text-xs text-gold-dim/70">
              API 密钥仅存储在本地浏览器中。请勿在公共设备上保存敏感密钥。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gold-dim block mb-2 flex items-center gap-2">
                <Server size={14} />
                API 基础 URL
              </label>
              <input
                type="text"
                value={localApiSettings.baseUrl}
                onChange={(e) =>
                  setLocalApiSettings({ ...localApiSettings, baseUrl: e.target.value })
                }
                placeholder="https://api.openai.com/v1"
                className="w-full bg-void border border-gold-dim/30 p-3 text-parchment text-sm focus:border-gold outline-none"
              />
              <p className="text-xs text-gold-dim/50 mt-1">
                支持 OpenAI 兼容格式的 API 端点
              </p>
            </div>

            <div>
              <label className="text-xs text-gold-dim block mb-2 flex items-center gap-2">
                <Key size={14} />
                API 密钥
              </label>
              <input
                type="password"
                value={localApiSettings.apiKey}
                onChange={(e) =>
                  setLocalApiSettings({ ...localApiSettings, apiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full bg-void border border-gold-dim/30 p-3 text-parchment text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gold-dim block mb-2 flex items-center gap-2">
                <Bot size={14} />
                模型名称
              </label>
              <input
                type="text"
                value={localApiSettings.model}
                onChange={(e) =>
                  setLocalApiSettings({ ...localApiSettings, model: e.target.value })
                }
                placeholder="gpt-3.5-turbo"
                className="w-full bg-void border border-gold-dim/30 p-3 text-parchment text-sm focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gold-dim block mb-2">
                超时时间 (毫秒)
              </label>
              <input
                type="number"
                value={localApiSettings.timeout}
                onChange={(e) =>
                  setLocalApiSettings({
                    ...localApiSettings,
                    timeout: parseInt(e.target.value) || 60000,
                  })
                }
                min={1000}
                max={300000}
                step={1000}
                className="w-full bg-void border border-gold-dim/30 p-3 text-parchment text-sm focus:border-gold outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveApi}
            disabled={saveStatus !== 'idle'}
            className="w-full btn-gothic bg-blood/20 border border-blood/50 text-gold-light py-3 flex items-center justify-center gap-2"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check size={18} />
                已保存
              </>
            ) : (
              <>
                <Save size={18} />
                保存 API 设置
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gold-dim block mb-2 flex items-center gap-2">
                <User size={14} />
                你的名称 (User)
              </label>
              <input
                type="text"
                value={localProfile.userName}
                onChange={(e) =>
                  setLocalProfile({ ...localProfile, userName: e.target.value })
                }
                placeholder="用户"
                className="w-full bg-void border border-gold-dim/30 p-3 text-parchment text-sm focus:border-gold outline-none"
              />
              <p className="text-xs text-gold-dim/50 mt-1">
                用于替换提示词中的 {"{{user}}"} 宏
              </p>
            </div>

            <div>
              <label className="text-xs text-gold-dim block mb-2 flex items-center gap-2">
                <Bot size={14} />
                AI 角色名称 (Character)
              </label>
              <input
                type="text"
                value={localProfile.characterName}
                onChange={(e) =>
                  setLocalProfile({ ...localProfile, characterName: e.target.value })
                }
                placeholder="AI助手"
                className="w-full bg-void border border-gold-dim/30 p-3 text-parchment text-sm focus:border-gold outline-none"
              />
              <p className="text-xs text-gold-dim/50 mt-1">
                用于替换提示词中的 {"{{char}}"} 宏
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saveStatus !== 'idle'}
            className="w-full btn-gothic bg-blood/20 border border-blood/50 text-gold-light py-3 flex items-center justify-center gap-2"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check size={18} />
                已保存
              </>
            ) : (
              <>
                <Save size={18} />
                保存角色配置
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-stone/30 border border-gold-dim/20 p-4">
            <h4 className="text-sm font-gothic text-gold mb-2 flex items-center gap-2">
              <Database size={14} />
              数据备份
            </h4>
            <p className="text-xs text-gold-dim/70 mb-4">
              导出所有世界书、预设、聊天记录和设置为单个 JSON 文件。可用于备份或在其他设备上恢复。
            </p>
            <button
              onClick={handleExport}
              className="w-full btn-gothic bg-blood/20 border border-blood/50 text-gold-light py-2 flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              导出全部数据
            </button>
          </div>

          <div className="bg-stone/30 border border-gold-dim/20 p-4">
            <h4 className="text-sm font-gothic text-gold mb-2 flex items-center gap-2">
              <Upload size={14} />
              恢复数据
            </h4>
            <p className="text-xs text-gold-dim/70 mb-4">
              从之前导出的备份文件恢复数据。这将合并现有数据。
            </p>
            <button
              onClick={handleImport}
              className="w-full btn-gothic bg-stone border border-gold-dim/50 text-gold-dim hover:text-gold py-2 flex items-center justify-center gap-2 text-sm"
            >
              <Upload size={16} />
              导入备份文件
            </button>
          </div>

          <div className="bg-blood/5 border border-blood/20 p-4">
            <h4 className="text-sm font-gothic text-blood-light mb-2 flex items-center gap-2">
              <Trash2 size={14} />
              清除数据
            </h4>
            <p className="text-xs text-gold-dim/70 mb-4">
              清除所有本地存储的数据。此操作不可恢复。
            </p>
            <button
              onClick={async () => {
                if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
                  localStorage.clear();
                  indexedDB.deleteDatabase('SillyTavernWebDB');
                  window.location.reload();
                }
              }}
              className="w-full btn-gothic bg-blood/40 border border-blood text-parchment hover:bg-blood/60 py-2 text-sm"
            >
              清除所有本地数据
            </button>
          </div>
        </div>
      )}
    </ModalBase>
  );
}
