import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2, X, MessageCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

const suggestions = [
  "What should I eat?",
  "Suggest a workout",
  "How to lose weight?",
  "Tips for recovery",
  "How much water?",
  "Need motivation!",
];

const FloatingChatbot = () => {
  const { messages, addMessage, simulateResponse, isTyping, isOpen, toggleChat, closeChat, clearChat } = useChatStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    addMessage(msg, 'user');
    setInput('');
    simulateResponse(msg);
  };

  const handleSuggestion = (s: string) => {
    addMessage(s, 'user');
    simulateResponse(s);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-24 right-5 z-[200] w-16 h-16 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#00F0FF] flex items-center justify-center shadow-[0_8px_32px_rgba(204,255,0,0.4)] border-2 border-white/20"
          >
            <Bot className="w-7 h-7 text-black" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-neon-green/20"
            />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-black flex items-center justify-center">
              <span className="text-[8px] font-black text-white">!</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[400px] z-[200] h-[70vh] max-h-[600px] flex flex-col rounded-[2rem] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-white/10"
            style={{ background: 'rgba(8, 8, 14, 0.97)', backdropFilter: 'blur(40px)' }}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CCFF00] to-[#00F0FF] flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    LvlUp Coach <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                  </h3>
                  <p className="text-[9px] font-bold text-neon-green/60 uppercase tracking-[0.2em]">
                    {isTyping ? 'Thinking...' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearChat} className="p-2 text-white/20 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={closeChat} className="p-2 text-white/20 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex max-w-[85%] ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-[#CCFF00] to-[#00F0FF]'
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-black" /> : <User className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl border ${
                      msg.role === 'assistant'
                        ? 'bg-white/5 border-white/5 rounded-bl-sm'
                        : 'bg-neon-green/10 border-neon-green/20 rounded-br-sm'
                    }`}>
                      <p className="text-[13px] leading-relaxed text-white/90 whitespace-pre-line">{msg.content}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase mt-1.5 tracking-widest">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#CCFF00] to-[#00F0FF] flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="whitespace-nowrap px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider hover:border-neon-green/50 hover:text-white transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-4 border-t border-white/5 shrink-0">
              <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-1 border border-white/10 focus-within:border-neon-green/30 transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask your coach..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-white placeholder:text-white/20"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CCFF00] to-[#00F0FF] flex items-center justify-center text-black disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
