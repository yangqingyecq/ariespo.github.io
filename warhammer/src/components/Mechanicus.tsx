import React from 'react';
import { Cog, Wrench } from 'lucide-react';

export default function Mechanicus() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-gothic text-4xl text-blood-light mb-2 text-glow">机械修会</h1>
        <p className="text-gold-dim tracking-widest">血肉苦弱，机械飞升。赞美万机之神。</p>
      </header>
      <div className="bg-obsidian border-2 border-blood/50 p-8 flex-1 relative overflow-hidden">
        {/* Background gear decoration */}
        <Cog size={400} className="absolute -right-20 -bottom-20 text-blood/5 animate-[spin_60s_linear_infinite]" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-gothic text-2xl text-parchment mb-6 flex items-center">
              <Wrench className="mr-3 text-blood-light" /> 生产配额
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-gothic text-gold-dim mb-1">
                  <span>黎曼鲁斯主战坦克</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-stone h-1">
                  <div className="bg-blood-light h-1" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-gothic text-gold-dim mb-1">
                  <span>激光步枪及弹药</span>
                  <span>110%</span>
                </div>
                <div className="w-full bg-stone h-1">
                  <div className="bg-blood-light h-1" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-l border-blood/30 pl-8">
            <h2 className="font-gothic text-2xl text-parchment mb-6">贤者请求</h2>
            <div className="bg-stone p-4 border border-blood/30">
              <p className="text-sm text-parchment-dark mb-4 font-mono">
                "请求分配额外的劳工至第4号锻造厂。当前的血肉消耗率超出了预期。赞美欧姆尼赛亚。"
              </p>
              <button className="text-xs text-blood-light hover:text-red-400 font-gothic border border-blood-light px-4 py-2 w-full">
                批准劳工调拨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
