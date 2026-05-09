import React, { useEffect, useState } from 'react';
import { useDaoStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

/* ── 6 desk positions mapped to the image coordinates ── */
const DESKS = [
  { id: 'alpha-trader',      label: 'ALPHA TRADER',       role: 'Market Intel',    x: 21, y: 40, screenY: 34, color: '#00f3ff' },
  { id: 'mastermind',        label: 'MASTERMIND',         role: 'Strategist',      x: 46, y: 40, screenY: 34, color: '#ff00ff' },
  { id: 'hermes-sentinel',   label: 'HERMES SENTINEL',   role: 'Security',        x: 72, y: 40, screenY: 34, color: '#00ff41' },
  { id: 'treasury-architect', label: 'TREASURY ARCH',     role: 'Finance',         x: 21, y: 72, screenY: 66, color: '#ffaa00' },
  { id: 'community-nexus',   label: 'COMMUNITY NEXUS',   role: 'Communications',  x: 46, y: 72, screenY: 66, color: '#ff3366' },
  { id: 'logistics-pro',     label: 'LOGISTICS PRO',     role: 'Operations',      x: 72, y: 72, screenY: 66, color: '#9d00ff' },
];

/* ── Typing text lines per agent ── */
const AGENT_LINES: Record<string, string[]> = {
  'alpha-trader':       ['> Scanning BTC/USDT...', '> Bullish divergence found', '> Sentiment: 0.87', '> Executing strategy...'],
  'mastermind':         ['> Governance vote #42', '> Quorum: 67% reached', '> Proposal APPROVED', '> Updating policy...'],
  'hermes-sentinel':    ['> Scanning mempool...', '> 0 threats detected', '> Firewall: ACTIVE', '> Integrity: 99.9%'],
  'treasury-architect': ['> Rebalancing vault...', '> APY optimized: +1.2%', '> Reserves: $42.1M', '> Diversification: OK'],
  'community-nexus':    ['> Analyzing socials...', '> Growth: +5.2% weekly', '> Sentiment: Positive', '> Engagement: HIGH'],
  'logistics-pro':      ['> Task queue: 12 items', '> Efficiency: 94%', '> Resources allocated', '> Pipeline: OPTIMAL'],
};

const PixelOffice = () => {
  const { agents, logs } = useDaoStore();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full bg-[#0a0c10] overflow-hidden">
      {/* ── The Office Image ── */}
      <img
        src="/office_bg.png"
        alt="DariDAO Cyberpunk Office"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* ── Ambient glow overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10]/60 via-transparent to-transparent pointer-events-none" />

      {/* ── Agent desk overlays ── */}
      {DESKS.map((desk) => {
        const agent = agents.find(a => a.id === desk.id);
        const isSelected = selectedAgent === desk.id;
        return (
          <React.Fragment key={desk.id}>
            {/* Clickable agent zone */}
            <div
              className="absolute cursor-pointer group"
              style={{ left: `${desk.x}%`, top: `${desk.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelectedAgent(isSelected ? null : desk.id)}
            >
              {/* Pixel Agent Character */}
              <PixelAgent color={desk.color} isActive={!!agent} />

              {/* Name tag below agent */}
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold tracking-wider px-1.5 py-0.5 border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ color: desk.color, borderColor: desk.color + '60', backgroundColor: '#000000cc' }}
              >
                {desk.label}
              </div>
            </div>

            {/* Screen glow on the monitor */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${desk.x}%`,
                top: `${desk.screenY}%`,
                transform: 'translate(-50%, -50%)',
                width: 38,
                height: 26,
              }}
            >
              <TerminalScreen agentId={desk.id} color={desk.color} />
            </div>

            {/* Expanded info panel on click */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute z-30 w-52"
                  style={{
                    left: `${desk.x}%`,
                    top: `${desk.y - 18}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <AgentInfoCard desk={desk} logs={logs} onClose={() => setSelectedAgent(null)} />
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        );
      })}

      {/* ── Top-left HUD ── */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
        <div className="bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-[9px] text-white/50 font-mono tracking-wider">
          <span className="text-[var(--neon-cyan)]">DARIDAO</span> // SECTOR_OFFICE
        </div>
        <div className="bg-black/70 backdrop-blur-sm border border-[var(--terminal-green)]/30 px-2 py-1.5 text-[9px] text-[var(--terminal-green)] font-mono animate-pulse">
          ● LIVE
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm border-t border-white/5 px-4 py-1.5 flex justify-between items-center z-20">
        <div className="flex gap-6 text-[8px] text-white/30 font-mono tracking-widest">
          <span>AGENTS: <span className="text-[var(--neon-cyan)]">{agents.length}/6</span></span>
          <span>BLOCK: 19842042</span>
          <span>LATENCY: 4ms</span>
        </div>
        <div className="text-[8px] text-white/20 font-mono">
          CLICK AN AGENT TO INSPECT
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Pixel Art Agent Character (Pure CSS)
   ═══════════════════════════════════════════════════ */
const PixelAgent = ({ color, isActive }: { color: string, isActive: boolean }) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Head */}
      <motion.div
        animate={{ y: [0, -1, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="flex flex-col items-center"
      >
        {/* Hair / top */}
        <div className="w-[10px] h-[3px] rounded-t-sm" style={{ backgroundColor: color + '80' }} />
        {/* Face */}
        <div className="w-[12px] h-[8px] bg-[#d4a574] rounded-sm relative">
          {/* Eyes */}
          <div className="absolute top-[2px] left-[2px] w-[2px] h-[2px] bg-[#222]" />
          <div className="absolute top-[2px] right-[2px] w-[2px] h-[2px] bg-[#222]" />
        </div>
        {/* Body / Jacket */}
        <div className="w-[14px] h-[10px] rounded-b-sm" style={{ backgroundColor: color + '90' }}>
          {/* Screen glow reflection on body */}
          <div className="w-full h-full bg-gradient-to-b from-white/10 to-transparent rounded-b-sm" />
        </div>
        {/* Arms reaching to desk */}
        <div className="flex gap-[8px] -mt-[2px]">
          <div className="w-[3px] h-[5px] rounded-b-sm" style={{ backgroundColor: color + '70' }} />
          <div className="w-[3px] h-[5px] rounded-b-sm" style={{ backgroundColor: color + '70' }} />
        </div>
      </motion.div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Terminal Screen (typing animation)
   ═══════════════════════════════════════════════════ */
const TerminalScreen = ({ agentId, color }: { agentId: string, color: string }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const lines = AGENT_LINES[agentId] || ['> ...'];

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex(prev => (prev + 1) % lines.length);
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [lines.length]);

  return (
    <div
      className="w-full h-full overflow-hidden flex items-end p-[2px] mix-blend-screen"
      style={{ textShadow: `0 0 4px ${color}` }}
    >
      <div className="text-[4px] leading-[5px] font-mono truncate" style={{ color }}>
        {lines[lineIndex]}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Agent Info Card (popup on click)
   ═══════════════════════════════════════════════════ */
const AgentInfoCard = ({ desk, logs, onClose }: { desk: typeof DESKS[0], logs: any[], onClose: () => void }) => {
  const agentLogs = logs.filter(l => l.message.includes(desk.label.split(' ')[0])).slice(0, 3);

  return (
    <div className="bg-[#0c0e14]/95 backdrop-blur-md border rounded-sm overflow-hidden" style={{ borderColor: desk.color + '40' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: desk.color + '20' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: desk.color }} />
          <span className="text-[9px] font-bold tracking-wider" style={{ color: desk.color }}>{desk.label}</span>
        </div>
        <button onClick={onClose} className="text-[9px] text-white/30 hover:text-white/80 transition-colors">✕</button>
      </div>
      {/* Content */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="text-[8px] text-white/30 uppercase tracking-widest">{desk.role}</div>
        <div className="space-y-1">
          {AGENT_LINES[desk.id]?.map((line, i) => (
            <div key={i} className="text-[9px] text-white/60 font-mono">{line}</div>
          ))}
        </div>
        {agentLogs.length > 0 && (
          <div className="pt-1.5 mt-1.5 border-t border-white/5 space-y-1">
            <div className="text-[7px] text-white/20 uppercase">Recent Activity</div>
            {agentLogs.map((log) => (
              <div key={log.id} className="text-[8px] text-white/40 font-mono truncate">{log.message}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelOffice;
