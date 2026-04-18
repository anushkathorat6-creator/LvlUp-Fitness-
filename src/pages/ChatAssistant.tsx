import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { useChatStore, Message } from '@/stores/chatStore';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';

const ChatAssistant = () => {
  const navigate = useNavigate();
  const { messages, addMessage, simulateResponse, isTyping, clearChat } = useChatStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What should I eat?",
    "Suggest a workout",
    "How to track progress?",
    "Tips for recovery",
  ];

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isBot = message.role === 'assistant';
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6`}
      >
        <div className={`flex max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end gap-3`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isBot ? 'bg-gradient-neon border border-neon-green/50' : 'bg-white/10 border border-white/20'}`}>
            {isBot ? <Bot className="w-4 h-4 text-black" /> : <User className="w-4 h-4 text-white" />}
          </div>
          <div className={`px-5 py-4 rounded-[1.5rem] shadow-xl backdrop-blur-xl border ${
            isBot 
              ? 'bg-black/60 border-white/10 rounded-bl-none text-white' 
              : 'bg-neon-blue/10 border-neon-blue/20 rounded-br-none text-white'
          }`}>
            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
            <p className="text-[9px] font-black text-white/30 uppercase mt-2 tracking-widest">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col pt-6 pb-28 md:pb-8">
        {/* Header */}
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
                LVLUP AI <Sparkles className="w-5 h-5 text-neon-green fill-neon-green/20" />
              </h1>
              <p className="text-[9px] font-black text-neon-green/50 uppercase tracking-[0.3em]">Elite Performance Assistant</p>
            </div>
          </div>
          <button onClick={() => { if(confirm('Wipe chat terminal?')) clearChat(); }} className="p-3 text-white/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar mask-fade-top">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-neon flex items-center justify-center border border-neon-green/50">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-black/40 border border-white/5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Panel */}
        <div className="px-6 mt-4">
          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {suggestions.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { addMessage(s, 'user'); simulateResponse(s); }}
                  className="whitespace-nowrap px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black text-white/60 uppercase tracking-widest hover:border-neon-green hover:text-white transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3 text-neon-green" />
                  {s}
                </motion.button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="glass-strong rounded-[2rem] p-3 flex items-center gap-3 border-white/5 shadow-2xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="TALK TO AI COMMANDER..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-black text-white uppercase tracking-widest placeholder:text-white/20"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="w-12 h-12 rounded-2xl bg-gradient-neon flex items-center justify-center text-black shadow-lg shadow-neon-green/20"
            >
              <Send className="w-5 h-5 fill-black" />
            </motion.button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatAssistant;
