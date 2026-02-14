
import React from 'react';
import { Emoji } from '../constants';
import { APP_CONTENT } from '../content';

interface FinalProps {
  onRestart: () => void;
}

const Final: React.FC<FinalProps> = ({ onRestart }) => {
  const content = APP_CONTENT.final;
  const scrollingPhotos = APP_CONTENT.media.scrollingPhotos;

  return (
    <div className="h-full w-full max-w-7xl max-h-[95vh] flex items-center justify-center bg-white/40 backdrop-blur-md rounded-[60px] shadow-xl border border-white/60 relative overflow-hidden">
      
      {/* Left Column - Upwards Scroll */}
      <div className="absolute left-0 top-0 h-full w-24 md:w-56 overflow-hidden pointer-events-none opacity-30 border-r border-white/20">
        <div className="animate-[vertical-scroll_45s_linear_infinite] flex flex-col gap-6">
          {[...scrollingPhotos, ...scrollingPhotos].map((src, i) => (
            <img key={i} src={src} className="w-full rounded-3xl shadow-md border-2 border-white/40" alt="Gallery Left" />
          ))}
        </div>
      </div>

      {/* Right Column - Downwards Scroll */}
      <div className="absolute right-0 top-0 h-full w-24 md:w-56 overflow-hidden pointer-events-none opacity-30 border-l border-white/20">
        <div className="animate-[vertical-scroll-reverse_45s_linear_infinite] flex flex-col gap-6">
          {[...scrollingPhotos, ...scrollingPhotos].map((src, i) => (
            <img key={i} src={src} className="w-full rounded-3xl shadow-md border-2 border-white/40" alt="Gallery Right" />
          ))}
        </div>
      </div>

      <div className="max-w-3xl w-full h-[94%] bg-white/60 backdrop-blur-2xl rounded-[48px] p-8 md:p-12 shadow-sm border border-white/80 flex flex-col items-center text-center relative z-10 overflow-hidden mx-4 md:mx-10 my-4">
        <div className="text-4xl mb-4 text-pink-400 opacity-60 flex gap-4 animate-pulse">
          <Emoji char="🐰" /><Emoji char="💞" /><Emoji char="🦊" />
        </div>
        
        <h1 className="cursive text-4xl md:text-5xl lg:text-6xl text-pink-400 mb-6 leading-tight shrink-0 py-2 whitespace-nowrap">
          {content.title}
        </h1>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar px-4 md:px-10 mb-6 text-pink-900/70 font-light text-base md:text-lg lg:text-xl leading-relaxed italic text-justify tracking-wide">
          {content.paragraphs.map((p, i) => (
            <p key={i} className="mb-8">{p}</p>
          ))}
          <div className="flex flex-col items-center gap-2 mt-10">
            <p className="font-bold text-pink-500/80 text-2xl cursive">
              {content.closing}
            </p>
            <Emoji char="💗" className="text-3xl" />
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center mt-4">
          <p className="cursive text-4xl md:text-5xl text-pink-400 mb-8 py-2">{content.signature}</p>
          <button 
            onClick={onRestart}
            className="group relative px-20 py-4 bg-pink-300 hover:bg-pink-400 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3"
          >
            <span>Restart Journey</span>
            <Emoji char="✨" className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes vertical-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes vertical-scroll-reverse {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(244, 114, 182, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Final;
