import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Coins, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const GamifiedExercise = () => {
  const { addCoins } = useApp();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [coinVisible, setCoinVisible] = useState(true);

  const collectCoin = () => {
    setScore(s => s + 1);
    addCoins(1);
    setCoinVisible(false);
    setTimeout(() => setCoinVisible(true), 600);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary px-6 pt-12 pb-6 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/workout')} className="text-primary-foreground/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Coin Jumper</h1>
            <p className="text-primary-foreground/70 text-sm">Jump to collect coins!</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-primary-foreground/20 rounded-full px-3 py-1.5">
            <Coins className="w-4 h-4 text-primary-foreground" />
            <span className="font-bold text-primary-foreground">{score}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Game area */}
        <div className="glass-strong rounded-2xl overflow-hidden aspect-[3/4] relative flex flex-col items-center justify-center">
          {/* Camera frame */}
          <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground/30" />
          </div>

          {/* Floating coin */}
          {coinVisible && (
            <button
              onClick={collectCoin}
              className="absolute top-1/4 z-10 coin-bounce cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center shadow-xl">
                <Coins className="w-8 h-8 text-primary-foreground" />
              </div>
            </button>
          )}

          {/* Character placeholder */}
          <div className="absolute bottom-12 w-16 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          {/* Instruction */}
          <div className="absolute bottom-4 glass rounded-xl px-4 py-2 z-10">
            <p className="text-sm font-semibold text-foreground">Tap the coin to collect!</p>
          </div>
        </div>

        {/* Score card */}
        <div className="glass rounded-2xl p-5 mt-4 text-center">
          <p className="text-sm text-muted-foreground">Your Score</p>
          <p className="text-4xl font-bold text-gradient">{score}</p>
          <p className="text-xs text-muted-foreground mt-1">coins collected this session</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GamifiedExercise;
