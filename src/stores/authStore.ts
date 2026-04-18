import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setGender: (g: 'female' | 'male' | 'other') => void;
  setOnboardingStep: (s: number) => void;
  completeOnboarding: () => void;
  setTheme: (t: string) => void;
  setNotifications: (v: boolean) => void;
  setUnits: (u: 'metric' | 'imperial') => void;
  initialize: () => void;
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
      isLoading: true,

      initialize: () => {
        try {
          supabase.auth.onAuthStateChange(async (event, session) => {
            try {
              if (session?.user) {
                const { data: profile, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (error) {
                  console.error('Error fetching profile:', error);
                  // We still have the session user, so we can set a basic profile
                  set({ 
                    user: { ...defaultProfile, email: session.user.email || '', fullName: session.user.user_metadata?.full_name || '' }, 
                    isLoggedIn: true, 
                    isLoading: false 
                  });
                  return;
                }

                if (profile) {
                  set({ 
                    user: profile, 
                    isLoggedIn: true, 
                    role: session.user.email === 'admin@gmail.com' ? 'admin' : 'user',
                    onboardingComplete: profile.onboarding_complete || false,
                    isLoading: false 
                  });
                } else {
                  set({ 
                    user: { ...defaultProfile, email: session.user.email || '', fullName: session.user.user_metadata?.full_name || '' }, 
                    isLoggedIn: true, 
                    isLoading: false 
                  });
                }
              } else {
                set({ user: defaultProfile, isLoggedIn: false, isLoading: false, role: 'user' });
              }
            } catch (err) {
              console.error('Critical auth init error:', err);
              set({ isLoading: false });
            }
          });
        } catch (err) {
          console.error('Auth listener failed:', err);
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
          });
          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Google login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signup: async (name, email, password) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: { data: { full_name: name } }
          });
          
          if (error) throw error;
          if (!data.user) return false;

          const newProfile = { ...defaultProfile, fullName: name, email };
          await supabase.from('profiles').insert([
            { 
              id: data.user.id, 
              full_name: name, 
              email: email, 
              onboarding_complete: false,
              role: 'user'
            }
          ]);
          
          set({ 
            user: newProfile, 
            isLoggedIn: true, 
            onboardingComplete: false, 
            onboardingStep: 0,
            memberSince: new Date().toISOString(),
            isLoading: false
          });
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ 
          isLoggedIn: false, 
          onboardingComplete: false, 
          onboardingStep: 0, 
          role: 'user', 
          user: defaultProfile, 
          theme: 'theme-female' 
        });
      },

      updateProfile: async (updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ ...updates, onboarding_complete: get().onboardingComplete })
            .eq('id', user.id);
            
          if (error) throw error;
          set(s => ({ user: { ...s.user, ...updates } }));
        } catch (error) {
          console.error('Update profile error:', error);
        }
      },

      setGender: (g) => {
        const themeMap = { female: 'theme-female', male: 'theme-male', other: 'theme-other' } as const;
        set(s => ({ user: { ...s.user, gender: g }, theme: themeMap[g] }));
      },

      setOnboardingStep: (s) => set({ onboardingStep: s }),
      completeOnboarding: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id);
          }
        } catch (err) {
          console.error('Error completing onboarding in cloud:', err);
        }
        set({ onboardingComplete: true });
      },
      setTheme: (t) => set({ theme: t }),
      setNotifications: (v) => set({ notifications: v }),
      setUnits: (u) => set({ units: u }),
    }),
    { 
      name: 'levelfit-auth',
      partialize: (state) => ({ 
        onboardingComplete: state.onboardingComplete,
        onboardingStep: state.onboardingStep,
        theme: state.theme,
        notifications: state.notifications,
        units: state.units,
        role: state.role
      })
    }
  )
);