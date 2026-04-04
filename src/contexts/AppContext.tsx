import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  fullName: string;
  age: string;
  city: string;
  height: string;
  weight: string;
  targetWeight: string;
  gender: 'female' | 'male' | 'other' | '';
  fitnessGoal: string;
  experienceLevel: string;
  workoutPreference: string;
}

interface MealEntry {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DayProgress {
  workoutDone: boolean;
  steps: number;
  caloriesBurned: number;
  water: number;
  meals: { breakfast: MealEntry[]; lunch: MealEntry[]; dinner: MealEntry[]; snacks: MealEntry[] };
  heartRate: string;
}

interface AppState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onboardingComplete: boolean;
  onboardingStep: number;
  profile: UserProfile;
  level: number;
  day: number;
  coins: number;
  totalSteps: number;
  totalCalories: number;
  totalWater: number;
  dayProgress: DayProgress;
  completedLevels: number[];
  theme: string;
}

const defaultDayProgress: DayProgress = {
  workoutDone: false,
  steps: 0,
  caloriesBurned: 0,
  water: 0,
  meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
  heartRate: '',
};

const defaultProfile: UserProfile = {
  fullName: '',
  age: '',
  city: '',
  height: '',
  weight: '',
  targetWeight: '',
  gender: '',
  fitnessGoal: '',
  experienceLevel: '',
  workoutPreference: '',
};

const defaultState: AppState = {
  isLoggedIn: false,
  isAdmin: false,
  onboardingComplete: false,
  onboardingStep: 0,
  profile: defaultProfile,
  level: 1,
  day: 1,
  coins: 0,
  totalSteps: 0,
  totalCalories: 0,
  totalWater: 0,
  dayProgress: defaultDayProgress,
  completedLevels: [],
  theme: 'theme-female',
};

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => void;
  logout: () => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setGender: (gender: 'female' | 'male' | 'other') => void;
  addWater: (ml: number) => void;
  addSteps: (steps: number) => void;
  addCalories: (cal: number) => void;
  addCoins: (coins: number) => void;
  addMeal: (type: keyof DayProgress['meals'], meal: MealEntry) => void;
  setHeartRate: (hr: string) => void;
  completeWorkout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('levelfit-state');
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  });

  useEffect(() => {
    localStorage.setItem('levelfit-state', JSON.stringify(state));
  }, [state]);

  const login = (email: string, password: string) => {
    if (email === 'admin@gmail.com' && password === 'admin') {
      setState(s => ({ ...s, isLoggedIn: true, isAdmin: true, onboardingComplete: true, theme: 'theme-admin' }));
      return true;
    }
    const users = JSON.parse(localStorage.getItem('levelfit-users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      setState(s => ({ ...s, isLoggedIn: true, isAdmin: false }));
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('levelfit-users') || '[]');
    users.push({ email, password });
    localStorage.setItem('levelfit-users', JSON.stringify(users));
    setState(s => ({ ...s, isLoggedIn: true, isAdmin: false }));
  };

  const logout = () => {
    setState(defaultState);
    localStorage.removeItem('levelfit-state');
  };

  const setOnboardingStep = (step: number) => setState(s => ({ ...s, onboardingStep: step }));

  const completeOnboarding = () => setState(s => ({ ...s, onboardingComplete: true }));

  const updateProfile = (updates: Partial<UserProfile>) =>
    setState(s => ({ ...s, profile: { ...s.profile, ...updates } }));

  const setGender = (gender: 'female' | 'male' | 'other') => {
    const themeMap = { female: 'theme-female', male: 'theme-male', other: 'theme-other' };
    setState(s => ({ ...s, profile: { ...s.profile, gender }, theme: themeMap[gender] }));
  };

  const addWater = (ml: number) =>
    setState(s => ({
      ...s,
      totalWater: s.totalWater + ml,
      dayProgress: { ...s.dayProgress, water: s.dayProgress.water + ml },
    }));

  const addSteps = (steps: number) =>
    setState(s => ({
      ...s,
      totalSteps: s.totalSteps + steps,
      dayProgress: { ...s.dayProgress, steps: s.dayProgress.steps + steps },
    }));

  const addCalories = (cal: number) =>
    setState(s => ({
      ...s,
      totalCalories: s.totalCalories + cal,
      dayProgress: { ...s.dayProgress, caloriesBurned: s.dayProgress.caloriesBurned + cal },
    }));

  const addCoins = (coins: number) => setState(s => ({ ...s, coins: s.coins + coins }));

  const addMeal = (type: keyof DayProgress['meals'], meal: MealEntry) =>
    setState(s => ({
      ...s,
      dayProgress: {
        ...s.dayProgress,
        meals: { ...s.dayProgress.meals, [type]: [...s.dayProgress.meals[type], meal] },
      },
    }));

  const setHeartRate = (hr: string) =>
    setState(s => ({ ...s, dayProgress: { ...s.dayProgress, heartRate: hr } }));

  const completeWorkout = () =>
    setState(s => ({
      ...s,
      coins: s.coins + 10,
      dayProgress: { ...s.dayProgress, workoutDone: true },
    }));

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        signup,
        logout,
        setOnboardingStep,
        completeOnboarding,
        updateProfile,
        setGender,
        addWater,
        addSteps,
        addCalories,
        addCoins,
        addMeal,
        setHeartRate,
        completeWorkout,
      }}
    >
      <div className={state.theme}>{children}</div>
    </AppContext.Provider>
  );
};
