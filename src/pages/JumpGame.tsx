import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Coins, Trophy, Zap, ArrowLeft, Play, RotateCcw, Sparkles, Target, Activity, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '@/stores/fitnessStore';
import { initPoseDetector, getPose } from '@/lib/poseDetection';
import toast from 'react-hot-toast';

type GameState = 'idle' | 'calibrating' | 'countdown' | 'playing' | 'finished';

const GAME_DURATION = 30; // seconds
const LINE_COLORS = ['#CCFF00', '#00F0FF', '#BC00FF'];
const LINE_LABELS = ['BRONZE +1', 'SILVER +3', 'GOLD +5'];

const JumpGame = () => {
  const navigate = useNavigate();
  const { addCoins } = useFitnessStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const baselineRef = useRef<number>(0);
  const jumpCooldownRef = useRef<boolean>(false);
  const calibrationFramesRef = useRef<number[]>([]);

  const [detectorReady, setDetectorReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [coins, setCoins] = useState(0);
  const [jumps, setJumps] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#CCFF00');
  const [currentJumpHeight, setCurrentJumpHeight] = useState(0);
  const [linePositions, setLinePositions] = useState([0.7, 0.5, 0.3]);
  const [showFlash, setShowFlash] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // 1 to 1.5

  // Start detector & camera
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
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (err) {
        setCameraError('Please allow camera access to play!');
      }
    };
    init();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Main Game Logic Loop
  const runGameFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || (gameState !== 'playing' && gameState !== 'calibrating')) return;

    const pose = await getPose(videoRef.current);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !pose) {
      animFrameRef.current = requestAnimationFrame(runGameFrame);
      return;
    }

    const { width, height } = canvasRef.current;
    ctx.clearRect(0, 0, width, height);

    // Filter keypoints
    const nose = pose.keypoints.find(k => k.name === 'nose');
    const lShoulder = pose.keypoints.find(k => k.name === 'left_shoulder');
    const rShoulder = pose.keypoints.find(k => k.name === 'right_shoulder');
    
    if (nose && nose.score && nose.score > 0.3) {
      const noseY = nose.y / videoRef.current.videoHeight;
      const shouldersY = ((lShoulder?.y || 0) + (rShoulder?.y || 0)) / 2 / videoRef.current.videoHeight;
      const centerY = (noseY + shouldersY) / 2;

      // Calibration logic
      if (gameState === 'calibrating') {
        calibrationFramesRef.current.push(centerY);
        if (calibrationFramesRef.current.length > 50) {
          const avg = calibrationFramesRef.current.reduce((a, b) => a + b, 0) / calibrationFramesRef.current.length;
          baselineRef.current = avg;
          setGameState('countdown');
          startCountdown();
        }
      }

      // Playing logic
      if (gameState === 'playing' && baselineRef.current > 0) {
        const jumpDelta = baselineRef.current - centerY;
        const normalizedJump = Math.max(0, jumpDelta * 5); // Amplify motion
        setCurrentJumpHeight(Math.min(normalizedJump, 1));

        // Detect jump cross
        if (!jumpCooldownRef.current && normalizedJump > 0.1) {
          let earned = 0;
          let msg = '';
          let color = '#CCFF00';

          if (normalizedJump > linePositions[2] * (2 - difficulty)) {
             earned = 5; msg = '🔥 INSANE HEIGHT!'; color = '#BC00FF';
          } else if (normalizedJump > linePositions[1] * (2 - difficulty)) {
             earned = 3; msg = '⚡ GREAT JUMP!'; color = '#00F0FF';
          } else if (normalizedJump > 0.1) {
             earned = 1; msg = '✨ NICE HOP!'; color = '#CCFF00';
          }

          if (earned > 0) {
            setCoins(c => c + earned);
            setJumps(j => j + 1);
            setFeedback(msg);
            setFeedbackColor(color);
            setShowFlash(true);
            jumpCooldownRef.current = true;
            
            // Adjust Difficulty
            if (earned === 5) setDifficulty(d => Math.min(d + 0.05, 1.5));
            
            setTimeout(() => setShowFlash(false), 150);
            setTimeout(() => setFeedback(''), 1200);
            setTimeout(() => { jumpCooldownRef.current = false; }, 600);
          }
        }
      }

      // Draw tracking UI
      ctx.beginPath();
      ctx.arc(nose.x, nose.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.fill();
    }

    animFrameRef.current = requestAnimationFrame(runGameFrame);
  }, [gameState, linePositions, difficulty]);

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'calibrating') {
      animFrameRef.current = requestAnimationFrame(runGameFrame);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, runGameFrame]);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setGameState('playing');
        startTimer();
      }
    }, 1000);
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setGameState('finished'); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const startCalibration = () => {
    calibrationFramesRef.current = [];
    setGameState('calibrating');
  };

  useEffect(() => {
    if (gameState === 'finished' && coins > 0) {
      addCoins(coins);
      toast.success(`🎮 Session finished! +${coins} coins`);
    }
  }, [gameState]);

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col font-display">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center pointer-events-auto">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/10 text-white font-black text-xl">{timeLeft}s</div>
             <div className="px-4 py-2 rounded-2xl bg-neon-green/20 border border-neon-green/30 text-neon-green font-black text-xl flex items-center gap-2">
               <Coins className="w-5 h-5" /> {coins}
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" style={{ transform: 'scaleX(-1)' }} playsInline muted />
        <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        <AnimatePresence>
          {showFlash && <motion.div initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} className="absolute inset-0 bg-white z-10" />}
          {feedback && (
            <motion.div initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1.5, opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <h2 className="text-6xl font-black text-center italic tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,1)]" style={{ color: feedbackColor }}>{feedback}</h2>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-40 p-6">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Activity className="w-12 h-12 text-black" />
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">AI Jump Quest</h2>
              <p className="text-white/40 mb-10 leading-relaxed text-sm">Stand back and ensure your head and shoulders are visible. We'll track your motion using AI Pose Detection.</p>
              
              {!detectorReady ? (
                <div className="flex items-center justify-center gap-3 text-primary animate-pulse font-bold uppercase tracking-widest text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Initializing AI...
                </div>
              ) : (
                <button onClick={startCalibration} className="w-full py-6 rounded-3xl bg-primary text-black font-black uppercase tracking-[0.3em] text-lg shadow-[0_0_50px_rgba(204,255,0,0.3)] btn-interactive">
                  Start Quest
                </button>
              )}
            </div>
          </div>
        )}

        {gameState === 'calibrating' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-40">
            <Target className="w-20 h-20 text-primary animate-pulse mb-6" />
            <h2 className="text-2xl font-black text-white uppercase mb-2">CALIBRATING...</h2>
            <p className="text-white/60 font-medium">Stand still and look at the camera</p>
            <div className="w-48 h-1.5 bg-white/10 rounded-full mt-8 overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-primary" />
            </div>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-40">
            <motion.span key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[180px] font-black text-primary italic drop-shadow-2xl">
              {countdown}
            </motion.span>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 p-6 text-center">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Trophy className="w-24 h-24 text-primary mx-auto mb-6" />
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">Well Done!</h2>
              <div className="grid grid-cols-2 gap-4 mt-8 mb-12">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                   <p className="text-3xl font-black text-primary">{coins}</p>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Coins</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                   <p className="text-3xl font-black text-neon-blue">{jumps}</p>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Jumps</p>
                 </div>
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          </div>
        )}

        {/* HUD Elements */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-24 opacity-60">
                {LINE_LABELS.map((l, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: LINE_COLORS[i] }} />
                    <p className="text-[8px] font-black uppercase vertical-text tracking-widest" style={{ color: LINE_COLORS[i] }}>{l}</p>
                  </div>
                ))}
             </div>
             <div className="absolute right-6 bottom-12 top-12 w-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ height: `${currentJumpHeight * 100}%` }} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-neon-blue" />
             </div>
          </div>
        )}
      </div>

      {/* Camera Error Modal */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[400] p-8 text-center pointer-events-auto">
           <div>
              <CameraOff className="w-16 h-16 text-red-500 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
              <h2 className="text-2xl font-black text-white uppercase mb-4">{cameraError}</h2>
              <div className="flex flex-col gap-3">
                <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                  Retry Connection
                </button>
                <button onClick={() => navigate(-1)} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px]">
                  Cancel Quest
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default JumpGame;
