import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Flame, Zap, Target, Dumbbell, Home as HomeIcon, Building, Shuffle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const quotes = [
  "The body achieves what the mind believes.",
  "Small steps every day lead to big changes.",
  "Your only limit is your mind.",
  "Believe in yourself and all that you are.",
  "Sweat is just fat crying. Let it out!",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingStep, setOnboardingStep, updateProfile, setGender, completeOnboarding, user } = useAuthStore();
  const step = onboardingStep;
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [form, setForm] = useState({ fullName: user.fullName, age: '', city: '', height: '', weight: '', targetWeight: '' });
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [selectedPref, setSelectedPref] = useState('');
  const [selectedGender, setSelectedGender] = useState<'female' | 'male' | 'other' | ''>('');

  const next = () => { if (step < 5) setOnboardingStep(step + 1); };
  const back = () => { if (step > 0) setOnboardingStep(step - 1); };

  const finish = () => {
    updateProfile({ ...form, fitnessGoal: selectedGoal, experienceLevel: selectedExp, workoutPreference: selectedPref });
    completeOnboarding();
    toast.success('Welcome to LevelFit AI! 🎉');
    navigate('/dashboard');
  };

  const bmi = form.height && form.weight ? (parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1) : null;

  const goals = [
    { id: 'weight-loss', label: 'Weight Loss', icon: Flame, color: 'from-red-300 to-orange-300' },
    { id: 'muscle-gain', label: 'Muscle Gain', icon: Dumbbell, color: 'from-blue-300 to-indigo-300' },
    { id: 'stay-fit', label: 'Stay Fit', icon: Heart, color: 'from-pink-300 to-rose-300' },
    { id: 'body-toning', label: 'Body Toning', icon: Sparkles, color: 'from-purple-300 to-violet-300' },
    { id: 'strength', label: 'Strength', icon: Zap, color: 'from-yellow-300 to-amber-300' },
  ];

  const experiences = [
    { id: 'beginner', label: 'Beginner', desc: 'Just starting out' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Getting consistent' },
    { id: 'advanced', label: 'Advanced', desc: 'I train hard' },
  ];

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{step + 1} / 6</span>
        </div>
        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
          <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${((step + 1) / 6) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full max-w-md">

            {step === 0 && (
              <div className="text-center space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                  <Sparkles className="w-16 h-16 text-gold mx-auto mb-4 float-animation" />
                </motion.div>
                <h1 className="font-display text-3xl font-bold text-foreground">Welcome to LevelFit AI ✨</h1>
                <motion.p key={quoteIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-lg italic">"{quotes[quoteIdx]}"</motion.p>
                <button onClick={() => setQuoteIdx((quoteIdx + 1) % quotes.length)} className="text-sm text-primary underline">Next quote</button>
                <button onClick={next} className="w-full py-3 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive shadow-lg text-lg">Let's Begin</button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-center">I identify as...</h2>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'female' as const, label: 'Female', symbol: '♀', color: 'from-pink-200 to-rose-300' },
                    { id: 'male' as const, label: 'Male', symbol: '♂', color: 'from-blue-200 to-indigo-300' },
                    { id: 'other' as const, label: 'Other', symbol: '✦', color: 'from-green-200 to-emerald-300' },
                  ]).map(g => (
                    <motion.button key={g.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedGender(g.id); setGender(g.id); }}
                      className={`relative glass rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${selectedGender === g.id ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl`}>{g.symbol}</div>
                      <span className="font-semibold text-foreground">{g.label}</span>
                      {selectedGender === g.id && <Check className="absolute top-2 right-2 w-5 h-5 text-primary" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-center">Tell us about you</h2>
                {[
                  { key: 'fullName', label: 'Full Name', type: 'text' },
                  { key: 'age', label: 'Age', type: 'number' },
                  { key: 'city', label: 'City', type: 'text' },
                  { key: 'height', label: 'Height (cm)', type: 'number' },
                  { key: 'weight', label: 'Weight (kg)', type: 'number' },
                  { key: 'targetWeight', label: 'Target Weight (kg)', type: 'number' },
                ].map(f => (
                  <input key={f.key} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} type={f.type} placeholder={f.label}
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-input focus:ring-2 focus:ring-ring outline-none text-sm" />
                ))}
                {bmi && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 text-center">
                    <p className="text-sm text-muted-foreground">Your BMI</p>
                    <p className="text-2xl font-bold text-gradient">{bmi}</p>
                    <p className="text-xs text-muted-foreground">{parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}</p>
                  </motion.div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-center">What's your main goal?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {goals.map(g => (
                    <motion.button key={g.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`relative glass rounded-3xl p-5 flex flex-col items-center gap-2 transition-all ${selectedGoal === g.id ? 'ring-2 ring-primary shadow-xl' : ''} ${g.id === 'strength' ? 'col-span-2' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center`}>
                        <g.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">{g.label}</span>
                      {selectedGoal === g.id && <Check className="absolute top-2 right-2 w-5 h-5 text-primary" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-center">How experienced are you?</h2>
                {experiences.map(e => (
                  <motion.button key={e.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedExp(e.id)}
                    className={`w-full glass rounded-2xl p-5 flex items-center gap-4 transition-all ${selectedExp === e.id ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl ${selectedExp === e.id ? 'gradient-primary' : 'bg-muted'} flex items-center justify-center`}>
                      <Target className={`w-6 h-6 ${selectedExp === e.id ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{e.label}</p>
                      <p className="text-sm text-muted-foreground">{e.desc}</p>
                    </div>
                    {selectedExp === e.id && <Check className="ml-auto w-5 h-5 text-primary" />}
                  </motion.button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-center">Where do you prefer to train?</h2>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'home', label: 'Home', icon: HomeIcon },
                    { id: 'gym', label: 'Gym', icon: Building },
                    { id: 'both', label: 'Both', icon: Shuffle },
                  ]).map(p => (
                    <motion.button key={p.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPref(p.id)}
                      className={`relative glass rounded-3xl p-6 flex flex-col items-center gap-3 transition-all ${selectedPref === p.id ? 'ring-2 ring-primary shadow-xl' : ''}`}>
                      <div className={`w-14 h-14 rounded-2xl ${selectedPref === p.id ? 'gradient-primary' : 'bg-muted'} flex items-center justify-center`}>
                        <p.icon className={`w-7 h-7 ${selectedPref === p.id ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="font-semibold text-sm text-foreground">{p.label}</span>
                      {selectedPref === p.id && <Check className="absolute top-2 right-2 w-5 h-5 text-primary" />}
                    </motion.button>
                  ))}
                </div>
                <button onClick={finish} className="w-full py-3.5 rounded-full gradient-primary text-primary-foreground font-semibold btn-interactive shadow-lg text-lg">Start My Journey 🚀</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-8 flex justify-between max-w-md mx-auto w-full">
        {step > 0 ? (
          <button onClick={back} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors btn-interactive px-4 py-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}
        {step < 5 && step > 0 && (
          <button onClick={next} className="flex items-center gap-2 gradient-primary text-primary-foreground rounded-full px-6 py-2.5 font-semibold btn-interactive shadow-md">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;