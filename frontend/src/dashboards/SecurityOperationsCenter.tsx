import { ShieldAlert, Zap, Lock, Globe } from 'lucide-react';

const SecurityOperationsCenter = () => {
  const threats = [
    { id: 1, type: 'Flash Loan Attack', severity: 'Critical', source: 'Sector 4', status: 'Mitigated' },
    { id: 2, type: 'Anomaly Detected', severity: 'Low', source: 'Treasury Vault', status: 'Scanning' },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 border border-[var(--warning-red)]/30 bg-[var(--warning-red)]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-[var(--warning-red)] text-[8px] font-bold">LIVE_ALERT</div>
        <div className="flex items-center gap-3 mb-2 text-[var(--warning-red)]">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span className="font-black">THREAT_LEVEL: ELEVATED</span>
        </div>
        <div className="text-[10px] text-white/60">HERMES_SENTINEL IS CURRENTLY MONITORING 14 SUB-SYSTEMS</div>
      </div>

      <div className="space-y-2">
        {threats.map((threat) => (
          <div key={threat.id} className="p-3 border border-white/5 bg-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap className={`w-3 h-3 ${threat.severity === 'Critical' ? 'text-[var(--warning-red)]' : 'text-[var(--neon-cyan)]'}`} />
              <div>
                <div className="text-[10px] font-bold">{threat.type}</div>
                <div className="text-[8px] text-white/40">{threat.source}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-[10px] ${
                threat.status === 'Mitigated' ? 'text-[var(--terminal-green)]' : 'text-[var(--neon-pink)]'
              }`}>{threat.status.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 glass-panel border-white/5 flex flex-col items-center justify-center">
          <Lock className="w-4 h-4 text-white/40 mb-1" />
          <div className="text-[8px] text-white/40">VAULT_LOCK</div>
          <div className="text-[10px] text-[var(--terminal-green)]">SECURE</div>
        </div>
        <div className="p-3 glass-panel border-white/5 flex flex-col items-center justify-center">
          <Globe className="w-4 h-4 text-white/40 mb-1" />
          <div className="text-[8px] text-white/40">NODE_HEALTH</div>
          <div className="text-[10px] text-[var(--neon-cyan)]">99.8%</div>
        </div>
      </div>
    </div>
  );
};

export default SecurityOperationsCenter;
