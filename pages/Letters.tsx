
import React, { useState } from 'react';
import { Envelope } from '../types';
import { HeartIcon, Emoji } from '../constants';
import { APP_CONTENT } from '../content';

interface LettersProps {
  envelopes: Envelope[];
  onRead: (id: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const Letters: React.FC<LettersProps> = ({ envelopes, onRead, onNext, onBack }) => {
  const [selected, setSelected] = useState<Envelope | null>(null);
  const content = APP_CONTENT.letters;
  const memories = APP_CONTENT.media.letterMemories;

  const openLetter = (env: Envelope) => {
    setSelected(env);
    onRead(env.id);
  };

  const allRead = envelopes.length > 0 && envelopes.every(env => env.status === 'read');

  const getEnvBg = (type: Envelope['type'], status: 'read' | 'unread') => {
    const isUnread = status === 'unread';
    switch (type) {
      case 'striped': return isUnread ? 'bg-[#FFB7C5] border-pink-400' : 'bg-[#FFB7C5]/40 border-pink-400/30';
      case 'red': return isUnread ? 'bg-[#fa003f] border-[#fa003f]/50' : 'bg-[#fa003f]/40 border-[#fa003f]/20';
      case 'white': return isUnread ? 'bg-white border-gray-200' : 'bg-white/40 border-gray-200/30';
      case 'black': return isUnread ? 'bg-[#222] border-black' : 'bg-[#222]/40 border-black/30';
      default: return 'bg-pink-300';
    }
  };

  const getBallStamp = (type: Envelope['type']) => {
    const configs = {
      striped: { color: '#FFB7C5', label: 'Striped Ball', emoji: '🎀' },
      red: { color: '#fa003f', label: 'Solid Ball', emoji: '❤️' },
      white: { color: '#fff', border: '#eee', label: 'Free Ball', emoji: '✨' },
      black: { color: '#222', label: 'Winner Ball', emoji: '👑' }
    };
    const config = (configs as any)[type] || configs.striped;
    return (
      <div className="flex items-center gap-2 mb-4 bg-pink-50/50 px-4 py-2 rounded-full border border-pink-100/50 self-start">
        <div 
          className="w-5 h-5 rounded-full border border-white/80 shadow-sm" 
          style={{ 
            backgroundColor: config.color,
            backgroundImage: type === 'striped' ? 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.7) 25%, rgba(255,255,255,0.7) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.7) 75%, rgba(255,255,255,0.7))' : 'none',
            backgroundSize: '10px 10px'
          }} 
        />
        <span className="text-xs font-bold uppercase tracking-widest text-pink-400/80 flex items-center gap-1">
          From {config.label} <Emoji char={config.emoji} />
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-white/40 rounded-[48px] p-16 flex flex-col items-center overflow-y-auto custom-scrollbar relative">
      <div className="w-full max-w-5xl flex justify-between items-start mb-8 z-10">
        <button 
          onClick={onBack}
          className="px-6 py-2 rounded-full border border-pink-100 text-pink-400 font-bold hover:bg-white/60 transition-all flex items-center gap-2 group shadow-sm bg-white/40"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Pool
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="cursive text-8xl text-pink-500 mb-2 flex items-center justify-center">
          <HeartIcon className="w-12 h-12 mr-4 text-pink-300" />
          {content.mainTitle}
        </h2>
        <p className="cursive text-4xl text-pink-400/80 mb-4">
          {content.subtitle} <Emoji char="🌚" />
        </p>
        <p className={`text-pink-400 font-medium text-lg italic ${allRead ? 'opacity-40' : 'animate-pulse'}`}>
          {allRead ? content.allReadMessage : content.unreadReminder}
        </p>
      </div>
      
      {envelopes.length === 0 ? (
        <div className="flex flex-col items-center gap-6 mt-10">
          <p className="text-3xl text-pink-200 italic flex items-center gap-4">
            {content.emptyInventory} <Emoji char="💌" />
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 w-full max-w-5xl px-4 mb-20">
            {envelopes.slice().reverse().map((env) => (
              <button
                key={env.id}
                onClick={() => openLetter(env)}
                className={`aspect-[4/3] rounded-3xl flex items-center justify-center text-xl transition-all hover:scale-110 shadow-lg border-2 ${getEnvBg(env.type, env.status)}`}
              >
                <Emoji char={env.status === 'read' ? '📖' : '💌'} className={`text-6xl ${env.type === 'black' ? 'brightness-200' : ''}`} />
              </button>
            ))}
          </div>

          <div className="w-full max-w-6xl mt-12 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="h-[1px] w-24 bg-pink-200" />
              <h3 className="cursive text-5xl text-pink-400">我也CENI BLULU TOO NA!!!</h3>
              <div className="h-[1px] w-24 bg-pink-200" />
            </div>
            
            <div className="flex flex-row flex-nowrap overflow-x-auto lg:overflow-x-visible justify-start md:justify-center gap-8 md:gap-12 px-4 pb-8 custom-scrollbar">
              {memories.slice(0, 4).map((url, i) => (
                <div 
                  key={i}
                  className="group relative flex-shrink-0 p-4 pb-12 bg-white shadow-2xl rounded-sm border border-gray-100 transition-all duration-500 hover:scale-110 hover:-translate-y-4 hover:z-50"
                  style={{ 
                    transform: `rotate(${i % 2 === 0 ? '-' : ''}${i * 3 + 2}deg)`,
                  }}
                >
                  <div className="w-44 h-44 md:w-56 md:h-56 overflow-hidden rounded-xs bg-gray-50">
                    <img src={url} alt="Extra Memory" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className="absolute bottom-3 left-0 w-full text-center">
                    <Emoji char="💗" className="text-sm opacity-30 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-20 flex flex-col items-center z-10 w-full pb-20">
        <button 
          onClick={onNext}
          disabled={!allRead}
          className={`px-20 py-6 rounded-full font-bold text-2xl shadow-2xl transition-all flex items-center gap-3 ${
            allRead 
            ? 'bg-pink-400 text-white hover:bg-pink-500 hover:scale-105 active:scale-95 animate-in fade-in' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 grayscale shadow-none border border-gray-400/20'
          }`}
        >
          {content.footerButtonReady} {allRead && <Emoji char="🧸" />}
        </button>
        <p className={`mt-6 text-pink-400/60 text-sm italic text-center max-w-sm font-light ${!allRead ? 'opacity-40' : ''}`}>
          {content.footerSmallNote}
        </p>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[2000] flex items-center justify-center p-8" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[48px] p-12 max-w-xl w-full shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
            <img src={selected.image} className="w-full h-64 object-cover rounded-[32px] mb-8 shadow-sm" alt="Letter Image" />
            {getBallStamp(selected.type)}
            <h3 className="cursive text-6xl text-pink-500 mb-6">{selected.title}</h3>
            <p className="text-gray-600 leading-relaxed text-xl font-light italic mb-10">"{selected.message}"</p>
            <button 
              onClick={() => setSelected(null)}
              className="w-full bg-pink-100 text-pink-500 py-4 rounded-3xl font-bold text-xl hover:bg-pink-200 transition-all"
            >
              Close Memory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Letters;
