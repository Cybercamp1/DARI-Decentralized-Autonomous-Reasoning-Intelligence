import { useDaoStore } from '../store';
import { motion } from 'framer-motion';
import { User, Terminal as TerminalIcon } from 'lucide-react';

const HackerOffice = () => {
  const { agents, logs } = useDaoStore();

  return (
    <div className="relative w-full h-full bg-[#1a1a1a] overflow-hidden rounded-lg border-4 border-[#333]">
      {/* Background City Window */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-[url('https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 border-b-4 border-[#333]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
      </div>

      {/* Office Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#222] grid grid-cols-3 gap-8 p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
        
        {agents.map((agent) => (
          <Desk key={agent.id} agent={agent} lastLog={logs.find(l => l.message.includes(agent.name))} />
        ))}
      </div>

      {/* UI Overlays */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="bg-black/80 border-2 border-[var(--neon-cyan)] p-2 text-[10px] text-[var(--neon-cyan)] font-mono shadow-[4px_4px_0px_#000]">
          OFFICE_STATUS: ACTIVE
          <br />
          LOCAL_TIME: 11:34 PM
        </div>
      </div>
    </div>
  );
};

const Desk = ({ agent, lastLog }: { agent: any, lastLog: any }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative flex flex-col items-center"
    >
      {/* Computer Terminal */}
      <div className="w-48 h-36 bg-[#2a2a2a] border-4 border-[#444] rounded-t-lg shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col p-2 group hover:border-[var(--neon-cyan)] transition-colors cursor-pointer">
        <div className="flex-1 bg-[#0a0a0a] border-2 border-[#111] overflow-hidden p-1 font-mono text-[8px] leading-tight text-[var(--terminal-green)] relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--terminal-green)]/10 animate-scan" />
          <div className="mb-1 text-[var(--neon-cyan)] flex items-center gap-1">
            <TerminalIcon className="w-2 h-2" /> {agent.name.toUpperCase()}
          </div>
          <div className="opacity-80">
            {lastLog ? lastLog.message.split(']')[1] : '> WAITING FOR INPUT...'}
          </div>
          <div className="absolute bottom-1 right-1">
            <motion.div 
              animate={{ opacity: [0, 1] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-1 h-2 bg-[var(--terminal-green)]"
            />
          </div>
        </div>
        <div className="h-2 bg-[#444] mt-1 rounded-full mx-8" />
      </div>

      {/* Desk Base */}
      <div className="w-56 h-4 bg-[#3d2b1f] border-x-4 border-[#2d1b0f] shadow-[0_4px_0_#1a1a1a]" />
      
      {/* Chair (Simplified) */}
      <div className="mt-4 w-12 h-16 border-x-4 border-t-4 border-[#333] rounded-t-xl bg-[#222] relative">
         <User className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 text-[#444] opacity-20" />
      </div>
      
      {/* Label */}
      <div className="absolute -bottom-8 bg-black/80 px-2 py-0.5 border border-white/10 text-[8px] text-white/40">
        SECTOR_{agent.id.toUpperCase().slice(0, 3)}
      </div>
    </motion.div>
  );
};

export default HackerOffice;
