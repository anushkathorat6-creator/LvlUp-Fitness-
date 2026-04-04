import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Square, Plus, Minus, ChevronLeft, ChevronRight, Coins, Trophy, Gamepad2 } from 'lucide-react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useFitnessStore } from '@/stores/fitnessStore';
import AppLayout from '@/components/AppLayout';
import toast from 'react-hot-toast';

const exercises = [
  { name: 'Warm Up Jog', emoji: '🏃', type: 'duration', duration: '5 min', sets: 1, reps: 1 },
  { name: 'Jumping Jacks', emoji: '⭐', type: 'reps', duration: '', sets: 3, reps: 20 },
  { name: 'Push Ups', emoji: '💪', type: 'reps', duration: '', sets: 3, reps: 10 },
  { name: 'Squats', emoji: '🦵', type: 'reps', duration: '', sets: 3, reps: 15 },
  { name: 'Cool Down Stretch', emoji: '🧘', type: 'duration', duration: '5 min', sets: 1, reps: 1 },
];

const Workout = () => {
  const navigate = useNavigate();
  const ws = useWorkoutStore();
  const { addCoins, addCalories, coins } = useFitnessStore();
  const [showComplete, setShowComplete] = useState(false);
  const ex = exercises[ws.currentExerciseIndex];
  const mins = Math.floor(ws.timerSeconds / 60).toString().padStart(2, '0');
  const secs = (ws.timerSeconds % 60).toString().padStart(2, '0');

  const handleFinish = () => {
    ws.stopTimer();
    const cal = Math.round(ws.totalReps * 0.5);
    addCalories(cal);
    addCoins(10);
    setShowComplete(true);
  };

  const handleClaim = () => {
    toast.success('🏆 Workout complete! +10 coins earned!');
    ws.reset();
    setShowComplete(false);
    navigate('/dashboard');
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { ws.reset(); navigate('/dashboard'); }} className="w-10 h-10 rounded-full glass flex items-center justify-center btn-interactive">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">Day 1 Workout</h1>
          <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
            <Coins className="w-4 h-4 text-gold" />
            <span className="font-bold text-sm text-foreground">{coins}</span>
          </div>
        </div>

        <button onClick={() => navigate('/game-workout')} className="w-full glass rounded-2xl p-3 mb-4 flex items-center justify-center gap-2 btn-interactive text-sm font-semibold text-primary">
          <Gamepad2 className="w-4 h-4" /> Switch to Game Mode
        </button>

        <motion.div key={ws.currentExerciseIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="glass-strong rounded-3xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={ws.prevExercise} disabled={ws.currentExerciseIndex === 0} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs text-muted-foreground">{ws.currentExerciseIndex + 1} / {exercises.length}</span>
            <button onClick={ws.nextExercise} disabled={ws.currentExerciseIndex === exercises.length - 1} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="text-center mb-4">
            <div className="text-6xl mb-3">{ex.emoji}</div>
            <h2 className="font-display text-xl font-bold text-foreground">{ex.name}</h2>
            <p className="text-sm text-muted-foreground">{ex.type === 'duration' ? ex.duration : `${ex.sets} sets × ${ex.reps} reps`}</p>
          </div>
          {ex.type === 'reps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between glass rounded-xl p-3">
                <span className="text-sm text-muted-foreground">Set {Math.min(ws.currentSet + 1, ex.sets)} / {ex.sets}</span>
                <div className="h-1.5 flex-1 mx-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${(ws.currentSet / ex.sets) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={ws.removeRep} className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Minus className="w-5 h-5" /></motion.button>
                <motion.span key={ws.currentReps} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-4xl font-bold text-foreground w-16 text-center">{ws.currentReps}</motion.span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={ws.addRep} className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground"><Plus className="w-5 h-5" /></motion.button>
              </div>
              <button onClick={ws.completeSet} className="w-full py-2.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm btn-interactive">Complete Set</button>
            </div>
          )}
        </motion.div>

        <div className="glass-strong rounded-3xl p-6 mb-4 text-center">
          <p className={`text-5xl font-mono font-bold text-foreground mb-4 ${ws.isRunning && !ws.isPaused ? 'animate-pulse' : ''}`}>{mins}:{secs}</p>
          <div className="flex gap-3 justify-center">
            {!ws.isRunning ? (
              <button onClick={ws.startTimer} className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold btn-interactive flex items-center gap-2"><Play className="w-4 h-4" /> Start</button>
            ) : ws.isPaused ? (
              <button onClick={ws.resumeTimer} className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold btn-interactive flex items-center gap-2"><Play className="w-4 h-4" /> Resume</button>
            ) : (
              <button onClick={ws.pauseTimer} className="px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold btn-interactive flex items-center gap-2"><Pause className="w-4 h-4" /> Pause</button>
            )}
            <button onClick={handleFinish} className="px-6 py-3 rounded-full bg-destructive text-destructive-foreground font-semibold btn-interactive flex items-center gap-2"><Square className="w-4 h-4" /> Finish</button>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Reps</p>
          <p className="text-3xl font-bold text-gradient">{ws.totalReps}</p>
        </div>
      </div>

      <AnimatePresence>
        {showComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-strong rounded-3xl p-8 w-full max-w-sm text-center">
              <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Workout Complete! 🎉</h2>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">Time: <span className="font-bold text-foreground">{mins}:{secs}</span></p>
                <p className="text-sm text-muted-foreground">Total Reps: <span className="font-bold text-foreground">{ws.totalReps}</span></p>
                <p className="text-sm text-muted-foreground">Calories: <span className="font-bold text-foreground">~{Math.round(ws.totalReps * 0.5)}</span></p>
                <p className="text-sm text-muted-foreground">Coins Earned: <span className="font-bold text-gold">+10</span></p>
              </div>
              <button onClick={handleClaim} className="w-full py-3 rounded-full gradient-gold text-primary-foreground font-semibold btn-interactive shadow-lg">🪙 Claim Reward</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Workout;