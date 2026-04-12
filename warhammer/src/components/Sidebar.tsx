import React from 'react';
import { Shield, Scroll, Swords, Eye, Flame, Cog, MessageSquare, Skull } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { id: 'dashboard', label: '星域总览', icon: Shield, desc: 'Sector Overview' },
  { id: 'astropath', label: '星语通讯', icon: MessageSquare, desc: 'Astropathic Choir' },
  { id: 'administratum', label: '内政部', icon: Scroll, desc: 'Adeptus Administratum' },
  { id: 'munitorum', label: '军务部', icon: Swords, desc: 'Departmento Munitorum' },
  { id: 'inquisition', label: '审判庭', icon: Eye, desc: 'The Inquisition' },
  { id: 'ministorum', label: '国教', icon: Flame, desc: 'Adeptus Ministorum' },
  { id: 'mechanicus', label: '机械修会', icon: Cog, desc: 'Adeptus Mechanicus' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-72 bg-obsidian border-r border-gold-dim flex flex-col relative z-20 shadow-[5px_0_20px_rgba(0,0,0,0.8)]">
      <div className="p-6 border-b border-gold-dim/30 flex flex-col items-center justify-center">
        <div className="w-20 h-20 mb-4 rounded-full border-2 border-gold flex items-center justify-center bg-blood shadow-[0_0_15px_rgba(94,0,0,0.8)] relative overflow-hidden">
           <Skull size={40} className="text-gold-light" />
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10"></div>
        </div>
        <h1 className="font-gothic text-2xl text-gold text-center tracking-widest font-bold">神圣泰拉<br/>疆域管理</h1>
        <p className="text-gold-dim text-xs mt-2 tracking-widest uppercase font-gothic">Imperium of Man</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-sm transition-all duration-300 group relative overflow-hidden ${
                isActive ? 'bg-blood/20 border-l-2 border-gold' : 'hover:bg-stone border-l-2 border-transparent hover:border-gold-dim'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-blood/40 to-transparent z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className={`relative z-10 mr-4 transition-colors duration-300 ${isActive ? 'text-gold' : 'text-gold-dim group-hover:text-gold-light'}`} />
              <div className="flex flex-col items-start relative z-10">
                <span className={`font-gothic tracking-wider text-lg ${isActive ? 'text-gold-light text-glow' : 'text-parchment group-hover:text-white'}`}>
                  {item.label}
                </span>
                <span className="text-[10px] text-gold-dim/60 uppercase tracking-widest font-sans">{item.desc}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gold-dim/30 text-center">
        <p className="text-blood-light font-gothic text-sm tracking-widest">帝皇庇佑</p>
        <p className="text-gold-dim/40 text-xs mt-1">The Emperor Protects</p>
      </div>
    </div>
  );
}
