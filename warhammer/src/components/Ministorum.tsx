import React from 'react';
import { Flame } from 'lucide-react';

export default function Ministorum() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-gothic text-4xl text-gold mb-2 text-glow">国教</h1>
        <p className="text-gold-dim tracking-widest">信仰是抵御异端的坚实护盾。</p>
      </header>
      <div className="bg-stone-texture border-ornate p-8 text-center flex-1 flex flex-col items-center justify-center">
        <Flame size={80} className="text-gold mb-6 animate-pulse" />
        <h2 className="font-gothic text-3xl text-parchment mb-4">信仰指数稳定</h2>
        <p className="text-parchment-dark max-w-2xl mx-auto mb-8">
          各教区主教报告，群众对神明帝皇的信仰依然坚定。然而，下巢区域的布道工作需要加强。
        </p>
        <button className="btn-gothic px-8 py-3 border border-gold text-gold font-gothic tracking-widest hover:bg-gold/10">
          颁布全星区祈祷日
        </button>
      </div>
    </div>
  );
}
