
import React from 'react';
import { HeartIcon, Emoji } from '../constants';
import { APP_CONTENT } from '../content';

interface TutorialProps {
  onNext: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onNext }) => {
  const content = APP_CONTENT.tutorial;
  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 bg-white rounded-[40px] shadow-inner">
      <div className="max-w-xl w-full flex flex-col items-center">
        <div className="text-7xl mb-6">
          <Emoji char="🎱" />
        </div>
        <h2 className="cursive text-7xl text-pink-500 mb-8 flex items-center">
          <HeartIcon />
          {content.title}
        </h2>
        
        <div className="space-y-8 text-center text-pink-900/60 font-light text-lg mb-12">
          <p>{content.intro}</p>
          <p className="text-pink-500 font-medium italic">{content.quote}</p>
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold text-pink-500 uppercase tracking-widest text-sm">How to Play</span>
            <p>{content.instructions}</p>
          </div>
          <p className="italic text-sm text-pink-400">{content.note}</p>
        </div>

        <button 
          onClick={onNext}
          className="bg-pink-400 hover:bg-pink-500 text-white px-16 py-5 rounded-full font-bold text-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {content.buttonText}
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
