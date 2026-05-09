// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Security Intelligence Agent
// Scans calldata, detects exploits, monitors suspicious wallets
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { BaseAgent } from './base-agent.js';
import { EventTypes } from '../engine/event-bus.js';

export class SecurityAgent extends BaseAgent {
  constructor(socketio, daoState) {
    super('researcher', 'Security Intel', 'Security', 'Forta Network', socketio, daoState);
    this.threatHistory = [];
    this.scanCount = 0;
  }

  getEventSubscriptions() {
    return [
      { eventType: EventTypes.PROPOSAL_CREATED, handler: this.onProposalCreated },
      { eventType: EventTypes.WHALE_ACTIVITY, handler: this.onWhaleActivity },
      { eventType: EventTypes.AGENT_ANALYSIS_COMPLETE, handler: this.onAgentAnalysis },
      { eventType: EventTypes.SYSTEM_HEARTBEAT, handler: this.onHeartbeat },
      { eventType: EventTypes.TREASURY_TRANSFER, handler: this.onTreasuryTransfer },
    ];
  }

  async onProposalCreated(event) {
    const { proposalId, description, creator } = event.payload;

    this.updateStatus('ACTIVE', `Scanning Proposal #${proposalId} calldata...`);
    this.emitLog(`Security scan initiated for Proposal #${proposalId}`);
    await this.workDelay(2500, 5000);

    this.updateStatus('ANALYZING', `AI threat analysis on #${proposalId}...`);
    const reasoning = await this.think(
      `Perform a security analysis on this governance proposal:\n\nProposal #${proposalId}: "${description}"\nCreator wallet: ${creator}\n\nCheck for: malicious calldata patterns, unrestricted permissions, treasury drain vectors, governance attack signatures, and suspicious creator activity.`,
      { proposalId, description, creator, scanNumber: ++this.scanCount }
    );

    const threatDetected = reasoning.risk === 'high' || reasoning.risk === 'critical';
    
    if (threatDetected) {
      this.updateStatus('ALERT', `⚠ THREAT detected in #${proposalId}!`);
      this.daoState.riskScore = Math.min(100, this.daoState.riskScore + 15);
      this.emitLog(`⚠ SECURITY ALERT: ${reasoning.summary}`);
      
      this.broadcast(EventTypes.SECURITY_ALERT, {
        proposalId,
        threatLevel: reasoning.risk,
        description: reasoning.summary,
      });
    } else {
      this.emitLog(`Scan clear for #${proposalId}. Risk: ${reasoning.risk?.toUpperCase()}, Confidence: ${reasoning.confidence}%`);
    }

    this.threatHistory.push({ proposalId, reasoning, timestamp: new Date().toISOString() });
    this.generateProof(`Security Scan — Proposal #${proposalId}`, reasoning, 'ProposalCreated');
    
    this.socketio.emit('dao_metrics', {
      treasury: this.daoState.treasury,
      risk: this.daoState.riskScore,
      proposals: this.daoState.activeProposals,
      last_action: this.daoState.lastAction,
    });

    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Scanning mempool...');
  }

  async onWhaleActivity(event) {
    const { wallet, action, amount, token } = event.payload;
    
    this.updateStatus('ANALYZING', `Whale ${action} detected — ${amount} ${token}`);
    this.emitLog(`Whale alert: ${wallet?.slice(0, 12)}... ${action} ${amount.toLocaleString()} ${token}`);
    
    const reasoning = await this.think(
      `Analyze whale wallet activity for governance security implications:\n\nWallet: ${wallet}\nAction: ${action}\nAmount: ${amount} ${token}\n\nAssess: governance influence risk, potential vote manipulation, accumulation patterns.`,
      { wallet, action, amount, token }
    );

    if (reasoning.risk === 'high' || reasoning.risk === 'critical') {
      this.daoState.riskScore = Math.min(100, this.daoState.riskScore + 8);
      this.broadcast(EventTypes.GOVERNANCE_ANOMALY, {
        type: 'whale_influence',
        wallet,
        risk: reasoning.risk,
        details: reasoning.summary,
      });
    }

    this.generateProof('Whale Activity Analysis', reasoning, 'WhaleActivity');
    await this.workDelay(1000, 2500);
    this.returnToMonitoring('Scanning mempool...');
  }

  async onAgentAnalysis(event) {
    if (event.payload.sourceAgent === this.id) return; // Don't react to own analysis
    
    const { analysisType, risk } = event.payload;
    if (risk === 'high' || risk === 'critical') {
      this.updateStatus('COMMUNICATING', `Cross-referencing ${analysisType} threat...`);
      this.emitLog(`Cross-referencing threat data from ${event.payload.sourceAgentName}...`);
      await this.workDelay(1500, 3000);
      this.returnToMonitoring('Scanning mempool...');
    }
  }

  async onTreasuryTransfer(event) {
    const { amount, type } = event.payload;
    
    if (type === 'withdrawn' && amount > 10) {
      this.updateStatus('ALERT', `Large treasury withdrawal detected!`);
      this.emitLog(`⚠ Treasury withdrawal: ${amount} ETH — analyzing for anomalies`);
      
      const reasoning = await this.think(
        `A treasury withdrawal of ${amount} ETH was detected. Analyze for potential unauthorized access or governance bypass.`,
        { amount, type }
      );
      
      this.generateProof('Treasury Withdrawal Audit', reasoning, 'TreasuryTransfer');
      await this.workDelay(2000, 4000);
    }
    
    this.returnToMonitoring('Scanning mempool...');
  }

  async onHeartbeat() {
    // Periodic security baseline recalculation
    if (this.daoState.riskScore > 5) {
      this.daoState.riskScore = Math.max(5, this.daoState.riskScore - 1); // Gradual decay
    }
    
    this.socketio.emit('dao_metrics', {
      treasury: this.daoState.treasury,
      risk: this.daoState.riskScore,
      proposals: this.daoState.activeProposals,
      last_action: this.daoState.lastAction,
    });
  }
}

export default SecurityAgent;
