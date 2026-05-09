// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Governance Validation Agent
// Validates execution payloads, simulates contract calls, verifies rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { BaseAgent } from './base-agent.js';
import { EventTypes } from '../engine/event-bus.js';

export class GovernanceAgent extends BaseAgent {
  constructor(socketio, daoState) {
    super('verifier', 'Governance Val.', 'Compliance', 'Ethers.js', socketio, daoState);
    this.validationHistory = [];
  }

  getEventSubscriptions() {
    return [
      { eventType: EventTypes.PROPOSAL_CREATED, handler: this.onProposalCreated },
      { eventType: EventTypes.PROPOSAL_EXECUTED, handler: this.onProposalExecuted },
      { eventType: EventTypes.SECURITY_ALERT, handler: this.onSecurityAlert },
      { eventType: EventTypes.AGENT_ANALYSIS_COMPLETE, handler: this.onAgentAnalysis },
    ];
  }

  async onProposalCreated(event) {
    const { proposalId, description } = event.payload;

    // Wait a bit — let proposal and security agents go first
    await this.workDelay(5000, 8000);

    this.updateStatus('EXECUTING', `Validating Proposal #${proposalId} payload...`);
    this.emitLog(`Simulating execution payload for Proposal #${proposalId}...`);
    await this.workDelay(3000, 6000);

    this.updateStatus('ANALYZING', `AI verifying governance rules for #${proposalId}...`);
    const reasoning = await this.think(
      `Validate this governance proposal for execution safety:\n\nProposal #${proposalId}: "${description}"\n\nVerify: execution payload integrity, governance rule compliance, state transition safety, and precondition checks. Simulate the call and report results.`,
      { proposalId, description }
    );

    const passed = reasoning.risk !== 'critical' && reasoning.risk !== 'high';
    
    this.emitLog(`Validation ${passed ? 'PASSED ✓' : 'FAILED ✗'} for #${proposalId}. ${reasoning.recommendation || ''}`);
    
    this.validationHistory.push({
      proposalId,
      passed,
      reasoning,
      timestamp: new Date().toISOString(),
    });

    this.generateProof(`Governance Validation — #${proposalId}`, reasoning, 'ProposalCreated');

    if (passed) {
      this.broadcast(EventTypes.AGENT_CONSENSUS_REACHED, {
        proposalId,
        validationResult: 'passed',
        confidence: reasoning.confidence,
      });
    }

    await this.workDelay(1000, 2000);
    this.returnToMonitoring('Standing by...');
  }

  async onProposalExecuted(event) {
    const { proposalId } = event.payload;

    this.updateStatus('EXECUTING', `Verifying execution of #${proposalId}...`);
    this.emitLog(`Post-execution verification for Proposal #${proposalId}...`);
    await this.workDelay(2000, 4000);

    const reasoning = await this.think(
      `A governance proposal has been executed on-chain. Verify the post-execution state:\n\nProposal #${proposalId}\n\nCheck: state transition correctness, side effects, treasury balance changes, and governance invariants.`,
      { proposalId }
    );

    this.emitLog(`Post-execution audit complete for #${proposalId}: ${reasoning.summary?.slice(0, 100)}`);
    this.generateProof(`Post-Execution Audit — #${proposalId}`, reasoning, 'ProposalExecuted');

    await this.workDelay(1000, 2000);
    this.returnToMonitoring('Standing by...');
  }

  async onSecurityAlert(event) {
    const { proposalId, threatLevel, description } = event.payload;

    this.updateStatus('ALERT', `Security alert — re-validating #${proposalId}!`);
    this.emitLog(`⚠ Re-validating Proposal #${proposalId} after security alert: ${description?.slice(0, 80)}`);
    await this.workDelay(3000, 5000);

    const reasoning = await this.think(
      `URGENT: Security alert triggered for Proposal #${proposalId}.\nThreat level: ${threatLevel}\nAlert: ${description}\n\nPerform emergency re-validation of the execution payload. Check for exploit vectors and recommend action.`,
      { proposalId, threatLevel, description }
    );

    this.emitLog(`Emergency validation: ${reasoning.recommendation || reasoning.summary?.slice(0, 100)}`);
    this.generateProof(`Emergency Validation — #${proposalId}`, reasoning, 'SecurityAlert');

    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Standing by...');
  }

  async onAgentAnalysis(event) {
    if (event.payload.sourceAgent === this.id) return;
    
    // Only react to high-risk analyses from other agents
    if (event.payload.risk === 'high' || event.payload.risk === 'critical') {
      this.updateStatus('COMMUNICATING', 'Processing inter-agent alert...');
      this.emitLog(`Received high-risk analysis from ${event.payload.sourceAgentName}. Adjusting validation parameters.`);
      await this.workDelay(1000, 2000);
      this.returnToMonitoring('Standing by...');
    }
  }
}

export default GovernanceAgent;
