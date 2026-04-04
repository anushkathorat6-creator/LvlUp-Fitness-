import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, Heart, Sparkles } from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import toast from 'react-hot-toast';

type GameState = 'start' | 'countdown' | 'playing' | 'gameover';

const GameWorkout = () => {
  const navigate = useNavigate();
  const { addCoins, coins } = useFitnessStore();
  const [gameState, setGameState] = useState<GameState>('start');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [flyUps, setFlyUps] = useState<{ id: number; x: number }[]>([]);

  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
    setTimeLeft(60);
    setLives(3);
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown <= 0) { setGameState('playing'); return; }
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'playing') {
      if (timeLeft <= 0) { setGameState('gameover'); addCoins(score); toast.success(`🪙 +${score} coins earned!`); return; }
      const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [gameState, timeLeft]);

  const jump = useCallback(() => {
    if (gameState !== 'playing') return;
    setScore(s => s + 1);
    const id = Date.now();
    const x = Math.random() * 60 + 20;
    setFlyUps(f => [...f, { id, x }]);
    setTimeout(() => setFlyUps(f => f.filter(fl => fl.id !== id)), 800);
  }, [gameState]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [jump]);

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/workout')} className="w-10 h-10 rounded-full glass flex items-center justify-center btn-interactive">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
            <Coins className="w-4 h-4 text-gold" />
            <span className="font-bold text-sm">{score}</span>
          </div>
          {gameState === 'playing' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">{timeLeft}s</span>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-400 fill-red-400' : 'text-muted'}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-strong rounded-3xl overflow-hidden aspect-[3/4] relative flex flex-col items-center justify-center">
          <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-2xl" />

          {/* Fly ups */}
          <AnimatePresence>
            {flyUps.map(f => (
              <motion.div key={f.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -60 }} exit={{ opacity: 0 }} className="absolute text-gold font-bold text-lg pointer-events-none" style={{ left: `${f.x}%`, top: '40%' }}>+1</motion.div>
            ))}
          </AnimatePresence>

          {gameState === 'start' && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center z-10">
              <Sparkles className="w-16 h-16 text-gold mx-auto mb-4 float-animation" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Coin Jumper</h2>
              <p className="text-sm text-muted-foreground mb-6">Jump to collect coins!</p>
              <button onClick={startGame} className="px-8 py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive shadow-lg">Start Game</button>
            </motion.div>
          )}

          {gameState === 'countdown' && (
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-6xl font-bold text-gradient">
              {countdown > 0 ? countdown : 'GO!'}
            </motion.div>
          )}

          {gameState === 'playing' && (
            <>
              {/* Coin */}
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute top-1/4 z-10">
                <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-xl">
                  <Coins className="w-7 h-7 text-primary-foreground" />
                </div>
              </motion.div>
              {/* Stick figure */}
              <div className="absolute bottom-16 z-10 jumping-jack">
                <div className="w-8 h-8 rounded-full bg-primary/40 mx-auto mb-1" />
                <div className="w-2 h-10 bg-primary/40 mx-auto" />
                <div className="flex justify-center gap-4 -mt-1">
                  <div className="w-1 h-8 bg-primary/40 -rotate-12" />
                  <div className="w-1 h-8 bg-primary/40 rotate-12" />
                </div>
              </div>
              <p className="absolute bottom-6 text-xs text-muted-foreground">Press SPACE or tap JUMP</p>
            </>
          )}

          {gameState === 'gameover' && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center z-10">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Game Over!</h2>
              <p className="text-4xl font-bold text-gradient mb-2">{score}</p>
              <p className="text-sm text-muted-foreground mb-6">coins collected</p>
              <div className="flex gap-3">
                <button onClick={startGame} className="px-6 py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive">Play Again</button>
                <button onClick={() => navigate('/workout')} className="px-6 py-3 rounded-full glass font-semibold btn-interactive text-foreground">Back</button>
              </div>
            </motion.div>
          )}
        </div>

        {gameState === 'playing' && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={jump} className="w-full mt-4 py-4 rounded-full gradient-primary text-primary-foreground font-bold text-lg btn-interactive shadow-xl">
            JUMP! 🦘
          </motion.button>
        )}

        <div className="glass rounded-2xl p-4 mt-4 text-center">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold text-gradient">{score}</p>
        </div>
      </div>
    </div>
  );
};

export default GameWorkout;