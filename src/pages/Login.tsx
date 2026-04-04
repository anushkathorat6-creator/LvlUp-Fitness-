import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = () => {
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    const success = login(email, password);
    if (success) {
      toast.success('Welcome back! ✨');
      const { role, onboardingComplete } = useAuthStore.getState();
      if (role === 'admin') navigate('/admin-dashboard');
      else if (!onboardingComplete) navigate('/onboarding');
      else navigate('/dashboard');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('Invalid credentials');
    }
  };

  const handleSignup = () => {
    if (!fullName || !email || !password || !confirmPassword) { toast.error('Please fill all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 4) { toast.error('Password must be at least 4 characters'); return; }
    const success = signup(fullName, email, password);
    if (success) { toast.success('Account created! ✨'); navigate('/onboarding'); }
    else toast.error('Email already exists');
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`glass-strong rounded-3xl p-8 w-full max-w-md ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">LevelFit AI</h1>
        </div>

        <div className="flex bg-muted rounded-full p-1 mb-6">
          {(['login', 'signup'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === t ? 'gradient-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'signup' && (
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none mb-3 text-sm" />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none mb-3 text-sm" />
            <div className="relative mb-3">
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Password" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm pr-12" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {tab === 'signup' && (
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none mb-3 text-sm" />
            )}
            {tab === 'login' && (
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded accent-primary" /> Remember me
                </label>
                <button onClick={() => setShowForgot(true)} className="text-sm text-primary font-medium hover:underline">Forgot?</button>
              </div>
            )}
            <button onClick={tab === 'login' ? handleLogin : handleSignup} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive shadow-lg mb-3">
              {tab === 'login' ? 'Login' : 'Create Account'}
            </button>
            <button onClick={() => toast('Google auth coming soon!', { icon: '🔜' })} className="w-full py-3 rounded-full bg-white/80 border border-border text-foreground font-medium text-sm btn-interactive flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showForgot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowForgot(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-3xl p-6 w-full max-w-sm">
              <h3 className="font-display text-lg font-bold mb-2">Reset Password</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter your email to receive a reset link.</p>
              <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none mb-3 text-sm" />
              <button onClick={() => { toast.success('Reset link sent! 📧'); setShowForgot(false); }} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive">Send Reset Link</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;