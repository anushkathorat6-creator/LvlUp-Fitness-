import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  fullName: string;
  email: string;
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

interface AuthState {
  user: UserProfile;
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  onboardingStep: number;
  role: 'user' | 'admin';
  theme: string;
  notifications: boolean;
  units: 'metric' | 'imperial';
  memberSince: string;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setGender: (g: 'female' | 'male' | 'other') => void;
  setOnboardingStep: (s: number) => void;
  completeOnboarding: () => void;
  setTheme: (t: string) => void;
  setNotifications: (v: boolean) => void;
  setUnits: (u: 'metric' | 'imperial') => void;
}

const defaultProfile: UserProfile = {
  fullName: '', email: '', age: '', city: '', height: '', weight: '',
  targetWeight: '', gender: '', fitnessGoal: '', experienceLevel: '', workoutPreference: '',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: defaultProfile,
      isLoggedIn: false,
      onboardingComplete: false,
      onboardingStep: 0,
      role: 'user',
      theme: 'theme-female',
      notifications: true,
      units: 'metric',
      memberSince: '',
      login: (email, password) => {
        if (email === 'admin@gmail.com' && password === 'admin') {
          set({ isLoggedIn: true, role: 'admin', onboardingComplete: true, theme: 'theme-admin', user: { ...defaultProfile, email, fullName: 'Admin' }, memberSince: get().memberSince || new Date().toISOString() });
          return true;
        }
        const users: any[] = JSON.parse(localStorage.getItem('levelfit-users') || '[]');
        const found = users.find((u: any) => u.email === email && u.password === password);
        if (found) {
          set({ isLoggedIn: true, role: 'user', user: { ...get().user, email, fullName: found.name || get().user.fullName }, memberSince: get().memberSince || new Date().toISOString() });
          return true;
        }
        return false;
      },
      signup: (name, email, password) => {
        const users: any[] = JSON.parse(localStorage.getItem('levelfit-users') || '[]');
        if (users.some((u: any) => u.email === email)) return false;
        users.push({ name, email, password });
        localStorage.setItem('levelfit-users', JSON.stringify(users));
        set({ isLoggedIn: true, role: 'user', user: { ...defaultProfile, fullName: name, email }, onboardingComplete: false, onboardingStep: 0, memberSince: new Date().toISOString() });
        return true;
      },
      logout: () => set({ isLoggedIn: false, onboardingComplete: false, onboardingStep: 0, role: 'user', user: defaultProfile, theme: 'theme-female' }),
      updateProfile: (updates) => set(s => ({ user: { ...s.user, ...updates } })),
      setGender: (g) => {
        const themeMap = { female: 'theme-female', male: 'theme-male', other: 'theme-other' } as const;
        set(s => ({ user: { ...s.user, gender: g }, theme: themeMap[g] }));
      },
      setOnboardingStep: (s) => set({ onboardingStep: s }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setTheme: (t) => set({ theme: t }),
      setNotifications: (v) => set({ notifications: v }),
      setUnits: (u) => set({ units: u }),
    }),
    { name: 'levelfit-auth' }
  )
);