import { useState, useRef, useEffect } from 'react';
import { useDaoStore } from '../store';
import { Send, Bot, Shield, User, Zap, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GovernanceChat = () => {
  const { logs } = useDaoStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', content: 'SYSTEM_BOOT_COMPLETE. SECURE_CHANNEL_OPEN.' },
    { id: 2, role: 'ai', content: 'Greetings, Architect. I am the DariDAO Governance Orchestrator. How can I assist you with the civilization today?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, logs]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: `PROCESSED_REQUEST: "${input}". ANALYZING IMPACT WITH ALPHA_TRADER AND MASTERMIND... STANDBY.` 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/5 font-mono">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--neon-cyan)]/20 flex items-center justify-center border border-[var(--neon-cyan)]/40">
            <Bot className="w-4 h-4 text-[var(--neon-cyan)]" />
          </div>
          <div>
            <div className="text-xs font-black text-white/90 uppercase tracking-tighter">GOVERNANCE_ORCHESTRATOR</div>
            <div className="text-[8px] text-[var(--terminal-green)] animate-pulse">STATUS: NEURAL_LINK_ACTIVE</div>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="px-2 py-0.5 border border-white/10 text-[8px] text-white/40 uppercase">V5.0.1_ENCRYPTED</div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                  msg.role === 'ai' ? 'bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]' : 
                  msg.role === 'system' ? 'bg-white/5 text-white/20' : 'bg-white/10 text-white/60'
                }`}>
                  {msg.role === 'ai' ? <Zap className="w-3 h-3" /> : <User className="w-3 h-3" />}
                </div>
                <div className={`p-3 rounded-sm text-[11px] leading-relaxed ${
                  msg.role === 'user' ? 'bg-white/5 border border-white/10 text-white/80' : 
                  msg.role === 'system' ? 'text-white/20 italic' : 'bg-black/60 border border-[var(--neon-cyan)]/20 text-white/90'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Live Agent Stream in Chat */}
        <div className="pt-4 border-t border-white/5">
          <div className="text-[9px] text-white/20 mb-3 flex items-center gap-2">
            <Terminal className="w-3 h-3" /> LIVE_AGENT_STREAM
          </div>
          <div className="space-y-2">
            {logs.slice(0, 3).map((log) => (
              <div key={log.id} className="text-[10px] text-white/40 flex gap-2">
                <span className="text-[var(--neon-cyan)] shrink-0">[{log.type.split('_')[0].toUpperCase()}]</span>
                <span className="truncate opacity-60">{log.message.split(']')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-black/60 border-t border-white/5">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="EXECUTE GOVERNANCE COMMAND OR CONSULT AGENTS..."
            className="w-full bg-[#111] border border-white/10 p-3 pr-12 text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--neon-cyan)]/50 transition-colors"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/20 hover:text-[var(--neon-cyan)] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-4 text-[8px] text-white/20 uppercase tracking-widest">
           <span className="flex items-center gap-1"><Shield className="w-2 h-2" /> ENCRYPTION: AES-256</span>
           <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> LATENCY: 4MS</span>
        </div>
      </div>
    </div>
  );
};

export default GovernanceChat;
