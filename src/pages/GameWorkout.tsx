import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Coins, Heart, Sparkles, Camera, CameraOff, 
  Trophy, Loader2, Target, Zap, Activity, Info 
} from 'lucide-react';
import { useFitnessStore } from '@/stores/fitnessStore';
import { initPoseDetector, getPose } from '@/lib/poseDetection';
import toast from 'react-hot-toast';

type GameState = 'start' | 'selecting_exercise' | 'calibrating' | 'countdown' | 'playing' | 'gameover';
type ExerciseType = 'jumping' | 'squats' | 'hand_raise';

const EXERCISES: { id: ExerciseType; name: string; icon: any; description: string; color: string }[] = [
  { id: 'jumping', name: 'Jumping Jacks', icon: Zap, description: 'Jump high to cross the neon lines!', color: '#CCFF00' },
  { id: 'squats', name: 'Power Squats', icon: Activity, description: 'Dip low to reach the deep rewards!', color: '#00F0FF' },
  { id: 'hand_raise', name: 'Sky Reach', icon: Sparkles, description: 'Raise your hands above your head!', color: '#BC00FF' },
];

const GAME_DURATION = 60;
const LINE_COLORS = ['#CCFF00', '#00F0FF', '#BC00FF'];
const LINE_LABELS = ['BRONZE', 'SILVER', 'GOLD'];

