
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ball, Envelope } from '../types';
import { TABLE_COLOR, BALL_RADIUS, POCKET_RADIUS, HeartIcon, Emoji } from '../constants';
import { APP_CONTENT } from '../content';

interface ScreenParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color?: string;
  char?: string;
  size: number;
  sway: number;
  rotation: number;
  rotationSpeed: number;
  isText?: boolean;
}

interface CelebratePopup {
  id: number;
  char: string;
}

interface GameProps {
  onFinish: (envelopes: Envelope[]) => void;
  onAddEnvelope: (env: Envelope) => void;
  onRead: (id: number) => void;
  collected: Envelope[];
  onSkip: () => void;
  // Props from App for persistence
  balls: Ball[];
  setBalls: React.Dispatch<React.SetStateAction<Ball[]>>;
  stats: { pink: number; red: number; white: number; strikes: number };
  setStats: React.Dispatch<React.SetStateAction<{ pink: number; red: number; white: number; strikes: number }>>;
  whiteOrder: number[];
}

const Game: React.FC<GameProps> = ({ 
  onFinish, 
  onAddEnvelope, 
  onRead, 
  collected, 
  onSkip,
  balls,
  setBalls,
  stats,
  setStats,
  whiteOrder
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);
  
  const [isAiming, setIsAiming] = useState(false);
  const [aimPoint, setAimPoint] = useState<{x: number, y: number} | null>(null);
  const [floatingText, setFloatingText] = useState<{msg: string, x: number, y: number} | null>(null);
  
  const [easterEggText, setEasterEggText] = useState<string | null>(null);
  const easterEggTimeoutRef = useRef<number | null>(null);

  const isTurnActive = useRef(false);
  const ballPocketedInTurn = useRef(false);
  const wasMoving = useRef(false);

  const [screenParticles, setScreenParticles] = useState<ScreenParticle[]>([]);
  const [popups, setPopups] = useState<CelebratePopup[]>([]);
  
  const [selectedLetter, setSelectedLetter] = useState<Envelope | null>(null);
  const [newEnvId, setNewEnvId] = useState<number | null>(null);

  const FRICTION = 0.982; 
  const SPEED_MULT = 2.4;
  const WIDTH = 800;
  const HEIGHT = 450;
  const POCKETS = [
    {x: 0, y: 0}, {x: WIDTH/2, y: 0}, {x: WIDTH, y: 0},
    {x: 0, y: HEIGHT}, {x: WIDTH/2, y: HEIGHT}, {x: WIDTH, y: HEIGHT}
  ];

  const PASTEL_COLORS = ['#FFD1DC', '#B2E2F2', '#FDFD96', '#C1E1C1', '#E0BBE4', '#FFB7C5', '#FFFFFF'];

  const gameContent = APP_CONTENT.game;
  const mediaContent = APP_CONTENT.media;

  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) => {
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  };

  const showEasterEgg = (msg: string, duration: number = 15000) => {
    if (easterEggTimeoutRef.current) window.clearTimeout(easterEggTimeoutRef.current);
    setEasterEggText(msg);
    easterEggTimeoutRef.current = window.setTimeout(() => setEasterEggText(null), duration); 
  };

  // Initialize balls if they don't exist yet
  useEffect(() => {
    if (balls.length === 0) {
      const newBalls: Ball[] = [];
      newBalls.push({ id: 0, x: WIDTH * 0.15, y: HEIGHT / 2, vx: 0, vy: 0, radius: BALL_RADIUS, type: 'cue', isPocketed: false });
      
      const centerX = WIDTH * 0.58;
      const centerY = HEIGHT / 2;
      const spacing = BALL_RADIUS * 2.3;
      
      const heartCoords = [
        { c: 0, r: 0 },
        { c: 1, r: -0.7 }, { c: 1, r: 0.7 },
        { c: 2, r: -1.4 }, { c: 2, r: 0 }, { c: 2, r: 1.4 },
        { c: 3, r: -2.1 }, { c: 3, r: -0.7 }, { c: 3, r: 0.7 }, { c: 3, r: 2.1 },
        { c: 4, r: -1.4 }, { c: 4, r: 1.4 }
      ];

      heartCoords.forEach((coord, i) => {
        newBalls.push({ 
          id: i + 1, 
          x: centerX + coord.c * spacing, 
          y: centerY + coord.r * spacing, 
          vx: 0, vy: 0, 
          radius: BALL_RADIUS, 
          type: i % 2 === 0 ? 'striped' : 'red', 
          isPocketed: false 
        });
      });
      setBalls(newBalls);
    }
  }, [balls.length, setBalls, WIDTH, HEIGHT]);

  const physicsTick = useCallback((currentBalls: Ball[]) => {
    let moving = false;
    const nextBalls = currentBalls.map(b => ({ ...b }));
    const pocketedThisTick: Ball[] = [];
    nextBalls.forEach(b => {
      if (b.isPocketed) return;
      b.x += b.vx * SPEED_MULT; b.y += b.vy * SPEED_MULT;
      b.vx *= FRICTION; b.vy *= FRICTION;
      if (Math.abs(b.vx) < 0.08) b.vx = 0; if (Math.abs(b.vy) < 0.08) b.vy = 0;
      if (b.vx !== 0 || b.vy !== 0) moving = true;
      if (b.x < b.radius) { b.x = b.radius; b.vx *= -0.7; }
      if (b.x > WIDTH - b.radius) { b.x = WIDTH - b.radius; b.vx *= -0.7; }
      if (b.y < b.radius) { b.y = b.radius; b.vy *= -0.7; }
      if (b.y > HEIGHT - b.radius) { b.y = HEIGHT - b.radius; b.vy *= -0.7; }
      POCKETS.forEach(p => { 
        if (!b.isPocketed && Math.hypot(b.x - p.x, b.y - p.y) < POCKET_RADIUS) { 
          b.isPocketed = true; b.vx = 0; b.vy = 0; pocketedThisTick.push({...b});
        } 
      });
    });
    for (let i = 0; i < nextBalls.length; i++) {
      for (let j = i + 1; j < nextBalls.length; j++) {
        const b1 = nextBalls[i]; const b2 = nextBalls[j];
        if (b1.isPocketed || b2.isPocketed) continue;
        const dx = b2.x - b1.x; const dy = b2.y - b1.y; const dist = Math.hypot(dx, dy);
        if (dist < b1.radius + b2.radius) {
          const angle = Math.atan2(dy, dx);
          const vx1 = b1.vx * Math.cos(angle) + b1.vy * Math.sin(angle);
          const vy1 = b1.vy * Math.cos(angle) - b1.vx * Math.sin(angle);
          const vx2 = b2.vx * Math.cos(angle) + b2.vy * Math.sin(angle);
          const vy2 = b2.vy * Math.cos(angle) - b2.vx * Math.sin(angle);
          const elasticity = 0.95; 
          
          b1.vx = (vx2 * elasticity) * Math.cos(angle) - vy1 * Math.sin(angle);
          b1.vy = vy1 * Math.cos(angle) + (vx2 * elasticity) * Math.sin(angle);
          b2.vx = (vx1 * elasticity) * Math.cos(angle) - vy2 * Math.sin(angle);
          b2.vy = vy2 * Math.cos(angle) + (vx1 * elasticity) * Math.sin(angle);
          const overlap = b1.radius + b2.radius - dist;
          b1.x -= overlap * Math.cos(angle) * 0.5; b1.y -= overlap * Math.sin(angle) * 0.5;
          b2.x += overlap * Math.cos(angle) * 0.5; b2.y += overlap * Math.sin(angle) * 0.5;
          moving = true;
        }
      }
    }
    return { nextBalls, moving, pocketedThisTick };
  }, [WIDTH, HEIGHT, POCKETS]);

  const triggerCelebration = (type: 'striped' | 'red' | 'cue' | 'black') => {
    const count = type === 'striped' ? 100 : type === 'red' ? 65 : type === 'black' ? 150 : 55;
    const newParticles: ScreenParticle[] = Array.from({ length: count }, (_, i) => ({
      id: Math.random() + Date.now() + i,
      x: Math.random() * 100, y: -15 - Math.random() * 20,
      vx: (Math.random() - 0.5) * (type === 'red' ? 0.1 : 0.4),
      vy: Math.random() * 1.5 + (type === 'red' ? 0.8 : 1.2),
      color: type === 'striped' ? PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)] : (type === 'red' ? '#fa003f' : type === 'black' ? '#222' : undefined),
      char: type === 'cue' ? '😂' : (type === 'red' ? 'Thx bby' : type === 'black' ? '👑' : undefined),
      isText: type === 'red',
      size: type === 'striped' ? Math.random() * 10 + 6 : (type === 'cue' ? Math.random() * 12 + 12 : Math.random() * 4 + 14),
      sway: Math.random() * (type === 'red' ? 0.02 : 0.08),
      rotation: type === 'red' ? 0 : Math.random() * 360,
      rotationSpeed: type === 'red' ? 0 : (Math.random() - 0.5) * 15
    }));
    setScreenParticles(prev => [...prev, ...newParticles]);
    if (type !== 'cue') {
      const popupId = Date.now() + Math.random();
      const popupChar = type === 'striped' ? '💗' : type === 'black' ? '👑' : '🐰';
      setPopups(prev => [...prev, { id: popupId, char: popupChar }]);
      setTimeout(() => setPopups(prev => prev.filter(p => p.id !== popupId)), 1500);
    }
  };

  const handlePocketed = (ball: Ball) => {
    ballPocketedInTurn.current = true;
    if (ball.type === 'cue') {
      const currentWhiteCount = stats.white;
      const nextWhiteCount = currentWhiteCount + 1;

      // Easter Egg Logic for Scratches
      if (stats.strikes === 1) {
        showEasterEgg(gameContent.easterEggs.firstStrikeScratch);
      } else if (nextWhiteCount === 3) {
        showEasterEgg(gameContent.easterEggs.threeScratches);
      } else if (nextWhiteCount === 6) {
        showEasterEgg(gameContent.easterEggs.sixScratches);
      } else if (nextWhiteCount === 10) {
        showEasterEgg(gameContent.easterEggs.tenScratches);
      } else if (nextWhiteCount === 15) {
        showEasterEgg(gameContent.easterEggs.fifteenScratches);
      } else if (nextWhiteCount === 20) {
        showEasterEgg(gameContent.easterEggs.twentyScratches);
      }

      setStats(s => ({ ...s, white: s.white + 1 }));

      if (currentWhiteCount < 20) {
        setFloatingText({ msg: "Scratch! 💌", x: ball.x, y: ball.y });
        triggerCelebration('cue');
        const whiteIdx = whiteOrder[currentWhiteCount];
        const template = gameContent.envelopesData.white[whiteIdx];
        const env: Envelope = { id: Date.now(), type: 'white', status: 'unread', title: template.title, message: template.message, image: template.image };
        onAddEnvelope(env); 
        setNewEnvId(env.id);
      } else {
        setFloatingText({ msg: "No more scratch letters! 🤣", x: ball.x, y: ball.y });
      }

      setTimeout(() => {
        setBalls(prev => prev.map(b => b.type === 'cue' ? { ...b, x: WIDTH * 0.15, y: HEIGHT / 2, isPocketed: false, vx: 0, vy: 0 } : b));
        setFloatingText(null);
      }, 1200);
    } else {
      const type = ball.type; 
      const isRed = type === 'red'; 
      const isPink = type === 'striped';
      const currentCount = isPink ? stats.pink : stats.red;
      
      setStats(s => ({ ...s, pink: isPink ? s.pink + 1 : s.pink, red: isRed ? s.red + 1 : s.red }));
      
      if (currentCount < 5) {
        triggerCelebration(type as 'striped' | 'red');
        const template = isPink ? gameContent.envelopesData.pink[currentCount] : gameContent.envelopesData.red[currentCount];
        const envId = Date.now();
        const env: Envelope = { id: envId, type: isPink ? 'striped' : 'red', status: 'unread', title: template.title, message: template.message, image: template.image };
        onAddEnvelope(env); 
        setNewEnvId(envId);
        setTimeout(() => { setNewEnvId(null); if (inventoryRef.current) inventoryRef.current.scrollTop = 0; }, 500);
      } else if (isRed && currentCount === 5) {
        triggerCelebration('black');
        const blackTemplate = gameContent.envelopesData.black;
        const envId = Date.now();
        const env: Envelope = { id: envId, type: 'black', status: 'unread', title: blackTemplate.title, message: blackTemplate.message, image: blackTemplate.image };
        onAddEnvelope(env); 
        setNewEnvId(envId);
        showEasterEgg("You won my heart! 💖✨");
        setTimeout(() => { setNewEnvId(null); if (inventoryRef.current) inventoryRef.current.scrollTop = 0; }, 500);
      } else {
        triggerCelebration(type as 'striped' | 'red');
        setFloatingText({ msg: isPink ? "Empty! 🌸" : "Empty! ❤️", x: ball.x, y: ball.y });
        setTimeout(() => setFloatingText(null), 1200);
      }
    }
  };

  const updatePhysics = useCallback(() => {
    setScreenParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx + Math.sin(Date.now() * 0.01) * p.sway * 10, y: p.y + p.vy, rotation: p.rotation + p.rotationSpeed })).filter(p => p.y < 130));
    setBalls(prevBalls => {
      const { nextBalls, moving, pocketedThisTick } = physicsTick(prevBalls);
      if (isTurnActive.current && !moving && wasMoving.current) {
        if (!ballPocketedInTurn.current) showEasterEgg(gameContent.cheerMessages[Math.floor(Math.random() * gameContent.cheerMessages.length)], 12000);
        isTurnActive.current = false;
      }
      wasMoving.current = moving;
      pocketedThisTick.forEach(b => handlePocketed(b));
      return nextBalls;
    });
  }, [physicsTick, gameContent.cheerMessages, setBalls]);

  useEffect(() => {
    let frame = requestAnimationFrame(function loop() { updatePhysics(); frame = requestAnimationFrame(loop); });
    return () => cancelAnimationFrame(frame);
  }, [updatePhysics]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = TABLE_COLOR; ctx.beginPath(); drawRoundRect(ctx, 0, 0, WIDTH, HEIGHT, 40); ctx.fill();
    ctx.fillStyle = '#222'; POCKETS.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2); ctx.fill(); });
    const cueBall = balls.find(b => b.type === 'cue');
    if (isAiming && cueBall && aimPoint) {
      const dx = cueBall.x - aimPoint.x; const dy = cueBall.y - aimPoint.y;
      const angle = Math.atan2(dy, dx); const pullDist = Math.hypot(dx, dy);
      const dirX = Math.cos(angle); const dirY = Math.sin(angle);
      let closestT = Infinity; let targetBall: Ball | null = null; const r = 2 * BALL_RADIUS;
      balls.forEach(b => {
        if (b.type === 'cue' || b.isPocketed) return;
        const L = { x: cueBall.x - b.x, y: cueBall.y - b.y };
        const bCoeff = 2 * (dirX * L.x + dirY * L.y);
        const cCoeff = (L.x * L.x + L.y * L.y) - r * r;
        const disc = bCoeff * bCoeff - 4 * cCoeff;
        if (disc >= 0) {
          const t = (-bCoeff - Math.sqrt(disc)) / 2;
          if (t > 0 && t < closestT) { closestT = t; targetBall = b; }
        }
      });
      ctx.beginPath(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.moveTo(cueBall.x, cueBall.y);
      if (targetBall && closestT !== Infinity) {
        const ghostX = cueBall.x + dirX * closestT; const ghostY = cueBall.y + dirY * closestT;
        ctx.lineTo(ghostX, ghostY); ctx.stroke();
        ctx.beginPath(); ctx.setLineDash([]); ctx.arc(targetBall.x, targetBall.y, BALL_RADIUS + 2, 0, Math.PI * 2); ctx.strokeStyle = 'white'; ctx.stroke();
        const tAngle = Math.atan2(targetBall.y - ghostY, targetBall.x - ghostX);
        ctx.beginPath(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.moveTo(targetBall.x, targetBall.y); ctx.lineTo(targetBall.x + Math.cos(tAngle) * 200, targetBall.y + Math.sin(tAngle) * 200); ctx.stroke();
      } else { ctx.lineTo(cueBall.x + dirX * 1000, cueBall.y + dirY * 1000); ctx.stroke(); }
      ctx.save(); ctx.translate(cueBall.x, cueBall.y); ctx.rotate(angle + Math.PI); 
      const cueLength = 300; const cueOffset = 10 + Math.min(pullDist / 2, 80); 
      ctx.fillStyle = '#FFF5EE'; ctx.beginPath(); drawRoundRect(ctx, cueOffset, -6, cueLength, 12, [2, 10, 10, 2]); ctx.fill();
      ctx.fillStyle = '#FFB7C5'; ctx.fillRect(cueOffset, -6, 15, 12); ctx.restore(); ctx.setLineDash([]);
    }
    balls.forEach(b => {
      if (b.isPocketed) return;
      ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      if (b.type === 'cue') ctx.fillStyle = 'white';
      else if (b.type === 'red') ctx.fillStyle = '#fa003f';
      else { ctx.fillStyle = '#ffb7c5'; ctx.fill(); ctx.beginPath(); ctx.arc(b.x, b.y, b.radius * 0.4, 0, Math.PI * 2); ctx.fillStyle = 'white'; }
      ctx.fill(); ctx.restore();
    });
  }, [balls, isAiming, aimPoint]);

  useEffect(() => { draw(); }, [draw]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const cue = balls.find(b => b.type === 'cue');
    if (cue && !cue.isPocketed && cue.vx === 0 && cue.vy === 0) {
      setIsAiming(true); setAimPoint({x, y});
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isAiming) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) setAimPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handlePointerUp = () => {
    if (isAiming && aimPoint) {
      const cue = balls.find(b => b.type === 'cue');
      if (cue) {
        const dx = cue.x - aimPoint.x; const dy = cue.y - aimPoint.y;
        const power = Math.min(Math.hypot(dx, dy) / 7.5, 25); const angle = Math.atan2(dy, dx);
        isTurnActive.current = true; ballPocketedInTurn.current = false;
        setBalls(prev => prev.map(b => b.type === 'cue' ? { ...b, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power } : b));
        setStats(s => ({ ...s, strikes: s.strikes + 1 }));
      }
    }
    setIsAiming(false); setAimPoint(null);
  };

  useEffect(() => { if (balls.length > 0 && balls.filter(b => b.type === 'striped' && !b.isPocketed).length === 0) setTimeout(() => onFinish(collected), 2500); }, [balls, collected, onFinish]);

  const stopAllBalls = () => {
    let current = [...balls].map(b => ({ ...b })); let stillMoving = true; let limit = 1500;
    while (stillMoving && limit > 0) {
      const result = physicsTick(current); current = result.nextBalls; stillMoving = result.moving;
      result.pocketedThisTick.forEach(b => handlePocketed(b));
      limit--;
    }
    setBalls(current);
    if (isTurnActive.current) {
        if (!ballPocketedInTurn.current) showEasterEgg(gameContent.cheerMessages[Math.floor(Math.random() * gameContent.cheerMessages.length)], 12000);
        isTurnActive.current = false;
    }
  };

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

  const openLetter = (env: Envelope) => {
    setSelectedLetter(env);
    onRead(env.id);
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full max-w-7xl max-h-[90vh] flex flex-row items-center gap-6 p-6 relative bg-white/40 backdrop-blur-md rounded-[48px] shadow-xl border border-white/60 overflow-visible"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <style>{`
        @keyframes heart-pop { 0% { transform: scale(0); opacity: 0; } 40% { transform: scale(1.4); opacity: 1; } 60% { transform: scale(1.1); opacity: 1; } 80% { transform: scale(1.2); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
        .animate-heart-pop { animation: heart-pop 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slide-in-bottom-left { 0% { transform: translateX(-20px) translateY(20px); opacity: 0; } 100% { transform: translateX(0) translateY(0); opacity: 1; } }
        .animate-easter-egg { animation: slide-in-bottom-left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
      {screenParticles.map(p => (
        <div key={p.id} className="fixed pointer-events-none z-[5000] flex items-center justify-center whitespace-nowrap" style={{ 
          left: `${p.x}%`, 
          top: `${p.y}%`, 
          width: p.isText ? 'auto' : `${p.size}px`, 
          height: p.isText ? 'auto' : `${p.size}px`, 
          backgroundColor: (p.color && !p.isText && !p.char) ? p.color : 'transparent', 
          color: p.isText ? p.color : 'inherit', 
          transform: `rotate(${p.rotation}deg)`, 
          opacity: 0.85, 
          fontSize: (p.char || p.isText) ? `${p.size}px` : 'inherit', 
          fontWeight: p.isText ? '700' : 'normal' 
        }}>
          {p.isText ? p.char : (p.char ? <Emoji char={p.char} /> : null)}
        </div>
      ))}
      {popups.map(h => (
        <div key={h.id} className="fixed inset-0 pointer-events-none z-[5001] flex items-center justify-center">
          <div className="text-[200px] md:text-[280px] filter drop-shadow-2xl animate-heart-pop"><Emoji char={h.char} /></div>
        </div>
      ))}
      <div className="w-56 flex flex-col gap-4 h-full relative z-[1002]">
        <div className="flex items-center gap-3 bg-white/60 p-3 rounded-3xl border border-white/50 shadow-sm">
          <img src={mediaContent.profilePic} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Kantimir" />
          <div className="overflow-hidden">
            <h3 className="font-bold text-pink-700 text-xs truncate">Kantimir</h3>
            <p className="text-[9px] text-pink-500/80 italic flex items-center gap-1">Min's Moi Parin</p>
          </div>
        </div>
        <div className="flex-grow flex flex-col bg-white/30 rounded-[32px] p-4 border border-white/40 backdrop-blur-sm overflow-hidden shadow-inner">
          <h3 className="text-center font-bold text-pink-600 text-xs uppercase tracking-widest mb-3 shrink-0">Inventory</h3>
          <div ref={inventoryRef} className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 scroll-smooth">
            {collected.slice().reverse().map((env) => (
              <button key={env.id} onClick={() => openLetter(env)} className={`w-full aspect-[4/3] rounded-2xl flex items-center justify-center text-xl transition-all hover:scale-105 shadow-sm border-2 ${getEnvBg(env.type, env.status)}`}>
                <Emoji char={env.status === 'read' ? '📖' : '💌'} className={`text-5xl ${env.type === 'black' ? 'brightness-200' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center gap-4 relative z-[1001] h-full">
        <div className="flex items-center gap-4 bg-white/60 p-3 px-6 rounded-2xl backdrop-blur-md shadow-sm border border-white/50 w-full justify-between">
           <div className="flex gap-8 flex-grow justify-around">
             {[
               {key: 'pink', label: 'Pink'}, 
               {key: 'red', label: 'Red'}, 
               {key: 'white', label: 'White'}, 
               {key: 'strikes', label: 'Shots'}
             ].map(item => (
               <div key={item.key} className="text-center px-4">
                 <div className="text-[9px] uppercase text-pink-400 font-bold opacity-70">{item.label}</div>
                 <div className="text-xl font-bold text-pink-600">{(stats as any)[item.key]}</div>
               </div>
             ))}
           </div>
        </div>
        <div className="relative pointer-events-none flex-grow flex flex-col items-center justify-center">
          {floatingText && <div className="absolute z-50 pointer-events-none text-3xl font-bold text-white animate-heart flex items-center justify-center gap-2" style={{ left: floatingText.x, top: floatingText.y }}>{floatingText.msg}</div>}
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-[40px] shadow-2xl border-[14px] border-white/90 touch-none max-w-full max-h-[60vh] pointer-events-auto" />
          {easterEggText && <div className="absolute bottom-0 left-0 p-4 max-w-xs animate-easter-egg pointer-events-none z-[2001]"><div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-pink-100"><p className="text-xs font-medium text-pink-600 italic leading-relaxed"><Emoji char="💗" className="mr-1" /> {easterEggText}</p></div></div>}
        </div>
        <div className="w-full flex justify-end px-2 gap-4">
          <button onClick={onSkip} className="bg-transparent hover:bg-white/20 text-white/60 px-6 py-3 rounded-2xl font-bold transition-all text-xs active:scale-95 border-2 border-white/20">Skip Game</button>
          <button onClick={stopAllBalls} className="bg-white hover:bg-white/90 text-pink-400 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all text-sm flex items-center gap-2 active:scale-95 border-2 border-white/50">Finish Turn <Emoji char="⏯️" /></button>
        </div>
      </div>
      {selectedLetter && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[2000] flex items-center justify-center p-8" onClick={() => setSelectedLetter(null)}>
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-300 border border-white/50 flex flex-col" onClick={e => e.stopPropagation()}>
            <img src={selectedLetter.image} className="w-full h-44 object-cover rounded-3xl mb-4 shadow-sm" alt="Memory" />
            <h2 className="cursive text-4xl text-pink-500 mb-2">{selectedLetter.title}</h2>
            <p className="text-gray-500 text-sm italic mb-8 leading-relaxed">"{selectedLetter.message}"</p>
            <button onClick={() => setSelectedLetter(null)} className="w-full bg-pink-300 text-white py-4 rounded-2xl font-bold text-xl hover:bg-pink-400 transition-all shadow-md flex items-center justify-center gap-2">Done Reading <Emoji char="💗" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
