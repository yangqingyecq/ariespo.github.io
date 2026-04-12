import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, X, Gavel, FileText } from 'lucide-react';

export default function Administratum() {
  const [selectedPlanet, setSelectedPlanet] = useState<any>(null);

  const planets = [
    { id: 1, name: '哥特 Prime', type: '巢都世界', tithe: '最高级 (Exactis Extremis)', population: '1200亿', unrest: '中等' },
    { id: 2, name: '丰饶', type: '农业世界', tithe: '高级 (Exactis Prima)', population: '20亿', unrest: '低' },
    { id: 3, name: '铁砧', type: '铸造世界', tithe: '特殊 (Adeptus Mechanicus)', population: '未知', unrest: '极低' },
  ];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-gothic text-4xl text-gold mb-2 text-glow">内政部</h1>
        <p className="text-gold-dim tracking-widest">管理无尽的文书，这是维持帝国运转的鲜血。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 bg-stone-texture border-ornate p-6 flex flex-col">
          <h2 className="font-gothic text-2xl text-parchment mb-6 flex items-center">
            <Scroll className="mr-3 text-gold" /> 星区资产目录
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gold-dim/50 text-gold-dim font-gothic tracking-widest text-sm">
                  <th className="p-4">世界名称</th>
                  <th className="p-4">分类</th>
                  <th className="p-4">什一税等级</th>
                  <th className="p-4">人口估算</th>
                  <th className="p-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {planets.map((planet) => (
                  <tr key={planet.id} className="border-b border-gold-dim/20 hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-gothic text-parchment group-hover:text-gold-light transition-colors">{planet.name}</td>
                    <td className="p-4 text-sm text-parchment-dark">{planet.type}</td>
                    <td className="p-4 text-sm text-blood-light font-bold">{planet.tithe}</td>
                    <td className="p-4 text-sm text-parchment-dark">{planet.population}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedPlanet(planet)}
                        className="btn-gothic px-4 py-1 border border-gold-dim text-gold-dim hover:text-gold text-xs font-gothic tracking-widest"
                      >
                        审查档案
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-stone-texture border-ornate p-6">
          <h2 className="font-gothic text-2xl text-parchment mb-6 flex items-center">
            <Gavel className="mr-3 text-gold" /> 待批法令
          </h2>
          <div className="space-y-4">
            <div className="p-4 border border-gold-dim/30 bg-obsidian/50 relative group cursor-pointer hover:border-gold transition-colors">
              <h3 className="font-gothic text-gold-light mb-2">提高农业配额</h3>
              <p className="text-xs text-parchment-dark mb-4">要求“丰饶”世界增加20%产出以支援前线。</p>
              <div className="flex justify-end space-x-2">
                <button className="text-xs text-blood-light hover:text-red-400 font-gothic border border-blood-light px-2 py-1">否决</button>
                <button className="text-xs text-gold hover:text-gold-light font-gothic border border-gold px-2 py-1">批准</button>
              </div>
            </div>
            <div className="p-4 border border-gold-dim/30 bg-obsidian/50 relative group cursor-pointer hover:border-gold transition-colors">
              <h3 className="font-gothic text-gold-light mb-2">征兵令: 哥特 Prime</h3>
              <p className="text-xs text-parchment-dark mb-4">组建3个新的星界军步兵团。</p>
              <div className="flex justify-end space-x-2">
                <button className="text-xs text-blood-light hover:text-red-400 font-gothic border border-blood-light px-2 py-1">否决</button>
                <button className="text-xs text-gold hover:text-gold-light font-gothic border border-gold px-2 py-1">批准</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planet Detail Modal */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-parchment-texture w-full max-w-2xl border-ornate p-8 relative shadow-[0_0_50px_rgba(0,0,0,1)]"
            >
              <button 
                onClick={() => setSelectedPlanet(null)}
                className="absolute top-4 right-4 text-ink/50 hover:text-blood transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8 border-b-2 border-ink/20 pb-4">
                <FileText size={40} className="mx-auto text-ink/80 mb-4" />
                <h2 className="font-gothic text-4xl text-ink font-bold tracking-widest">{selectedPlanet.name}</h2>
                <p className="text-ink/60 tracking-widest uppercase mt-2 font-sans">官方档案记录</p>
              </div>

              <div className="grid grid-cols-2 gap-8 text-ink">
                <div>
                  <h4 className="font-gothic text-sm text-ink/60 border-b border-ink/20 mb-2">基本信息</h4>
                  <ul className="space-y-2 font-body">
                    <li><span className="font-bold">分类:</span> {selectedPlanet.type}</li>
                    <li><span className="font-bold">人口:</span> {selectedPlanet.population}</li>
                    <li><span className="font-bold">什一税:</span> <span className="text-blood font-bold">{selectedPlanet.tithe}</span></li>
                    <li><span className="font-bold">动乱指数:</span> {selectedPlanet.unrest}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-gothic text-sm text-ink/60 border-b border-ink/20 mb-2">总督批注</h4>
                  <p className="text-sm italic leading-relaxed">
                    该世界是星区的重要基石。必须确保其什一税按时缴纳，任何异端苗头必须被无情地扑灭。
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t-2 border-ink/20 flex justify-center space-x-6">
                <button className="btn-gothic px-6 py-2 border border-ink text-ink font-gothic tracking-widest hover:bg-ink hover:text-parchment">
                  调整税率
                </button>
                <button className="btn-gothic px-6 py-2 border border-blood text-blood font-gothic tracking-widest hover:bg-blood hover:text-parchment">
                  派遣仲裁官
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
