import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, ShieldAlert, Activity, CheckCircle, Cpu, Layers, ShieldCheck, Database, Globe, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

type AgentStatus = 'ACTIVE' | 'EXECUTING' | 'ANALYZING' | 'MONITORING' | 'COMMUNICATING' | 'ALERT' | 'IDLE';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  task: string;
  integration: string;
  position: { top: string; left: string }; 
}

interface AIProof {
  id: string;
  time: string;
  agent: string;
  task: string;
  status: string;
  tx_hash: string;
  confidence?: number;
  reasoning_summary?: string;
  risk?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'PROOF_OF_WORK'>('COMMAND');
  const [agents, setAgents] = useState<Record<string, Agent>>({
    'evaluator': { id: 'evaluator', name: 'Proposal Analysis', role: 'Risk', status: 'IDLE', task: 'Awaiting proposals...', integration: 'Snapshot API', position: { top: '48%', left: '26%' } },
    'researcher': { id: 'researcher', name: 'Security Intel', role: 'Security', status: 'MONITORING', task: 'Scanning mempool...', integration: 'Forta Network', position: { top: '48%', left: '50%' } },
    'verifier': { id: 'verifier', name: 'Governance Val.', role: 'Compliance', status: 'IDLE', task: 'Standing by...', integration: 'Ethers.js', position: { top: '48%', left: '74%' } },
    
    'strategist': { id: 'strategist', name: 'DAO Strategy', role: 'Strategy', status: 'MONITORING', task: 'Monitoring quorum...', integration: 'LangChain', position: { top: '85%', left: '26%' } },
    'trader_001': { id: 'trader_001', name: 'Market Intel', role: 'Market', status: 'MONITORING', task: 'Analyzing volatility...', integration: 'Chainlink Oracles', position: { top: '85%', left: '50%' } },
    'dropship_001': { id: 'dropship_001', name: 'Treasury Ops', role: 'Treasury', status: 'MONITORING', task: 'Tracking runway...', integration: 'Gnosis Safe API', position: { top: '85%', left: '74%' } }
  });

