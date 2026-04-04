import { create } from 'zustand';

interface WorkoutState {
  isRunning: boolean;
  isPaused: boolean;
  timerSeconds: number;
  currentReps: number;
  totalReps: number;
  currentExerciseIndex: number;
  currentSet: number;
  intervalId: number | null;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  addRep: () => void;
  removeRep: () => void;
  completeSet: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  reset: () => void;
  tick: () => void;
}

export const useWorkoutStore = create<WorkoutState>()((set, get) => ({
  isRunning: false, isPaused: false, timerSeconds: 0,
  currentReps: 0, totalReps: 0, currentExerciseIndex: 0, currentSet: 0, intervalId: null,
  tick: () => set(s => ({ timerSeconds: s.timerSeconds + 1 })),
  startTimer: () => {
    const id = window.setInterval(() => get().tick(), 1000);
    set({ isRunning: true, isPaused: false, intervalId: id });
  },
  pauseTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isPaused: true, intervalId: null });
  },
  resumeTimer: () => {
    const id = window.setInterval(() => get().tick(), 1000);
    set({ isPaused: false, intervalId: id });
  },
  stopTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, isPaused: false, intervalId: null });
  },
  addRep: () => set(s => ({ currentReps: s.currentReps + 1, totalReps: s.totalReps + 1 })),
  removeRep: () => set(s => ({ currentReps: Math.max(0, s.currentReps - 1), totalReps: Math.max(0, s.totalReps - 1) })),
  completeSet: () => set(s => ({ currentSet: s.currentSet + 1, currentReps: 0 })),
  nextExercise: () => set(s => ({ currentExerciseIndex: Math.min(4, s.currentExerciseIndex + 1), currentSet: 0, currentReps: 0 })),
  prevExercise: () => set(s => ({ currentExerciseIndex: Math.max(0, s.currentExerciseIndex - 1), currentSet: 0, currentReps: 0 })),
  reset: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, isPaused: false, timerSeconds: 0, currentReps: 0, totalReps: 0, currentExerciseIndex: 0, currentSet: 0, intervalId: null });
  },
}));