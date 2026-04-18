import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  clearChat: () => void;
  simulateResponse: (userMessage: string) => void;
}

const getBotResponse = (input: string): string => {
  const query = input.toLowerCase();

  if (query.includes('lose weight') || query.includes('fat loss') || query.includes('slim')) {
    return "To lose weight effectively:\n• Calorie deficit of 300-500 kcal/day\n• High protein (1.6g per kg bodyweight)\n• 150 min cardio + 3x strength training per week\n• Sleep 7-9 hours\nWant me to create a personalized fat-loss meal plan? 🔥";
  }
  if (query.includes('eat') || query.includes('diet') || query.includes('food') || query.includes('nutrition') || query.includes('meal')) {
    return "Here's your power meal blueprint:\n🥩 Protein: Chicken, eggs, tofu, lentils\n🍠 Carbs: Quinoa, sweet potato, oats\n🥑 Fats: Avocado, nuts, olive oil\n🥗 Fiber: Broccoli, spinach, berries\n\nAim for 4-5 small meals. Want a specific meal plan for your goal?";
  }
  if (query.includes('workout') || query.includes('exercise') || query.includes('train') || query.includes('routine')) {
    return "Here's your weekly split:\n💪 Mon: Push (Chest, Shoulders, Triceps)\n🏋️ Tue: Pull (Back, Biceps)\n🦵 Wed: Legs (Quads, Hamstrings, Glutes)\n🧘 Thu: Active Recovery / Yoga\n🔥 Fri: Full Body HIIT\n📅 Sat-Sun: Rest or light cardio\n\nShall I detail any specific day?";
  }
  if (query.includes('muscle') || query.includes('bulk') || query.includes('gain')) {
    return "Muscle building essentials:\n• Calorie surplus of 200-400 kcal/day\n• Protein: 2g per kg bodyweight\n• Progressive overload each week\n• Compound movements: Squat, Bench, Deadlift\n• 48hr recovery per muscle group\nWant a hypertrophy program? 💪";
  }
  if (query.includes('water') || query.includes('hydrat')) {
    return "Hydration protocol:\n💧 Aim for 2.5-3L daily\n💧 500ml upon waking\n💧 250ml before each meal\n💧 500ml during workouts\n💧 Electrolytes for intense sessions\n\nYou can track water in the app! Tap the HYDRATE button on your dashboard.";
  }
  if (query.includes('sleep') || query.includes('rest') || query.includes('recovery')) {
    return "Recovery is where gains happen:\n😴 7-9 hours of sleep\n🧊 Cold shower post-workout\n🧘 10 min stretching daily\n📵 No screens 1hr before bed\n🫐 Tart cherry juice for recovery\n\nPoor sleep = 30% less muscle growth. Prioritize rest!";
  }
  if (query.includes('motivation') || query.includes('tired') || query.includes('lazy')) {
    return "Listen — motivation is temporary, but discipline is permanent. 🔥\n\nRemember:\n• You're already ahead of everyone on the couch\n• Progress > Perfection\n• 1% better every day = 37x better in a year\n\nNow get up and crush it! Your future self will thank you. 💪";
  }
  if (query.includes('stretch') || query.includes('warm') || query.includes('cool')) {
    return "Pre-workout warmup (5 min):\n🔄 Arm circles × 20\n🦵 Leg swings × 15 each\n🏃 High knees × 30sec\n🧎 Bodyweight squats × 10\n\nPost-workout cooldown:\n🧘 Hamstring stretch 30s\n🙆 Shoulder stretch 30s\n🦶 Calf stretch 30s each";
  }
  if (query.includes('hello') || query.includes('hey') || query.includes('hi') || query.includes('sup')) {
    return "Hey there, champion! 🏆 I'm your LvlUp AI Coach — your personal fitness brain.\n\nI can help with:\n• Custom workout plans\n• Diet & nutrition advice\n• Recovery strategies\n• Motivation boosts\n\nWhat's on your mind today?";
  }
  if (query.includes('thank')) {
    return "You're welcome! That's what I'm here for. Keep pushing — consistency is your superpower. 💪🔥\n\nAnything else I can help with?";
  }

  return "Great question! 🤔 I'd love to help with that. Here are some things I specialize in:\n\n• 🏋️ Workout programming\n• 🥗 Nutrition & meal planning\n• 💧 Hydration tracking\n• 😴 Recovery optimization\n• 🔥 Motivation & mindset\n\nTry asking me something specific!";
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: "Hey! 👋 I'm your LvlUp AI Coach. I'm here to help you crush workouts, eat smarter, and level up your fitness. Ask me anything!",
          timestamp: Date.now(),
        },
      ],
      isTyping: false,
      isOpen: false,
      toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      addMessage: (content, role) => {
        const newMessage: Message = {
          id: Math.random().toString(36).substring(7),
          role,
          content,
          timestamp: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },
      clearChat: () => {
        set({
          messages: [{
            id: 'initial',
            role: 'assistant',
            content: "Chat cleared! 🔄 I'm still here — what can I help you with?",
            timestamp: Date.now(),
          }]
        });
      },
      simulateResponse: (userMessage) => {
        set({ isTyping: true });
        setTimeout(() => {
          const botResponse = getBotResponse(userMessage);
          const newMessage: Message = {
            id: Math.random().toString(36).substring(7),
            role: 'assistant',
            content: botResponse,
            timestamp: Date.now(),
          };
          set((state) => ({
            messages: [...state.messages, newMessage],
            isTyping: false
          }));
        }, 1200 + Math.random() * 800);
      },
    }),
    {
      name: 'lvlup-chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
