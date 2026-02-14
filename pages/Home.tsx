
import React from 'react';
import { Emoji } from '../constants';
import { APP_CONTENT } from '../content';

interface HomeProps {
  onNext: () => void;
}

const Home: React.FC<HomeProps> = ({ onNext }) => {
  const content = APP_CONTENT.home;
  return (
    <div className="h-full w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[48px] overflow-hidden transition-all duration-1000 shadow-xl border border-white/60 p-10 relative">
      <div className="absolute top-10 left-10 text-4xl opacity-30">
        <Emoji char="🎀" />
      </div>
      <div className="absolute bottom-10 right-10 text-4xl opacity-30">
        <Emoji char="💗" />
      </div>

      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <h1 className="cursive text-7xl md:text-[8rem] lg:text-[10rem] text-pink-400 mb-8 tracking-tight text-center py-4">{content.title}</h1>
        
        <button 
          onClick={onNext}
          className="group relative px-20 py-6 bg-pink-300 hover:bg-pink-400 text-white rounded-full font-bold text-3xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <span className="relative z-10">{content.buttonText}</span>
          <Emoji char="❤️" className="text-4xl animate-pulse" />
        </button>
        
        <p className="mt-10 text-pink-600/60 text-lg font-light tracking-[0.2em] uppercase italic">
          {content.subtitle}
        </p>
      </div>
    </div>
  );
};

export default Home;
