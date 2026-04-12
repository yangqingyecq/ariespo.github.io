import React from 'react';
import { Users, ShieldAlert, Zap, Factory } from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { label: '帝国什一税', value: '85%', status: '可接受', icon: Zap, color: 'text-gold' },
  { label: '异端指数', value: '12%', status: '上升中', icon: ShieldAlert, color: 'text-blood-light' },
  { label: '忠诚度', value: '90%', status: '狂热', icon: Users, color: 'text-gold-light' },
  { label: '生产力', value: '1.2兆', status: '达标', icon: Factory, color: 'text-parchment' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="font-gothic text-4xl text-gold mb-2 text-glow">星域总览</h1>
        <p className="text-gold-dim tracking-widest">审视你的领地，总督。无知即是异端。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={stat.label}
              className="bg-stone-texture border-ornate p-6 relative group hover:bg-stone/80 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <Icon size={24} className={`${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <span className="text-xs font-gothic tracking-widest text-gold-dim px-2 py-1 border border-gold-dim/30 bg-obsidian/50">
                  {stat.status}
                </span>
              </div>
              <h3 className="text-3xl font-gothic text-parchment mb-1">{stat.value}</h3>
              <p className="text-sm text-gold-dim tracking-widest">{stat.label}</p>
              
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold opacity-50"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold opacity-50"></div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-stone-texture border-ornate p-6 min-h-[400px] flex flex-col">
          <h2 className="font-gothic text-2xl text-gold mb-6 border-b border-gold-dim/30 pb-2">星区星图</h2>
          <div className="flex-1 border border-gold-dim/20 bg-obsidian relative overflow-hidden flex items-center justify-center">
            {/* Stylized Map Placeholder - using CSS and icons to make it look like a tactical display */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]"></div>
            <div className="absolute w-full h-[1px] bg-gold-dim/20 top-1/2"></div>
            <div className="absolute h-full w-[1px] bg-gold-dim/20 left-1/2"></div>
            
            {/* Planets */}
            <div className="absolute top-1/4 left-1/4 flex flex-col items-center group cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.8)] animate-pulse"></div>
              <span className="mt-2 font-gothic text-xs text-gold-light opacity-0 group-hover:opacity-100 transition-opacity">主星: 哥特 Prime</span>
            </div>
            <div className="absolute top-2/3 left-1/3 flex flex-col items-center group cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-blood shadow-[0_0_10px_rgba(94,0,0,0.8)]"></div>
              <span className="mt-2 font-gothic text-xs text-blood-light opacity-0 group-hover:opacity-100 transition-opacity">铸造世界: 铁砧</span>
            </div>
            <div className="absolute top-1/3 right-1/4 flex flex-col items-center group cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-parchment-dark shadow-[0_0_5px_rgba(211,196,169,0.5)]"></div>
              <span className="mt-2 font-gothic text-xs text-parchment opacity-0 group-hover:opacity-100 transition-opacity">农业世界: 丰饶</span>
            </div>
            
            <p className="absolute bottom-4 right-4 text-xs text-gold-dim font-gothic tracking-widest opacity-50">战术鸟卜仪在线</p>
          </div>
        </div>

        <div className="bg-stone-texture border-ornate p-6 flex flex-col">
          <h2 className="font-gothic text-2xl text-gold mb-6 border-b border-gold-dim/30 pb-2">近期报告</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {[
              { title: "异形活动报告", desc: "在边缘星系检测到不明信号。", type: "warning", time: "2小时前" },
              { title: "什一税舰队抵达", desc: "第4舰队已抵达轨道，准备装载。", type: "info", time: "5小时前" },
              { title: "异端暴乱", desc: "下巢发生暴乱，当地执法官请求支援。", type: "danger", time: "12小时前" },
              { title: "大教堂竣工", desc: "圣徒大教堂已完成最后修缮。", type: "success", time: "1天前" },
            ].map((report, i) => (
              <div key={i} className="border-l-2 border-gold-dim pl-4 py-2 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-gothic text-sm ${report.type === 'danger' ? 'text-blood-light' : report.type === 'warning' ? 'text-gold' : 'text-parchment'}`}>
                    {report.title}
                  </h4>
                  <span className="text-[10px] text-gold-dim">{report.time}</span>
                </div>
                <p className="text-xs text-gold-dim/80">{report.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
