import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Administratum from './components/Administratum';
import Munitorum from './components/Munitorum';
import Inquisition from './components/Inquisition';
import Ministorum from './components/Ministorum';
import Mechanicus from './components/Mechanicus';
import Astropath from './components/Astropath';

// Modals
import LorebookModal from './components/modals/LorebookModal';
import PresetModal from './components/modals/PresetModal';
import SettingsModal from './components/modals/SettingsModal';

// Database initialization
import { initializeDatabase } from './lib/db';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-void text-gold-dim">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-gothic tracking-widest">初始化数据库...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'administratum': return <Administratum />;
      case 'munitorum': return <Munitorum />;
      case 'inquisition': return <Inquisition />;
      case 'ministorum': return <Ministorum />;
      case 'mechanicus': return <Mechanicus />;
      case 'astropath': return <Astropath />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-void text-parchment font-body selection:bg-blood selection:text-gold-light">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      {/* Modals */}
      <LorebookModal />
      <PresetModal />
      <SettingsModal />
    </div>
  );
}
