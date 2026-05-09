import { eventBus, EventTypes } from './event-bus.js';
import { getProofsForDashboard } from './proof-system.js';
import { getGovernanceHistory } from './memory-store.js';

/**
 * Handle user terminal commands — each triggers REAL backend workflows
 */
export function handleCommand(command, socketio, daoState) {
  const cmd = command.trim().toLowerCase();

  if (cmd.startsWith('/create proposal')) {
    const desc = command.replace(/\/create proposal\s*/i, '').trim() || 'Community governance proposal';
    eventBus.publish(EventTypes.PROPOSAL_CREATED, {
      proposalId: Date.now() % 10000,
      description: desc,
      creator: '0xUSER_MANUAL',
      source: 'user_command',
      timestamp: new Date().toISOString(),
    });
    socketio.emit('system_log', { sender: 'SYSTEM', text: `Proposal created: "${desc}" — broadcasting to all agents.` });

  } else if (cmd.startsWith('/vote')) {
    const parts = cmd.split(/\s+/);
    const proposalId = parseInt(parts[1]?.replace(/[^0-9]/g, '') || '0');
    const support = parts[2] !== 'no';
    eventBus.publish(EventTypes.VOTE_CAST, {
      proposalId,
      voter: '0xUSER',
      support,
      weight: 100,
      source: 'user_command',
      timestamp: new Date().toISOString(),
    });
    socketio.emit('system_log', { sender: 'SYSTEM', text: `Vote cast: ${support ? 'YES' : 'NO'} on Proposal #${proposalId}` });

  } else if (cmd.startsWith('/check treasury')) {
    socketio.emit('system_log', { sender: 'Treasury Ops', text: `Treasury: $${daoState.treasury.toLocaleString(undefined, { minimumFractionDigits: 2 })}` });
    socketio.emit('system_log', { sender: 'Treasury Ops', text: `Runway: ~${Math.floor(daoState.treasury / 50000)} months at current burn.` });
    eventBus.publish(EventTypes.SYSTEM_HEARTBEAT, { source: 'user_command' });

  } else if (cmd.startsWith('/scan') || cmd.startsWith('/monitor security')) {
    socketio.emit('system_log', { sender: 'SYSTEM', text: 'Manual security scan initiated.' });
    eventBus.publish(EventTypes.SECURITY_ALERT, {
      type: 'manual_scan',
      threatLevel: 'unknown',
      description: 'User-initiated security scan',
      timestamp: new Date().toISOString(),
    });

  } else if (cmd.startsWith('/analyze')) {
    socketio.emit('system_log', { sender: 'SYSTEM', text: 'Governance risk analysis triggered.' });
    eventBus.publish(EventTypes.GOVERNANCE_ANOMALY, {
      type: 'manual_analysis',
      description: 'User-requested governance analysis',
      timestamp: new Date().toISOString(),
    });

  } else if (cmd.startsWith('/monitor whale')) {
    socketio.emit('system_log', { sender: 'SYSTEM', text: 'Whale monitoring scan started.' });
    eventBus.publish(EventTypes.WHALE_ACTIVITY, {
      wallet: '0x' + 'a'.repeat(40),
      action: 'scan_requested',
      amount: 0,
      token: 'DARI',
      timestamp: new Date().toISOString(),
    });

  } else if (cmd.startsWith('/execute proposal')) {
    const idStr = cmd.replace(/\/execute proposal\s*/i, '').trim();
    const proposalId = parseInt(idStr) || 0;
    eventBus.publish(EventTypes.PROPOSAL_EXECUTED, {
      proposalId,
      source: 'user_command',
      timestamp: new Date().toISOString(),
    });
    socketio.emit('system_log', { sender: 'SYSTEM', text: `Proposal #${proposalId} execution broadcasted.` });

  } else if (cmd.startsWith('/status')) {
    socketio.emit('system_log', { sender: 'SYSTEM', text: `Treasury: $${daoState.treasury.toLocaleString()}  |  Risk: ${daoState.riskScore}%  |  Proposals: ${daoState.activeProposals}` });

  } else if (cmd.startsWith('/proofs')) {
    const proofs = getProofsForDashboard(5);
    if (proofs.length === 0) {
      socketio.emit('system_log', { sender: 'SYSTEM', text: 'No task proofs recorded yet.' });
    } else {
      proofs.forEach(p => {
        socketio.emit('system_log', { sender: p.agent, text: `[${p.time}] ${p.task} — ${p.status} (${p.tx_hash})` });
      });
    }

  } else {
    socketio.emit('system_log', { sender: 'SYSTEM', text: `Command parsed. Available: /create proposal, /vote, /check treasury, /scan, /analyze, /monitor whales, /execute proposal, /status, /proofs` });
    eventBus.publish(EventTypes.USER_COMMAND, { command, raw: true });
  }
}

export default { handleCommand };
