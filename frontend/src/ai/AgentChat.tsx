import { useEffect, useRef } from 'react';
import { useDaoStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const AgentChat = () => {
  const { logs } = useDaoStore();
  const chatLogs = logs.filter(log => log.type === 'agent_insight');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLogs]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="flex items-center gap-2 mb-4 text-[var(--neon-cyan)]">
        <MessageSquare className="w-4 h-4" /> AGENT_COMM_CHANNEL
      </h2>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {chatLogs.map((log) => {
            const [agentName, ...messageParts] = log.message.split(']');
            const name = agentName.replace('[', '');
            const message = messageParts.join(']').trim();

            return (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-[var(--neon-cyan)]">{name}</span>
                  <span className="text-[8px] text-white/20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="p-2 bg-white/5 border-l border-[var(--neon-cyan)]/30 text-[10px] text-white/80 leading-relaxed group-hover:bg-white/10 transition-colors">
                  {message}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AgentChat;
