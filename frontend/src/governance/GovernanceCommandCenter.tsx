import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

const GovernanceCommandCenter = () => {
  const proposals = [
    { id: 1, title: 'Upgrade Liquidity Engine v2', status: 'Active', votesFor: 1200, votesAgainst: 450, aiScore: 88 },
    { id: 2, title: 'Treasury Diversification (BTC)', status: 'Pending', votesFor: 0, votesAgainst: 0, aiScore: 92 },
    { id: 3, title: 'Emergency Security Patch', status: 'Executed', votesFor: 2500, votesAgainst: 10, aiScore: 99 },
  ];

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <motion.div 
          key={proposal.id}
          whileHover={{ scale: 1.01 }}
          className="p-4 border border-white/10 bg-white/5 relative group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--neon-cyan)]" />
              <h3 className="text-sm font-bold text-white/90">{proposal.title}</h3>
            </div>
            <div className={`px-2 py-0.5 text-[10px] ${
              proposal.status === 'Active' ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]' :
              proposal.status === 'Executed' ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]' :
              'bg-white/10 text-white/40'
            }`}>
              {proposal.status.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/40">
                <span>FOR: {proposal.votesFor}</span>
                <span>AGAINST: {proposal.votesAgainst}</span>
              </div>
              <div className="h-1 bg-white/5 flex">
                <div 
                  className="h-full bg-[var(--neon-cyan)]" 
                  style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst || 1)) * 100}%` }} 
                />
                <div 
                  className="h-full bg-[var(--warning-red)]" 
                  style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst || 1)) * 100}%` }} 
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-white/40">AI_SAFETY_SCORE:</span>
              <span className={`text-sm font-black ${
                proposal.aiScore > 90 ? 'text-[var(--terminal-green)]' : 'text-[var(--neon-cyan)]'
              }`}>{proposal.aiScore}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-1.5 bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/30 text-[10px] hover:bg-[var(--neon-cyan)]/20 transition-colors flex items-center justify-center gap-2">
              <CheckCircle className="w-3 h-3" /> VOTE_FOR
            </button>
            <button className="flex-1 py-1.5 bg-[var(--warning-red)]/10 border border-[var(--warning-red)]/30 text-[10px] hover:bg-[var(--warning-red)]/20 transition-colors flex items-center justify-center gap-2">
              <XCircle className="w-3 h-3" /> VOTE_AGAINST
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GovernanceCommandCenter;
