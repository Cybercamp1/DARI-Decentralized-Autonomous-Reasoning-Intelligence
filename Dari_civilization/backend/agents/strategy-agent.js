import { BaseAgent } from './base-agent.js';
import { EventTypes } from '../engine/event-bus.js';

export class StrategyAgent extends BaseAgent {
  constructor(socketio, daoState) {
    super('strategist', 'DAO Strategy', 'Strategy', 'LangChain', socketio, daoState);
  }

  getEventSubscriptions() {
    return [
      { eventType: EventTypes.AGENT_ANALYSIS_COMPLETE, handler: this.onAgentAnalysis },
      { eventType: EventTypes.AGENT_CONSENSUS_REACHED, handler: this.onConsensus },
      { eventType: EventTypes.VOTE_CAST, handler: this.onVoteCast },
      { eventType: EventTypes.SECURITY_ALERT, handler: this.onSecurityAlert },
    ];
  }

  async onAgentAnalysis(event) {
    if (event.payload.sourceAgent === this.id) return;
    const { analysisType, proposalId, risk, summary } = event.payload;
    this.updateStatus('ANALYZING', `Integrating ${event.payload.sourceAgentName} analysis...`);
    this.emitLog(`Received ${analysisType} analysis from ${event.payload.sourceAgentName}`);
    await this.workDelay(2000, 4000);

    const reasoning = await this.think(
      `Agent ${event.payload.sourceAgentName} analyzed ${analysisType}. Risk: ${risk}. Summary: ${summary}. Provide strategic recommendation.`,
      { analysisType, proposalId, risk }
    );
    this.emitLog(`Strategy: ${reasoning.recommendation || reasoning.summary?.slice(0, 120)}`);
    this.generateProof('Strategic Analysis', reasoning, 'AgentCoordination');
    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Monitoring quorum...');
  }

  async onConsensus(event) {
    const { proposalId, confidence } = event.payload;
    this.updateStatus('COMMUNICATING', `Consensus on #${proposalId}`);
    this.emitLog(`✓ Consensus on Proposal #${proposalId} (confidence: ${confidence}%)`);
    this.generateProof(`Consensus — #${proposalId}`, { risk: 'low', confidence }, 'Consensus');
    await this.workDelay(1000, 2000);
    this.returnToMonitoring('Monitoring quorum...');
  }

  async onVoteCast(event) {
    const { proposalId, support, weight } = event.payload;
    this.updateStatus('ANALYZING', `Vote on #${proposalId}`);
    if (Math.random() > 0.6) {
      const reasoning = await this.think(
        `Vote on #${proposalId}: ${support ? 'YES' : 'NO'}, weight ${weight}. Update quorum prediction.`,
        { proposalId, support, weight }
      );
      this.emitLog(`Quorum: ${reasoning.summary?.slice(0, 100) || 'Updated.'}`);
    }
    await this.workDelay(1000, 2000);
    this.returnToMonitoring('Monitoring quorum...');
  }

  async onSecurityAlert(event) {
    this.updateStatus('COMMUNICATING', 'Integrating security alert...');
    this.emitLog(`⚠ Security alert. Recommending delay on active proposals.`);
    const reasoning = await this.think(
      `Security alert: ${event.payload.description || 'Unknown'}. Threat: ${event.payload.threatLevel}. Recommend response.`,
      event.payload
    );
    this.emitLog(`Strategy: ${reasoning.recommendation || 'Monitoring.'}`);
    this.generateProof('Security Response', reasoning, 'SecurityAlert');
    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Monitoring quorum...');
  }
}
export default StrategyAgent;
