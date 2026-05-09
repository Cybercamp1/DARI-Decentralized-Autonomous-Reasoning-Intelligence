// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Proposal Analysis Agent
// Analyzes governance proposals, predicts outcomes, assesses treasury impact
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { BaseAgent } from './base-agent.js';
import { EventTypes } from '../engine/event-bus.js';

export class ProposalAgent extends BaseAgent {
  constructor(socketio, daoState) {
    super('evaluator', 'Proposal Analysis', 'Risk', 'Snapshot API', socketio, daoState);
    this.analyzedProposals = new Map();
  }

  getEventSubscriptions() {
    return [
      { eventType: EventTypes.PROPOSAL_CREATED, handler: this.onProposalCreated },
      { eventType: EventTypes.VOTE_CAST, handler: this.onVoteCast },
      { eventType: EventTypes.PROPOSAL_EXECUTED, handler: this.onProposalExecuted },
    ];
  }

  async onProposalCreated(event) {
    const { proposalId, description, creator } = event.payload;

    this.updateStatus('ACTIVE', `Ingesting Proposal #${proposalId}...`);
    this.emitLog(`New proposal detected: #${proposalId} — "${description}"`);
    await this.workDelay(2000, 4000);

    // AI Reasoning
    this.updateStatus('ANALYZING', `AI analyzing Proposal #${proposalId}...`);
    const reasoning = await this.think(
      `Analyze this new governance proposal and assess its impact:\n\nProposal #${proposalId}: "${description}"\nCreated by: ${creator}\n\nEvaluate: treasury impact, execution complexity, governance risk, and predict approval probability.`,
      { proposalId, description, creator }
    );

    this.emitLog(`Analysis complete for #${proposalId}: Risk=${reasoning.risk?.toUpperCase()}, Confidence=${reasoning.confidence}%`);
    
    // Store analysis
    this.analyzedProposals.set(proposalId, reasoning);
    
    // Update DAO state
    this.daoState.activeProposals++;
    this.daoState.lastAction = `Proposal #${proposalId} Analyzed`;

    // Generate proof
    this.generateProof(`Proposal #${proposalId} Analysis`, reasoning, 'ProposalCreated');

    // Broadcast to other agents for coordination
    this.broadcast(EventTypes.AGENT_ANALYSIS_COMPLETE, {
      analysisType: 'proposal',
      proposalId,
      risk: reasoning.risk,
      confidence: reasoning.confidence,
      summary: reasoning.summary,
    });

    // Update metrics
    this.socketio.emit('dao_metrics', {
      treasury: this.daoState.treasury,
      risk: this.daoState.riskScore,
      proposals: this.daoState.activeProposals,
      last_action: this.daoState.lastAction,
    });

    this.returnToMonitoring('Awaiting proposals...');
  }

  async onVoteCast(event) {
    const { proposalId, voter, support, weight } = event.payload;
    
    this.updateStatus('EXECUTING', `Processing vote on #${proposalId}...`);
    this.emitLog(`Vote cast on #${proposalId}: ${support ? 'YES' : 'NO'} (weight: ${weight}) by ${voter?.slice(0, 10)}...`);
    
    await this.workDelay(1000, 2000);
    this.returnToMonitoring('Awaiting proposals...');
  }

  async onProposalExecuted(event) {
    const { proposalId } = event.payload;
    
    this.updateStatus('EXECUTING', `Proposal #${proposalId} executed on-chain`);
    this.emitLog(`Proposal #${proposalId} has been executed successfully.`);
    
    this.daoState.activeProposals = Math.max(0, this.daoState.activeProposals - 1);
    this.daoState.lastAction = `Proposal #${proposalId} Executed`;
    
    this.generateProof(`Proposal #${proposalId} Execution Tracked`, { risk: 'low', confidence: 95 }, 'ProposalExecuted');
    
    this.socketio.emit('dao_metrics', {
      treasury: this.daoState.treasury,
      risk: this.daoState.riskScore,
      proposals: this.daoState.activeProposals,
      last_action: this.daoState.lastAction,
    });
    
    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Awaiting proposals...');
  }
}

export default ProposalAgent;
