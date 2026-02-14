
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HeartIcon, Emoji } from '../constants';
import { APP_CONTENT } from '../content';

interface DraggablePhotoProps {
  url: string;
  initialX: number;
  initialY: number;
  zIndex: number;
  onSelect: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DraggablePhoto: React.FC<DraggablePhotoProps> = ({ url, initialX, initialY, zIndex, onSelect, containerRef }) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const [rotation] = useState(Math.random() * 12 - 6);
  const photoRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    onSelect();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current || !photoRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const photoRect = photoRef.current.getBoundingClientRect();

    setPos(prev => {
      let nextX = prev.x + e.movementX;
      let nextY = prev.y + e.movementY;

      if (nextX < 0) nextX = 0;
      if (nextX + photoRect.width > containerRect.width) nextX = containerRect.width - photoRect.width;
      if (nextY < 0) nextY = 0;
      if (nextY + photoRect.height > containerRect.height) nextY = containerRect.height - photoRect.height;

      return { x: nextX, y: nextY };
    });
  };

  const handlePointerUp = () => setDragging(false);

  return (
    <div
      ref={photoRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${dragging ? 0 : rotation}deg)`,
        zIndex: dragging ? 9999 : zIndex,
        touchAction: 'none'
      }}
      className={`absolute cursor-grab active:cursor-grabbing p-4 bg-pink-900/10 backdrop-blur-md rounded-[32px] shadow-lg border border-pink-800/10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group
        ${dragging ? 'scale-115 shadow-2xl brightness-105 z-[9999]' : 'hover:scale-115 hover:rotate-0 hover:shadow-[0_25px_50px_-12px_rgba(255,182,193,0.5)] hover:bg-pink-900/20 hover:z-[9998] hover:border-pink-800/30'}`}
    >
      <div className="bg-white p-2 rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
        <div className="relative overflow-hidden rounded-xl bg-pink-50/30 w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56">
          <img 
            src={url} 
            alt="Memory" 
            className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
        </div>
      </div>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-pink-200/60 backdrop-blur-[2px] -rotate-3 rounded-sm border border-white/40 pointer-events-none shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-translate-y-1">
        <div className="w-12 h-[1px] bg-pink-300/30" />
      </div>
      <div className="absolute -right-2 -bottom-2 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-125 group-hover:rotate-12 pointer-events-none">
        <Emoji char="🧸" />
      </div>
    </div>
  );
};

interface GalleryProps {
  onNext: () => void;
  onBack: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onNext, onBack }) => {
  const subpages = APP_CONTENT.gallery.subpages;
  const [subPageIndex, setSubPageIndex] = useState(0);
  const [photoZIndexes, setPhotoZIndexes] = useState<{ [key: string]: number }>({});
  const [maxZ, setMaxZ] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPage = subpages[subPageIndex];

  const photoPositions = useMemo(() => {
    return currentPage.photos.map(() => ({
      x: Math.random() * (window.innerWidth < 768 ? 100 : 500) + 20,
      y: Math.random() * (window.innerWidth < 768 ? 50 : 200) + 20,
    }));
  }, [subPageIndex, currentPage.photos]);

  const handlePhotoSelect = (photoId: number) => {
    const key = `${subPageIndex}-${photoId}`;
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setPhotoZIndexes(prev => ({ ...prev, [key]: nextZ }));
  };

  const nextSubPage = () => {
    if (subPageIndex < subpages.length - 1) {
      setSubPageIndex(subPageIndex + 1);
    } else {
      onNext();
    }
  };

  const prevSubPage = () => {
    if (subPageIndex > 0) {
      setSubPageIndex(subPageIndex - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="h-full w-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center py-6 px-10 relative bg-white/40 backdrop-blur-md rounded-[48px] shadow-xl border border-white/60">
      <div className="w-full flex flex-col flex-grow relative overflow-hidden">
        <div className="absolute top-4 right-4 text-4xl opacity-80 pointer-events-none flex items-center animate-pulse gap-4">
          <Emoji char="🐰" />
          <Emoji char="💗" />
        </div>
        <div className="absolute bottom-20 left-4 text-4xl opacity-80 pointer-events-none rotate-12 animate-pulse flex gap-4">
          <Emoji char="🎀" />
        </div>

        {subPageIndex === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
             <h2 className="cursive text-6xl md:text-[8rem] lg:text-[10rem] text-pink-400 text-center leading-tight py-8">
               {APP_CONTENT.gallery.firstPageTitle}
             </h2>
             <div className="mt-4 text-6xl opacity-10 animate-pulse flex gap-2">
               <Emoji char="🐰" /><Emoji char="❣️" /><Emoji char="🦊" />
             </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2 z-10">
              <h2 className="cursive text-4xl md:text-6xl text-pink-400 flex items-center py-2">
                <HeartIcon className="w-8 h-8 md:w-12 md:h-12 mr-3" />
                {currentPage.title}
              </h2>
            </div>
            
            <p className="text-lg text-pink-900/60 font-light leading-relaxed mb-6 w-full max-w-none italic z-10">
              "{currentPage.text}"
            </p>

            <div ref={containerRef} className="relative flex-grow bg-pink-100/10 rounded-[32px] border-2 border-dashed border-pink-200/30 overflow-hidden shadow-inner">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[14rem] opacity-[0.02] pointer-events-none select-none cursive text-pink-400">Memory</div>
              {currentPage.photos.map((photoUrl, i) => {
                const key = `${subPageIndex}-${i}`;
                return (
                  <DraggablePhoto 
                    key={key} 
                    url={photoUrl} 
                    initialX={photoPositions[i].x} 
                    initialY={photoPositions[i].y}
                    zIndex={photoZIndexes[key] || i + 1}
                    onSelect={() => handlePhotoSelect(i)}
                    containerRef={containerRef}
                  />
                );
              })}
            </div>
          </>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/20 z-[10000]">
          <button 
            onClick={prevSubPage}
            className="px-8 py-3 rounded-full border border-pink-100 text-pink-400 font-bold hover:bg-pink-50 transition-all flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
          </button>
          
          <div className="flex gap-3">
            {subpages.map((_, i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-700 ${i === subPageIndex ? 'bg-pink-300 w-12 shadow-sm' : 'bg-pink-100 w-2.5'}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSubPage}
            className="bg-pink-300 hover:bg-pink-400 text-white px-10 py-3 rounded-full font-bold shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
          >
            {subPageIndex === subpages.length - 1 ? 'Tutorial 💗' : 'Next 💗'}
            {subPageIndex !== subpages.length - 1 && <span className="group-hover:translate-x-1 transition-transform">→</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
