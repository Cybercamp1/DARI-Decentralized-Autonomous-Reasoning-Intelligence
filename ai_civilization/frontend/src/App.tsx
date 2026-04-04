import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AgentStatus = 'EXECUTING' | 'NEEDS_HELP' | 'BLOCKED' | 'IDLE';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  task: string;
  integration: string; // SDK or API the agent is using
  position: { top: string; left: string }; 
}

export default function App() {
  const [agents, setAgents] = useState<Record<string, Agent>>({
    'evaluator': { id: 'evaluator', name: 'Evaluator Core', role: 'Risk', status: 'IDLE', task: 'Awaiting signal...', integration: 'Zerion API', position: { top: '48%', left: '26%' } },
    'researcher': { id: 'researcher', name: 'Deep Web Intel', role: 'Research', status: 'EXECUTING', task: 'Scraping supplier APIs...', integration: 'Allium Data Catalog', position: { top: '48%', left: '50%' } },
    'verifier': { id: 'verifier', name: 'Verifier Node', role: 'Compliance', status: 'IDLE', task: 'Standing by...', integration: 'Sui Move / CLI', position: { top: '48%', left: '74%' } },
    
    'strategist': { id: 'strategist', name: 'Global Strat', role: 'Strategy', status: 'EXECUTING', task: 'Monitoring Alpha...', integration: 'Myriad SDK', position: { top: '85%', left: '26%' } },
    'trader_001': { id: 'trader_001', name: 'Alpha Trader', role: 'Execution', status: 'EXECUTING', task: 'Connecting to Exchange WS...', integration: 'Uniblock RPC', position: { top: '85%', left: '50%' } },
    'dropship_001': { id: 'dropship_001', name: 'Logistics Net', role: 'Dropship', status: 'EXECUTING', task: 'Analyzing transit times...', integration: 'Ripple XRPL', position: { top: '85%', left: '74%' } }
  });

  const [currentTime, setCurrentTime] = useState('');
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Financial Tracking State
  const [traderPnL, setTraderPnL] = useState(0);
  const [dropshipperRevenue, setDropshipperRevenue] = useState(0);
  const [lastDropshipSale, setLastDropshipSale] = useState<{product: string, margin: number} | null>(null);
  const baseCapital = 25000;

  const chatEndRef = useRef<HTMLDivElement>(null);
  const cryptoPricesRef = useRef<Record<string, number>>({});

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

  // Real-time Binance WebSocket Integration for Alpha Trader & Finances
  useEffect(() => {
    addLog('SYSTEM', 'Initializing Real-Time Crypto Data Stream (Binance WS)...');
    
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
    const trackedSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const relevant = data.filter((t: any) => trackedSymbols.includes(t.s));
      
      if (relevant.length > 0) {
         const btcData = relevant.find((t:any) => t.s === 'BTCUSDT');
         if (btcData) {
            const price = parseFloat(btcData.c);
            const prevPrice = cryptoPricesRef.current['BTCUSDT'];
            cryptoPricesRef.current['BTCUSDT'] = price;

            // Agent Logic: Alpha Trader actively watching BTC
            if (prevPrice) {
               const diff = price - prevPrice;
               if (Math.abs(diff) > 2) { 
                  const direction = diff > 0 ? 'PUMPING ↑' : 'DUMPING ↓';
                  setAgents(prev => ({
                    ...prev,
                    'trader_001': { 
                      ...prev['trader_001'], 
                      task: `BTC ${direction}: $${price.toFixed(2)}`,
                      status: 'EXECUTING' 
                    }
                  }));

                  // If major drop, buy signal with simulated profit
                  if (diff < -5) {
                    addLog('Alpha Trader', `🚨 REAL-TIME SIGNAL: BTC aggressively dropping to $${price.toFixed(2)}. Suggesting BUY (Buy-the-dip).`);
                    setAgents(prev => ({ ...prev, 'strategist': { ...prev['strategist'], task: `Evaluating BTC Buy @ $${price.toFixed(0)}` }}));
                    
                    setTimeout(() => {
                      const profit = parseFloat(((Math.random() * 80) + 20).toFixed(2));
                      setTraderPnL(p => p + profit);
                      addLog('Global Strat', `Scalp trade resolved! Fast mean reversion captured +$${profit.toFixed(2)} gain.`);
                    }, 2500);

                  } else if (diff > 5) {
                    addLog('Alpha Trader', `🚀 REAL-TIME SIGNAL: BTC pumping to $${price.toFixed(2)}. Suggesting SELL (Taking profit).`);
                    setAgents(prev => ({ ...prev, 'strategist': { ...prev['strategist'], task: `Evaluating BTC Sell @ $${price.toFixed(0)}` }}));
                    
                    setTimeout(() => {
                      const profit = parseFloat(((Math.random() * 120) + 40).toFixed(2));
                      setTraderPnL(p => p + profit);
                      addLog('Global Strat', `Trend trade closed. Profit target hit realizing +$${profit.toFixed(2)} margin.`);
                    }, 2500);
                  }
               }
            } else {
               setAgents(prev => ({ ...prev, 'trader_001': { ...prev['trader_001'], task: `Tracking BTC: $${price.toFixed(2)}` }}));
            }
         }
      }
    };

    ws.onerror = () => {
      addLog('SYSTEM', 'Binance websocket connection error. Using heuristics.');
    };

    return () => ws.close();
  }, []);

  // Real-time operations for other agents
  useEffect(() => {
     const dropshipTasks = [
       "Scraping CJ Dropshipping...",
       "Analyzing AliExpress margins...",
       "Contacting supplier: Shenzhen-Tech",
       "Evaluating Shopify ad spend...",
       "Checking freight forwarder availability...",
       "Optimizing product listing SEO..."
     ];

     const intelTasks = [
       "Scanning TikTok viral trends...",
       "Analyzing rival dropshipping stores...",
       "Extracting metadata from Twitter...",
       "Verifying trademark compliance...",
       "Generating ad copy via OpenAI..."
     ];

     const logisticsInterval = setInterval(() => {
        const dropTask = dropshipTasks[Math.floor(Math.random() * dropshipTasks.length)];
        setAgents(prev => ({
          ...prev,
          'dropship_001': { ...prev['dropship_001'], task: dropTask }
        }));
        
        // Randomly simulate dropshipping conversion
        if (Math.random() > 0.6) {
           const saleObj = ['Smartwatch', 'LED Lights', 'Posture Corrector', 'Mini Humidifier', 'Neck Massager'][Math.floor(Math.random() * 5)];
           const profit = parseFloat(((Math.random() * 25) + 8).toFixed(2));
           setDropshipperRevenue(p => p + profit);
           setLastDropshipSale({ product: saleObj, margin: profit });
           addLog('Logistics Net', `Sale converted autonomously! Product: ${saleObj}. Net Margin: +$${profit.toFixed(2)}`);
        } else {
           if (Math.random() > 0.5) addLog('Logistics Net', `Operation update: ${dropTask}`);
        }
     }, 6000);

     const intelInterval = setInterval(() => {
        const rTask = intelTasks[Math.floor(Math.random() * intelTasks.length)];
        setAgents(prev => ({
          ...prev,
          'researcher': { ...prev['researcher'], task: rTask }
        }));
        if(Math.random() > 0.8) {
           addLog('Deep Web Intel', `Data retrieved: ${rTask}. Forwarding to Dropship nodes.`);
        }
     }, 5500);

     const verifierInterval = setInterval(() => {
        setAgents(prev => ({
          ...prev,
          'verifier': { ...prev['verifier'], task: 'Auditing chain integrity.', status: 'EXECUTING' },
          'evaluator': { ...prev['evaluator'], task: 'Evaluating portfolio delta.', status: 'EXECUTING' }
        }));
        setTimeout(() => {
          setAgents(prev => ({
            ...prev,
            'verifier': { ...prev['verifier'], task: 'Standing by...', status: 'IDLE' },
            'evaluator': { ...prev['evaluator'], task: 'Awaiting signal...', status: 'IDLE' }
          }));
        }, 2000);
     }, 8000);

     return () => {
       clearInterval(logisticsInterval);
       clearInterval(intelInterval);
       clearInterval(verifierInterval);
     };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    addLog('USER', `COMMAND TRIGGERED: ${inputMessage}`);
    setTimeout(() => addLog('SYSTEM', 'Override directive accepted. Routing to agents.'), 500);
    setInputMessage('');
  };

  const getStatusColorCls = (status: AgentStatus) => {
    switch (status) {
      case 'EXECUTING': return 'text-[#39ff14] border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]';
      case 'NEEDS_HELP': return 'text-[#ffcc00] border-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.5)]';
      case 'BLOCKED': return 'text-[#ff003c] border-[#ff003c] shadow-[0_0_10px_rgba(255,0,60,0.5)]';
      default: return 'text-[#00f3ff] border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)]';
    }
  };

  const totalEarned = traderPnL + dropshipperRevenue;
  const currentTreasury = baseCapital + totalEarned;

  return (
    <div className="h-screen w-full bg-[#05080a] text-white font-sans antialiased overflow-hidden flex p-4 lg:p-6 gap-6 justify-center items-center relative">
      
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
        <div className="absolute top-[4.5%] left-[9.5%] bg-[#081214] text-[#00f3ff] px-2 py-0.5 rounded font-mono font-bold tracking-widest text-[16px] shadow-[0_0_10px_rgba(0,243,255,0.4)] z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
             style={{ textShadow: '0 0 5px #00f3ff', border: '1px solid #00f3ff40', minWidth: '94px' }}>
          {currentTime}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay"></div>

        {Object.values(agents).map(agent => (
          <div 
            key={agent.id}
            className="absolute flex flex-col items-center z-20"
            style={{ left: agent.position.left, top: agent.position.top, transform: 'translate(-50%, -100%)' }}
          >
            <AnimatePresence>
              {agent.status === 'EXECUTING' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 bg-black/90 backdrop-blur-sm border-2 rounded p-2 z-30 min-w-[124px] max-w-[150px] text-center"
                  style={{ borderColor: getStatusColorCls(agent.status).split(' ')[1].replace('border-[', '').replace(']', '') }}
                >
                  <p className={`text-[10px] font-mono font-bold leading-tight ${getStatusColorCls(agent.status).split(' ')[0]}`}>
                    {agent.task}
                  </p>
                  <div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-t-[8px] border-l-transparent border-l-[8px] border-r-transparent border-r-[8px]"
                    style={{ borderTopColor: getStatusColorCls(agent.status).split(' ')[1].replace('border-[', '').replace(']', '') }}
                  ></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col items-center">
               {agent.status === 'EXECUTING' && (
                 <div className="absolute -top-4 w-2 h-2 rounded-full bg-[#39ff14] animate-ping shadow-[0_0_10px_#39ff14]"></div>
               )}
               <div className="w-8 h-8 bg-[#ffcc99] rounded-sm relative shadow-md overflow-hidden">
                 <div className="absolute inset-x-0 bottom-1/4 h-2 bg-black/10"></div>
                 <div className={`absolute top-2 inset-x-1 h-3 rounded-[2px] ${agent.status === 'EXECUTING' ? 'bg-[#00f3ff] shadow-[0_0_5px_#00f3ff]' : 'bg-gray-800'}`}></div>
               </div>
               <div className={`w-12 h-8 rounded-t-sm -mt-1 shadow-lg ${agent.status === 'EXECUTING' ? 'bg-[#00f3ff]' : 'bg-[#3b82f6]'}`}>
                 <div className="w-2 h-6 bg-white mx-auto absolute left-1/2 -translate-x-1/2 mt-1 rounded-b flex flex-col items-center pt-[1px]">
                   <div className={`w-1 h-1 rounded-full ${agent.status === 'EXECUTING' ? 'bg-[#39ff14]' : 'bg-red-500'}`}></div>
                 </div>
               </div>
            </div>

            <div className={`mt-1 bg-black/80 px-2 py-0.5 border-b-2 font-mono text-[9px] font-bold rounded shadow-lg uppercase flex flex-col items-center ${getStatusColorCls(agent.status).split(' ')[0]} ${getStatusColorCls(agent.status).split(' ')[1]}`}>
              <span>{agent.name}</span>
              <span className="text-[7px] text-gray-400 mt-[2px] pt-[2px] border-t border-gray-700/50 w-full text-center truncate tracking-wide">
                TOOL: {agent.integration}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Side Panel Chat & Financials */}
      <div className="w-[450px] h-[700px] shrink-0 bg-[#081214] border-2 border-[#00f3ff]/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.15)] flex flex-col z-50">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#00f3ff]/20 bg-[#00f3ff]/10 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <Terminal className="text-[#00f3ff] w-4 h-4" />
             <h2 className="text-[#00f3ff] text-xs font-bold font-mono tracking-widest uppercase">System Log</h2>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-[9px] text-[#39ff14] font-mono font-bold animate-pulse">● LIVE WS ACTIVE</span>
           </div>
        </div>

        {/* FINANCIAL DASHBOARD */}
        <div className="p-4 border-b border-[#00f3ff]/20 bg-black/80">
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
             <DollarSign className="w-3 h-3 text-[#39ff14]" /> Syndicate Treasury 
          </h3>
          
          <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-[10px] text-slate-400 font-mono">Live Capital:</p>
               <h1 className="text-2xl font-bold text-[#39ff14] font-mono">
                 ${currentTreasury.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </h1>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-slate-400 font-mono">Session Profit:</p>
               <h2 className={`text-lg font-bold font-mono ${totalEarned > 0 ? 'text-[#00f3ff]' : 'text-gray-500'}`}>
                 +${totalEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </h2>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {/* Alpha Trader Stat */}
             <div className="bg-[#030a0d] border border-[#00f3ff]/30 rounded p-2 flex flex-col justify-between">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-[9px] text-[#ffcc00] font-bold uppercase">Alpha Trader</span>
               </div>
               <p className="text-white font-mono text-sm border-t border-white/5 pt-1 mt-auto">
                 +${traderPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </p>
               <p className="text-[8px] text-gray-500 mt-1 uppercase">Total Scalped Margin</p>
             </div>
             
             {/* Logistics Net Stat */}
             <div className="bg-[#030a0d] border border-[#00f3ff]/30 rounded p-2 flex flex-col justify-between">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-[9px] text-orange-400 font-bold uppercase">Logistics Net</span>
               </div>
               <p className="text-white font-mono text-sm border-t border-white/5 pt-1">
                 +${dropshipperRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               </p>
               <div className="mt-1 flex flex-col gap-0.5 text-[8px] uppercase">
                 <span className="text-gray-500">Last Sale Margin:</span>
                 {lastDropshipSale ? (
                   <span className="text-[#39ff14]">
                     {lastDropshipSale.product} <b className="text-white ml-2">+${lastDropshipSale.margin.toFixed(2)}</b>
                   </span>
                 ) : (
                   <span className="text-gray-700">Awaiting Conversion...</span>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* LOG TERMINAL */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 font-mono text-[11px] custom-scrollbar bg-black/60">
          {chatLogs.map(log => {
             const isTrade = log.sender === 'Alpha Trader' || log.sender === 'Global Strat';
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
              placeholder="Enter manual override command..."
              className="w-full bg-[#030a0d] text-[#00f3ff] border border-[#00f3ff]/40 rounded px-3 py-2 outline-none focus:border-[#00f3ff] shadow-inner text-xs font-mono transition-colors"
            />
            <button type="submit" className="w-full py-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 border border-[#00f3ff] text-[#00f3ff] rounded flex items-center justify-center gap-2 font-bold font-mono text-xs uppercase transition-colors">
              Override Directive <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,243,255,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,243,255,0.5); }
      `}</style>
    </div>
  );
}
