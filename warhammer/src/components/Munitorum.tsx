import React from 'react';
import { Swords, Crosshair, Shield } from 'lucide-react';

export default function Munitorum() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-gothic text-4xl text-gold mb-2 text-glow">军务部</h1>
        <p className="text-gold-dim tracking-widest">以帝皇之名，用鲜血和钢铁守卫疆土。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-stone-texture border-ornate p-6">
          <h2 className="font-gothic text-2xl text-parchment mb-6 flex items-center">
            <Shield className="mr-3 text-gold" /> 星界军兵团
          </h2>
          <div className="space-y-4">
            {[
              { name: '卡迪安第812步兵团', status: '满编', location: '哥特 Prime 防御阵地' },
              { name: '克里格第44装甲团', status: '补给中', location: '铁砧 轨道船坞' },
              { name: '卡塔昌第9丛林斗士', status: '战斗中', location: '边缘星系 X-11' },
            ].map((regiment, i) => (
              <div key={i} className="p-4 border border-gold-dim/30 bg-obsidian/50 flex justify-between items-center">
                <div>
                  <h3 className="font-gothic text-gold-light">{regiment.name}</h3>
                  <p className="text-xs text-parchment-dark mt-1">驻地: {regiment.location}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 border ${regiment.status === '战斗中' ? 'border-blood text-blood-light' : 'border-gold-dim text-gold-dim'}`}>
                    {regiment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-texture border-ornate p-6">
          <h2 className="font-gothic text-2xl text-parchment mb-6 flex items-center">
            <Crosshair className="mr-3 text-gold" /> 帝国海军舰队
          </h2>
          <div className="space-y-4">
            <div className="p-4 border border-gold-dim/30 bg-obsidian/50">
              <h3 className="font-gothic text-gold-light mb-2">哥特舰队 - 第4分舰队</h3>
              <div className="w-full bg-stone h-2 mb-2">
                <div className="bg-gold h-2" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-parchment-dark">
                <span>战备状态: 75%</span>
                <span>旗舰: 帝皇之怒号 (战列舰)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