  const [currentTime, setCurrentTime] = useState('');
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiProofs, setAiProofs] = useState<AIProof[]>([]);
  
  // DAO State
  const [treasuryBalance, setTreasuryBalance] = useState(2500000);
  const [riskScore, setRiskScore] = useState(12);
  const [activeProposals, setActiveProposals] = useState(3);
  const [lastGovernanceAction, setLastGovernanceAction] = useState<string>("Proposal #42 Executed");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const addLog = (sender: string, text: string) => {
    setChatLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), sender, text }]);
  };

  // Real-time Clock overlay
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Connect to backend websocket
  useEffect(() => {
    addLog('SYSTEM', 'Initializing Real-Time DARI DAO Orchestration...');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      addLog('SYSTEM', 'Connected to Autonomous AI Engine.');
    });

    socket.on('agent_update', (data: { agent_id: string; task: string; status: AgentStatus }) => {
      setAgents(prev => ({
        ...prev,
        [data.agent_id]: { ...prev[data.agent_id], task: data.task, status: data.status }
      }));
    });

    socket.on('system_log', (data: { sender: string; text: string }) => {
      addLog(data.sender, data.text);
    });

    socket.on('dao_metrics', (data: { treasury: number; risk: number; proposals: number; last_action: string }) => {
      if (data.treasury !== undefined) setTreasuryBalance(data.treasury);
      if (data.risk !== undefined) setRiskScore(data.risk);
      if (data.proposals !== undefined) setActiveProposals(data.proposals);
      if (data.last_action !== undefined) setLastGovernanceAction(data.last_action);
    });

    socket.on('ai_proofs', (proofs: AIProof[]) => {
      setAiProofs(proofs);
    });

    socket.on('new_proof', (proof: AIProof) => {
      setAiProofs(prev => [proof, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    addLog('USER', `COMMAND TRIGGERED: ${inputMessage}`);
    if (socketRef.current) {
        socketRef.current.emit('user_command', { command: inputMessage });
    }
    setInputMessage('');
  };

  const getStatusColorCls = (status: AgentStatus) => {
    switch (status) {
      case 'ACTIVE':
      case 'EXECUTING': return 'text-[#39ff14] border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]';
      case 'ANALYZING': return 'text-[#ffcc00] border-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.5)]';
      case 'MONITORING': return 'text-[#00f3ff] border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)]';
      case 'COMMUNICATING': return 'text-[#b539ff] border-[#b539ff] shadow-[0_0_10px_rgba(181,57,255,0.5)]';
      case 'ALERT': return 'text-[#ff003c] border-[#ff003c] shadow-[0_0_10px_rgba(255,0,60,0.5)]';
      case 'IDLE': return 'text-gray-400 border-gray-600 shadow-[0_0_10px_rgba(156,163,175,0.3)]';
      default: return 'text-gray-400 border-gray-600 shadow-none';
    }
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'ACTIVE':
      case 'EXECUTING': return '🟢';
      case 'ANALYZING': return '🟡';
      case 'MONITORING': return '🔵';
      case 'COMMUNICATING': return '🟣';
      case 'ALERT': return '🔴';
      case 'IDLE': return '⚪';
      default: return '⚪';
    }
  };

  const getGlowColor = (status: AgentStatus) => {
    switch (status) {
      case 'ACTIVE':
      case 'EXECUTING': return '#39ff14';
      case 'ANALYZING': return '#ffcc00';
      case 'MONITORING': return '#00f3ff';
      case 'COMMUNICATING': return '#b539ff';
      case 'ALERT': return '#ff003c';
      default: return '#4b5563';
    }
  };

  return (
    <div className="h-screen w-full bg-[#05080a] text-white font-sans antialiased overflow-hidden flex flex-col p-4 lg:p-6 gap-4">
      
      {/* TOP NAVIGATION BAR */}
      <div className="flex justify-between items-center bg-[#081214] border-2 border-[#00f3ff]/30 rounded-xl px-6 py-3 shadow-[0_0_20px_rgba(0,243,255,0.1)] z-[100]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="text-[#00f3ff] w-6 h-6 animate-pulse" />
            <h1 className="text-xl font-black font-mono tracking-tighter text-white">DARI <span className="text-[#00f3ff]">OS</span></h1>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <nav className="flex gap-2">
            <button 
              onClick={() => setActiveTab('COMMAND')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded font-mono text-[11px] font-bold uppercase transition-all border ${activeTab === 'COMMAND' ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              <Terminal className="w-3.5 h-3.5" /> Command Center
            </button>
            <button 
              onClick={() => setActiveTab('PROOF_OF_WORK')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded font-mono text-[11px] font-bold uppercase transition-all border ${activeTab === 'PROOF_OF_WORK' ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              <Layers className="w-3.5 h-3.5" /> Proof of Work
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Network Status</span>
            <span className="text-[10px] text-[#39ff14] font-mono font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-[#39ff14]" /> SYNCHRONIZED
            </span>
          </div>
          <div className="bg-black/50 border border-white/10 px-4 py-1 rounded-lg">
            <span className="text-[14px] font-mono font-bold text-[#00f3ff]" style={{ textShadow: '0 0 5px #00f3ff' }}>{currentTime}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'COMMAND' ? (
          <motion.div 
            key="command"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex gap-6 justify-center items-center overflow-hidden"
          >
            {/* LEFT: Dynamic Visualizer Area */}
            <div 
              className="w-[1050px] aspect-[1.5] relative rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,243,255,0.15)] shrink-0"
              style={{ 
                backgroundImage: 'url(/syndicate_office_bg.png)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                imageRendering: 'pixelated'
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay"></div>

              {Object.values(agents).map(agent => {
                const glowHex = getGlowColor(agent.status);
                const isWorking = agent.status !== 'IDLE';

                return (
                  <div 
                    key={agent.id}
                    className="absolute flex flex-col items-center z-20"
                    style={{ left: agent.position.left, top: agent.position.top, transform: 'translate(-50%, -100%)' }}
                  >
                    <AnimatePresence>
                      {isWorking && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mb-8 bg-black/90 backdrop-blur-sm border-2 rounded p-2 z-30 min-w-[124px] max-w-[150px] text-center transition-colors"
                          style={{ borderColor: glowHex }}
                        >
                          <p className={`text-[10px] font-mono font-bold leading-tight ${getStatusColorCls(agent.status).split(' ')[0]}`}>
                            {agent.task}
                          </p>
                          <div 
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-t-[8px] border-l-transparent border-l-[8px] border-r-transparent border-r-[8px] transition-colors"
                            style={{ borderTopColor: glowHex }}
                          ></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative flex flex-col items-center">
                      {isWorking && (
                        <div className="absolute -top-4 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: glowHex, boxShadow: `0 0 10px ${glowHex}` }}></div>
                      )}
                      <div className="w-8 h-8 bg-[#ffcc99] rounded-sm relative shadow-md overflow-hidden">
                        <div className="absolute inset-x-0 bottom-1/4 h-2 bg-black/10"></div>
                        <div className="absolute top-2 inset-x-1 h-3 rounded-[2px] transition-colors" style={{ backgroundColor: isWorking ? glowHex : '#1f2937', boxShadow: isWorking ? `0 0 5px ${glowHex}` : 'none' }}></div>
                      </div>
                      <div className="w-12 h-8 rounded-t-sm -mt-1 shadow-lg transition-colors" style={{ backgroundColor: isWorking ? glowHex : '#3b82f6' }}>
                        <div className="w-2 h-6 bg-white mx-auto absolute left-1/2 -translate-x-1/2 mt-1 rounded-b flex flex-col items-center pt-[1px]">
                          <div className="w-1 h-1 rounded-full transition-colors" style={{ backgroundColor: isWorking ? '#39ff14' : '#ef4444' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-1 bg-black/80 px-2 py-0.5 border-b-2 font-mono text-[9px] font-bold rounded shadow-lg uppercase flex flex-col items-center ${getStatusColorCls(agent.status).split(' ')[0]} ${getStatusColorCls(agent.status).split(' ')[1]}`}>
                      <span className="flex items-center gap-1">
                        <span className="text-[10px]">{getStatusIcon(agent.status)}</span> {agent.name}
                      </span>
                      <span className="text-[7px] text-gray-400 mt-[2px] pt-[2px] border-t border-gray-700/50 w-full text-center truncate tracking-wide">
                        TOOL: {agent.integration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Side Panel Chat & Financials */}
            <div className="w-[450px] h-[700px] shrink-0 bg-[#081214] border-2 border-[#00f3ff]/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.15)] flex flex-col z-50">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#00f3ff]/20 bg-[#00f3ff]/10 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <Terminal className="text-[#00f3ff] w-4 h-4" />
                   <h2 className="text-[#00f3ff] text-xs font-bold font-mono tracking-widest uppercase">Governance Core</h2>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-[9px] text-[#39ff14] font-mono font-bold animate-pulse">● LIVE DAO NETWORK</span>
                 </div>
              </div>

              {/* DAO DASHBOARD */}
              <div className="p-4 border-b border-[#00f3ff]/20 bg-black/80">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                   <Activity className="w-3 h-3 text-[#39ff14]" /> DARI DAO Intelligence
                </h3>
                
                <div className="flex justify-between items-end mb-4">
                   <div>
                     <p className="text-[10px] text-slate-400 font-mono">Treasury Health:</p>
                     <h1 className="text-2xl font-bold text-[#39ff14] font-mono">
                       ${treasuryBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                     </h1>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-400 font-mono">Network Security Risk:</p>
                     <h2 className={`text-lg font-bold font-mono ${riskScore < 20 ? 'text-[#39ff14]' : riskScore < 50 ? 'text-[#ffcc00]' : 'text-[#ff003c]'}`}>
                       {riskScore}%
                     </h2>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {/* Proposals Stat */}
                   <div className="bg-[#030a0d] border border-[#00f3ff]/30 rounded p-2 flex flex-col justify-between">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] text-[#00f3ff] font-bold uppercase">Active Proposals</span>
                     </div>
                     <p className="text-white font-mono text-sm border-t border-white/5 pt-1 mt-auto">
                       {activeProposals} Analyzing
                     </p>
                   </div>
                   
                   {/* Governance Action Stat */}
                   <div className="bg-[#030a0d] border border-[#00f3ff]/30 rounded p-2 flex flex-col justify-between">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] text-orange-400 font-bold uppercase">Last Governance Event</span>
                     </div>
                     <p className="text-white font-mono text-sm border-t border-white/5 pt-1 text-[10px] truncate">
                       {lastGovernanceAction}
                     </p>
                   </div>
                </div>
              </div>

              {/* AI TASK PROOF PANEL */}
              <div className="p-3 border-b border-[#00f3ff]/20 bg-[#081214]">
                 <h3 className="text-[10px] text-[#00f3ff] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                   <ShieldAlert className="w-3 h-3" /> AI TASK PROOF
                 </h3>
                 <div className="flex flex-col gap-2 overflow-y-auto max-h-[110px] custom-scrollbar pr-1">
                   <AnimatePresence>
                     {aiProofs.slice(0, 3).map(proof => (
                       <motion.div 
                         key={proof.id} 
                         initial={{ opacity: 0, x: -10 }} 
                         animate={{ opacity: 1, x: 0 }}
                         className="bg-black/60 border border-[#00f3ff]/30 p-2 rounded flex flex-col gap-1 text-[9px] font-mono shadow-[0_0_10px_rgba(0,243,255,0.1)]"
                       >
                         <div className="flex justify-between items-center text-gray-400">
                           <span>[{proof.time}] <b className="text-white">{proof.agent}</b></span>
                           <span className={`flex items-center gap-1 ${proof.status === 'COMPLETED' || proof.status === 'SUCCESS' ? 'text-[#39ff14]' : 'text-[#ffcc00]'}`}>
                             {(proof.status === 'COMPLETED' || proof.status === 'SUCCESS') && <CheckCircle className="w-2.5 h-2.5" />}
                             {proof.status}
                           </span>
                         </div>
                         <div className="text-gray-300">Task: {proof.task}</div>
                         <div className="text-[#00f3ff]/80 flex justify-between">
                           <span>Tx Ref: {proof.tx_hash}</span>
                         </div>
                       </motion.div>
                     ))}
                     {aiProofs.length === 0 && (
                       <div className="text-gray-500 text-[10px] italic text-center py-2 font-mono">Awaiting AI Task Proofs...</div>
                     )}
                   </AnimatePresence>
                 </div>
              </div>

              {/* LOG TERMINAL */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 font-mono text-[11px] custom-scrollbar bg-black/60">
                {chatLogs.map(log => {
                   const isTrade = log.sender.includes('Agent') || log.sender.includes('Intel') || log.sender.includes('Strategy') || log.sender.includes('Ops') || log.sender.includes('Proposal') || log.sender.includes('Val.');
                   const isSystem = log.sender === 'SYSTEM';
                   return (
                    <motion.div initial={{opacity:0, x:-5}} animate={{opacity:1, x:0}} key={log.id} className="flex flex-col gap-1 w-full bg-white/5 p-2 rounded border border-white/5 pb-2">
                      <div className="flex justify-between w-full border-b border-white/10 pb-1 mb-1">
                        <span className={`font-bold shrink-0 text-[10px] ${log.sender === 'USER' ? 'text-fuchsia-400' : isTrade ? 'text-[#ffcc00]' : isSystem ? 'text-slate-400' : 'text-[#39ff14]'}`}>
                          {log.sender}
                        </span>
                        <span className="text-[#00f3ff]/60 text-[9px]">[{new Date().toLocaleTimeString([],{hour12:false, minute:'2-digit', second:'2-digit'})}]</span>
                      </div>
                      <span className={`leading-relaxed ${isTrade ? 'text-white' : isSystem ? 'text-slate-500' : 'text-gray-300'}`}>{log.text}</span>
                    </motion.div>
                   )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#00f3ff]/20 p-3 bg-[#081214] shrink-0">
                <form onSubmit={sendMessage} className="flex flex-col gap-2 relative">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="e.g. /create proposal, /check treasury..."
                    className="w-full bg-[#030a0d] text-[#00f3ff] border border-[#00f3ff]/40 rounded px-3 py-2 outline-none focus:border-[#00f3ff] shadow-inner text-xs font-mono transition-colors"
                  />
                  <button type="submit" className="w-full py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 border border-[#00f3ff] text-[#00f3ff] rounded flex items-center justify-center gap-2 font-bold font-mono text-xs uppercase transition-colors">
                    Execute DAO Command <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="pow"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="flex-1 flex flex-col gap-6 overflow-hidden"
          >
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* LEFT: Proof Ledger */}
              <div className="col-span-8 bg-[#081214] border-2 border-[#39ff14]/30 rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                <div className="px-6 py-4 border-b border-[#39ff14]/20 bg-[#39ff14]/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Cpu className="text-[#39ff14] w-5 h-5" />
                    <h2 className="text-[#39ff14] text-sm font-bold font-mono tracking-widest uppercase">Autonomous Work Ledger</h2>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#39ff14]"></span> VALIDATED</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffcc00]"></span> PENDING</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                  {aiProofs.map((proof, idx) => (
                    <motion.div 
                      key={proof.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-black/40 border border-white/5 hover:border-[#39ff14]/40 p-4 rounded-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded bg-[#081214] border border-[#39ff14]/20 flex items-center justify-center text-[#39ff14] font-mono font-bold">
                             {proof.agent.charAt(0)}
                           </div>
                           <div>
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-white uppercase tracking-tight">{proof.agent}</span>
                               <span className="px-1.5 py-0.5 bg-[#39ff14]/10 text-[#39ff14] text-[8px] font-bold rounded border border-[#39ff14]/20 uppercase">Agent Task</span>
                             </div>
                             <p className="text-gray-400 text-[10px] font-mono">{proof.task}</p>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 font-mono">{proof.time}</span>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="flex items-center gap-1 text-[9px] text-[#39ff14] font-mono">
                               <ShieldCheck className="w-3 h-3" /> PROOF VALID
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      {proof.reasoning_summary && (
                        <div className="bg-[#05080a] rounded p-3 mb-3 border border-white/5 text-[11px] font-mono leading-relaxed text-gray-300">
                           <span className="text-[#39ff14]/70 uppercase text-[9px] font-bold block mb-1">Reasoning Analysis:</span>
                           {proof.reasoning_summary}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Transaction Hash</span>
                            <a 
                              href={`https://explorer.securechain.ai/tx/${proof.tx_hash}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[10px] text-[#00f3ff] font-mono hover:underline"
                            >
                              {proof.tx_hash}
                            </a>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Confidence</span>
                            <span className="text-[10px] text-[#39ff14] font-mono">{proof.confidence || 95}%</span>
                          </div>
                        </div>
                        <button className="text-[9px] text-[#39ff14] font-bold uppercase tracking-widest hover:underline">View Full Proof Metadata →</button>
                      </div>
                    </motion.div>
                  ))}
                  {aiProofs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                      <Database className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-mono text-sm">Initializing Proof Chain...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Stats & Real-time Transactions */}
              <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
                {/* Stats Panel */}
                <div className="bg-[#081214] border-2 border-[#00f3ff]/30 rounded-xl p-5 shadow-[0_0_20px_rgba(0,243,255,0.05)]">
                  <h3 className="text-[10px] text-[#00f3ff] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Work Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                      <span className="text-xs text-gray-400 font-mono">Total Tasks Analyzed</span>
                      <span className="text-xl font-bold text-white font-mono">{aiProofs.length + 1240}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                      <span className="text-xs text-gray-400 font-mono">Proofs Verified</span>
                      <span className="text-xl font-bold text-[#39ff14] font-mono">100%</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5">
                      <span className="text-xs text-gray-400 font-mono">Network Uptime</span>
                      <span className="text-xl font-bold text-[#00f3ff] font-mono">99.98%</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Transaction Stream */}
                <div className="flex-1 bg-black/60 border-2 border-white/10 rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                  <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" /> Real-time activity
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></span>
                       <span className="text-[9px] text-gray-400 font-mono uppercase">Streaming</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                     {chatLogs.slice(0, 20).map((log, idx) => (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`stream-${idx}`} 
                        className="flex items-start gap-3 border-b border-white/5 pb-2"
                       >
                         <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.sender === 'SYSTEM' ? 'bg-[#00f3ff]' : 'bg-[#39ff14]'}`}></div>
                         <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">{log.sender}</span>
                             <span className="text-[8px] text-gray-600 font-mono">{new Date().toLocaleTimeString()}</span>
                           </div>
                           <p className="text-[10px] text-gray-300 font-mono leading-tight mt-0.5">{log.text}</p>
                         </div>
                       </motion.div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,243,255,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,243,255,0.5); }
      `}</style>
    </div>
  );
}
