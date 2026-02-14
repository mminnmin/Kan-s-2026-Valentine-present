
import React, { useState, useMemo } from 'react';
import { Page, Envelope, Ball } from './types';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Tutorial from './pages/Tutorial';
import Game from './pages/Game';
import Letters from './pages/Letters';
import Final from './pages/Final';
import { Emoji, BALL_RADIUS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  
  // Persistent Game State
  const [balls, setBalls] = useState<Ball[]>([]);
  const [gameStats, setGameStats] = useState({ pink: 0, red: 0, white: 0, strikes: 0 });
  
  // Stable random order for white letters
  const whiteOrder = useMemo(() => {
    const indices = Array.from({ length: 20 }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const addEnvelope = (env: Envelope) => {
    setEnvelopes(prev => [...prev, env]);
  };

  const markRead = (id: number) => {
    setEnvelopes(prev => prev.map(e => e.id === id ? { ...e, status: 'read' } : e));
  };

  const resetGame = () => {
    setEnvelopes([]);
    setBalls([]);
    setGameStats({ pink: 0, red: 0, white: 0, strikes: 0 });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNext={() => handlePageChange('gallery')} />;
      case 'gallery': return <Gallery onNext={() => handlePageChange('tutorial')} onBack={() => handlePageChange('home')} />;
      case 'tutorial': return <Tutorial onNext={() => handlePageChange('game')} />;
      case 'game': return <Game 
          onFinish={(newEnvelopes) => {
            setEnvelopes(newEnvelopes);
            handlePageChange('letters');
          }} 
          onAddEnvelope={addEnvelope}
          onRead={markRead}
          collected={envelopes}
          onSkip={() => handlePageChange('letters')}
          // Pass persistent state
          balls={balls}
          setBalls={setBalls}
          stats={gameStats}
          setStats={setGameStats}
          whiteOrder={whiteOrder}
        />;
      case 'letters': return <Letters 
          envelopes={envelopes} 
          onRead={markRead} 
          onNext={() => handlePageChange('final')} 
          onBack={() => handlePageChange('game')}
        />;
      case 'final': return <Final onRestart={() => {
          resetGame();
          handlePageChange('home');
        }} />;
      default: return <Home onNext={() => handlePageChange('gallery')} />;
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#FFC5D3]">
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-10">
        {renderPage()}
      </div>
      
      <div className="decoration top-[5%] left-[5%] text-2xl animate-pulse"><Emoji char="💗" /></div>
      <div className="decoration top-[8%] right-[10%] text-3xl animate-bounce duration-1000"><Emoji char="🌸" /></div>
      <div className="decoration bottom-[12%] left-[8%] text-4xl opacity-40"><Emoji char="🎀" /></div>
      <div className="decoration bottom-[8%] right-[12%] text-2xl opacity-50 rotate-12"><Emoji char="🧸" /></div>
    </div>
  );
};

export default App;