const GameWorkout = () => {
  const navigate = useNavigate();
  const { addCoins } = useFitnessStore();
  
  // Game State
  const [gameState, setGameState] = useState<GameState>('start');
  const [exercise, setExercise] = useState<ExerciseType>('jumping');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#CCFF00');
  const [flyUps, setFlyUps] = useState<{ id: number; x: number; val: string }[]>([]);

  // Camera & AI State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [detectorReady, setDetectorReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Physics & Detection Refs
  const baselineRef = useRef<number>(0);
  const calibrationFramesRef = useRef<number[]>([]);
  const jumpCooldownRef = useRef<boolean>(false);
  const [currentMotionLevel, setCurrentMotionLevel] = useState(0); // 0-1
  const [linePositions, setLinePositions] = useState([0.65, 0.45, 0.25]);

  // Initialize Detector & Camera
  useEffect(() => {
    const init = async () => {
      try {
        await initPoseDetector();
        setDetectorReady(true);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play();
        }
      } catch (err) {
        setCameraError('Please allow camera access to play!');
      }
    };
    init();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Detection Logic Rep
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || (gameState !== 'playing' && gameState !== 'calibrating')) return;

    const pose = await getPose(videoRef.current);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !pose) {
      animFrameRef.current = requestAnimationFrame(runDetection);
      return;
    }

    const { videoWidth, videoHeight } = videoRef.current;
    const { width, height } = canvasRef.current;
    ctx.clearRect(0, 0, width, height);

    // Get keypoints
    const nose = pose.keypoints.find(k => k.name === 'nose');
    const lShoulder = pose.keypoints.find(k => k.name === 'left_shoulder');
    const rShoulder = pose.keypoints.find(k => k.name === 'right_shoulder');
    const lWrist = pose.keypoints.find(k => k.name === 'left_wrist');
    const rWrist = pose.keypoints.find(k => k.name === 'right_wrist');
    const lHip = pose.keypoints.find(k => k.name === 'left_hip');
    const rHip = pose.keypoints.find(k => k.name === 'right_hip');

    if (nose && nose.score && nose.score > 0.3) {
      // Normalize Y (0 = top, 1 = bottom)
      const noseY = nose.y / videoHeight;
      const shY = ((lShoulder?.y || 0) + (rShoulder?.y || 0)) / 2 / videoHeight;
      const hipY = ((lHip?.y || 0) + (rHip?.y || 0)) / 2 / videoHeight;
      const centerY = (noseY + shY + hipY) / 3;

      // CALIBRATION PHASE
      if (gameState === 'calibrating') {
        calibrationFramesRef.current.push(centerY);
        if (calibrationFramesRef.current.length > 50) {
          const avg = calibrationFramesRef.current.reduce((a, b) => a + b, 0) / calibrationFramesRef.current.length;
          baselineRef.current = avg;
          setGameState('countdown');
          startCountdown();
        }
      }

      // PLAYING PHASE
      if (gameState === 'playing' && baselineRef.current > 0) {
        let motionLevel = 0;
        let diff = 0;

        if (exercise === 'jumping') {
          diff = baselineRef.current - noseY; // Higher = smaller noseY
          motionLevel = Math.max(0, diff * 6);
        } else if (exercise === 'squats') {
          diff = shY - baselineRef.current; // Lower = larger shY
          motionLevel = Math.max(0, diff * 4);
        } else if (exercise === 'hand_raise') {
          const handY = Math.min(lWrist?.y || 999, rWrist?.y || 999) / videoHeight;
          motionLevel = Math.max(0, (noseY - handY) * 3);
        }

        setCurrentMotionLevel(Math.min(motionLevel, 1));

        // Trigger Rep
        if (!jumpCooldownRef.current && motionLevel > 0.15) {
          let earned = 0;
          let msg = '';
          let color = '#CCFF00';

          if (motionLevel > linePositions[2]) {
             earned = 5; msg = '🔥 LEGENDARY!'; color = '#BC00FF';
          } else if (motionLevel > linePositions[1]) {
             earned = 3; msg = '⚡ GREAT!'; color = '#00F0FF';
          } else if (motionLevel > 0.15) {
             earned = 1; msg = '✨ NICE!'; color = '#CCFF00';
          }

          if (earned > 0) {
            triggerRep(earned, msg, color);
          }
        }
      }

      // Draw minimal skeleton overlay
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc((nose.x / videoWidth) * width, (nose.y / videoHeight) * height, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(runDetection);
  }, [gameState, exercise, linePositions]);

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'calibrating') {
      animFrameRef.current = requestAnimationFrame(runDetection);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, runDetection]);

  const triggerRep = (earned: number, msg: string, color: string) => {
    setScore(s => s + earned);
    setCombo(c => c + 1);
    setFeedback(msg);
    setFeedbackColor(color);
    jumpCooldownRef.current = true;
    
    const id = Date.now();
    setFlyUps(f => [...f, { id, x: Math.random() * 60 + 20, val: `+${earned}` }]);
    setTimeout(() => setFlyUps(f => f.filter(fl => fl.id !== id)), 1000);
    setTimeout(() => setFeedback(''), 1200);
    setTimeout(() => { jumpCooldownRef.current = false; }, 800);
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    const t = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(t);
        setGameState('playing');
        startTimeLeft();
      }
    }, 1000);
  };

  const startTimeLeft = () => {
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); setGameState('gameover'); return 0; }
        return tl - 1;
      });
    }, 1000);
  };

  const handleFinish = () => {
    addCoins(score);
    toast.success(`Workout complete! +${score} coins`);
    navigate('/workout');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-display overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate('/workout')} className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center pointer-events-auto btn-interactive">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <AnimatePresence>
          {gameState === 'playing' && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3 pointer-events-auto">
               <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/10 text-white font-black text-xl backdrop-blur-md">
                 {timeLeft}s
               </div>
               <div className="px-4 py-2 rounded-2xl bg-primary/20 border border-primary/30 text-primary font-black text-xl flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                 <Coins className="w-5 h-5" /> {score}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 relative">
        {/* Camera Background */}
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 mix-blend-screen" 
          style={{ transform: 'scaleX(-1)' }} 
          playsInline 
          muted 
        />
        <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10" />

        <AnimatePresence>
          {/* 1. Start Screen */}
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-40 p-6 text-center">
              <div className="max-w-sm">
                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(204,255,0,0.3)]">
                  <Activity className="w-12 h-12 text-black" />
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">AI Fitness Arcade</h1>
                <p className="text-white/40 mb-10 leading-relaxed text-sm">Experience fully camera-based autonomous fitness. No buttons. No manual controls. Just move.</p>
                
                {!detectorReady ? (
                  <div className="flex items-center justify-center gap-3 text-primary animate-pulse font-bold uppercase tracking-widest text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" /> Calibrating AI Neural Engine...
                  </div>
                ) : (
                  <button onClick={() => setGameState('selecting_exercise')} className="w-full py-6 rounded-3xl bg-primary text-black font-black uppercase tracking-[0.3em] text-lg shadow-[0_0_50px_rgba(204,255,0,0.3)] btn-interactive">
                    Initialize Quest
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. Exercise Selection */}
          {gameState === 'selecting_exercise' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-40 p-6">
              <div className="w-full max-w-md">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 text-center">Select Your Discipline</h2>
                <div className="grid gap-4">
                  {EXERCISES.map((ex) => (
                    <button 
                      key={ex.id}
                      onClick={() => { setExercise(ex.id); setGameState('calibrating'); calibrationFramesRef.current = []; }}
                      className="group relative flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${ex.color}20` }}>
                        <ex.icon className="w-8 h-8" style={{ color: ex.color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white uppercase">{ex.name}</h3>
                        <p className="text-xs text-white/40 font-medium">{ex.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Calibration */}
          {gameState === 'calibrating' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-40">
              <Target className="w-24 h-24 text-primary animate-pulse mb-6 drop-shadow-[0_0_30px_rgba(204,255,0,0.5)]" />
              <h2 className="text-3xl font-black text-white uppercase mb-2">CALIBRATING BASELINE</h2>
              <p className="text-white/60 font-medium tracking-widest uppercase text-xs">Stand still and ensure full body is visible</p>
              <div className="w-64 h-2 bg-white/10 rounded-full mt-10 overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} className="h-full bg-primary shadow-[0_0_15px_rgba(204,255,0,1)]" />
              </div>
            </motion.div>
          )}

          {/* 4. Countdown */}
          {gameState === 'countdown' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/20 z-40">
              <motion.span key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[200px] font-black text-primary italic drop-shadow-[0_0_80px_rgba(204,255,0,0.6)]">
                {countdown > 0 ? countdown : 'GO!'}
              </motion.span>
            </motion.div>
          )}

          {/* 5. Game Over */}
          {gameState === 'gameover' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-3xl z-50 p-6 text-center">
              <div className="w-full max-w-sm">
                <Trophy className="w-24 h-24 text-primary mx-auto mb-6 drop-shadow-[0_0_40px_rgba(204,255,0,0.4)]" />
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">Phase Complete!</h2>
                
                <div className="grid grid-cols-2 gap-4 mt-8 mb-12">
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <p className="text-3xl font-black text-primary">{score}</p>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Coins Earned</p>
                   </div>
                   <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                     <p className="text-3xl font-black text-neon-blue">{combo}</p>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Move Combo</p>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={() => setGameState('selecting_exercise')} className="w-full py-5 rounded-3xl bg-primary text-black font-black uppercase tracking-widest text-sm btn-interactive shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                    Another Quest
                  </button>
                  <button onClick={handleFinish} className="w-full py-5 rounded-3xl bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-sm btn-interactive">
                    Collect & Exit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6. Gameplay HUD Overlay */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Combo Meter */}
            {combo > 2 && (
              <motion.div initial={{ scale: 0, x: -50 }} animate={{ scale: 1, x: 0 }} className="absolute top-1/4 left-8 z-30">
                <div className="flex flex-col items-center">
                   <p className="text-6xl font-black text-gradient italic shadow-sm">{combo}x</p>
                   <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">COMBO</p>
                </div>
              </motion.div>
            )}

            {/* Rep Feedback Message */}
            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1.5, opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                  <h2 className="text-7xl font-black text-center italic tracking-tighter drop-shadow-[0_0_50px_rgba(0,0,0,1)]" style={{ color: feedbackColor }}>
                    {feedback}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fly Ups */}
            <AnimatePresence>
              {flyUps.map(f => (
                <motion.div key={f.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -150 }} className="absolute text-primary font-black text-4xl pointer-events-none z-30" style={{ left: `${f.x}%`, top: '40%' }}>
                  {f.val}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 3 Horizontal Reward Lines */}
            <div className="absolute inset-0 px-20 flex flex-col justify-end pb-[20vh] space-y-[15vh] opacity-30">
              {LINE_LABELS.map((label, i) => (
                <div key={label} className="relative h-1 w-full rounded-full" style={{ backgroundColor: LINE_COLORS[2-i] }}>
                   <div className="absolute -top-6 left-0 text-[10px] font-black uppercase tracking-widest" style={{ color: LINE_COLORS[2-i] }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Motion Intensity Meter (Sidebar) */}
            <div className="absolute right-8 bottom-24 top-24 w-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
               <motion.div 
                 animate={{ height: `${currentMotionLevel * 100}%` }} 
                 className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-neon-blue" 
               />
               <div className="absolute inset-0 flex flex-col justify-around opacity-30 px-0.5">
                  <div className="w-full h-0.5 bg-white" />
                  <div className="w-full h-0.5 bg-white" />
                  <div className="w-full h-0.5 bg-white" />
               </div>
            </div>

            {/* Exercise Tooltip */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
               <Info className="w-4 h-4 text-primary" />
               <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                 {EXERCISES.find(ex => ex.id === exercise)?.name}: Move to intersect reward zones
               </p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Error Modal */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[100] p-8 text-center">
           <div>
              <CameraOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white uppercase mb-4">{cameraError}</h2>
              <button onClick={() => window.location.reload()} className="px-8 py-3 rounded-2xl bg-primary text-black font-black uppercase tracking-widest">
                Retry Connection
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameWorkout;