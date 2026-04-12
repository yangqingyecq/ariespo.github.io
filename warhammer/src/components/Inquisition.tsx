import React from 'react';
import { Eye, AlertTriangle, Skull } from 'lucide-react';

export default function Inquisition() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8 border-b border-blood/30 pb-4">
        <h1 className="font-gothic text-4xl text-blood-light mb-2 flex items-center">
          <Eye className="mr-4" size={36} /> 神圣审判庭
        </h1>
        <p className="text-gold-dim tracking-widest">无辜者亦无辩护之权。保持警惕。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-obsidian border border-blood/50 p-6 relative overflow-hidden shadow-[0_0_30px_rgba(94,0,0,0.2)]">
          <div className="absolute -right-10 -top-10 text-blood/10">
            <Skull size={200} />
          </div>
          <h2 className="font-gothic text-2xl text-parchment mb-6 relative z-10">异端调查卷宗</h2>
          
          <div className="space-y-4 relative z-10">
            {[
              { id: 'IX-77', target: '基因邪教嫌疑', location: '哥特 Prime 下巢', status: '调查中', threat: '高' },
              { id: 'IX-78', target: '未注册灵能者', location: '丰饶 轨道站', status: '已肃清', threat: '低' },
            ].map(caseItem => (
              <div key={caseItem.id} className="border border-gold-dim/20 bg-stone p-4 hover:border-blood transition-colors cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-gothic text-gold-light">{caseItem.id} - {caseItem.target}</span>
                  <span className={`text-xs px-2 py-1 ${caseItem.status === '已肃清' ? 'bg-green-900/50 text-green-400' : 'bg-blood/50 text-parchment'}`}>
                    {caseItem.status}
                  </span>
                </div>
                <p className="text-sm text-parchment-dark">地点: {caseItem.location}</p>
                <p className="text-sm text-parchment-dark">威胁评估: <span className={caseItem.threat === '高' ? 'text-blood-light font-bold' : ''}>{caseItem.threat}</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-texture border-ornate p-6 flex flex-col items-center justify-center text-center">
          <AlertTriangle size={64} className="text-blood-light mb-6 animate-pulse" />
          <h2 className="font-gothic text-3xl text-blood-light mb-4">灭绝令授权</h2>
          <p className="text-parchment-dark mb-8 max-w-md">
            只有在星球彻底堕落，无可挽回之时，方可动用此等终极手段。此操作需要三名审判官或星区总督的最高授权。
          </p>
          <button className="bg-blood hover:bg-red-700 text-parchment font-gothic text-xl py-4 px-8 border-2 border-blood-light shadow-[0_0_20px_rgba(94,0,0,0.8)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)]">
            启动灭绝协议
          </button>
        </div>
      </div>
    </div>
  );
}
