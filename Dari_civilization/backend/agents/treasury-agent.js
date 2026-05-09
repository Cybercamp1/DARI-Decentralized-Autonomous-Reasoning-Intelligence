import { BaseAgent } from './base-agent.js';
import { EventTypes } from '../engine/event-bus.js';

export class TreasuryAgent extends BaseAgent {
  constructor(socketio, daoState) {
    super('dropship_001', 'Treasury Ops', 'Treasury', 'Gnosis Safe API', socketio, daoState);
  }

  getEventSubscriptions() {
    return [
      { eventType: EventTypes.TREASURY_TRANSFER, handler: this.onTreasuryTransfer },
      { eventType: EventTypes.PROPOSAL_CREATED, handler: this.onProposalCreated },
      { eventType: EventTypes.PRICE_UPDATE, handler: this.onPriceUpdate },
      { eventType: EventTypes.SYSTEM_HEARTBEAT, handler: this.onHeartbeat },
    ];
  }

  async onTreasuryTransfer(event) {
    const { amount, type } = event.payload;
    this.updateStatus('ACTIVE', `Treasury ${type}: ${amount} ETH`);
    this.emitLog(`Treasury ${type}: ${typeof amount === 'number' ? amount.toFixed(4) : amount} ETH`);

    if (type === 'funded') {
      this.daoState.treasury += (typeof amount === 'number' ? amount * 2500 : 0);
    } else if (type === 'withdrawn') {
      this.daoState.treasury = Math.max(0, this.daoState.treasury - (typeof amount === 'number' ? amount * 2500 : 0));
    }

    this.updateStatus('ANALYZING', 'Recalculating treasury exposure...');
    const reasoning = await this.think(
      `Treasury ${type} of ${amount} ETH detected. Current reserves: $${this.daoState.treasury.toLocaleString()}. Calculate exposure, runway, and allocation impact.`,
      { amount, type, totalTreasury: this.daoState.treasury }
    );
    this.emitLog(`Treasury: ${reasoning.summary?.slice(0, 120)}`);
    this.generateProof(`Treasury ${type} Analysis`, reasoning, 'TreasuryTransfer');

    this.socketio.emit('dao_metrics', {
      treasury: this.daoState.treasury,
      risk: this.daoState.riskScore,
      proposals: this.daoState.activeProposals,
      last_action: `Treasury ${type}: ${amount} ETH`,
    });

    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Tracking runway...');
  }

  async onProposalCreated(event) {
    const { proposalId, description } = event.payload;
    // Wait for other agents to process first
    await this.workDelay(8000, 12000);

    this.updateStatus('ANALYZING', `Estimating treasury impact of #${proposalId}...`);
    const reasoning = await this.think(
      `Proposal #${proposalId}: "${description}". Estimate treasury impact, funding requirements, and budget implications. Current treasury: $${this.daoState.treasury.toLocaleString()}.`,
      { proposalId, description, treasury: this.daoState.treasury }
    );
    this.emitLog(`Treasury impact for #${proposalId}: ${reasoning.summary?.slice(0, 100)}`);
    this.generateProof(`Treasury Impact — #${proposalId}`, reasoning, 'ProposalCreated');
    await this.workDelay(1000, 2000);
    this.returnToMonitoring('Tracking runway...');
  }

  async onPriceUpdate(event) {
    const { price, change24h } = event.payload;
    // Only react to significant price changes
    if (Math.abs(change24h) > 3) {
      this.updateStatus('ANALYZING', 'ETH price shift — recalculating reserves...');
      // Adjust treasury based on ETH price (simplified)
      const adjustment = (change24h / 100) * this.daoState.treasury * 0.3; // 30% ETH exposure
      this.daoState.treasury += adjustment;
      this.emitLog(`Treasury adjusted by $${adjustment.toFixed(0)} due to ETH price movement.`);

      this.socketio.emit('dao_metrics', {
        treasury: this.daoState.treasury,
        risk: this.daoState.riskScore,
        proposals: this.daoState.activeProposals,
        last_action: this.daoState.lastAction,
      });
      await this.workDelay(1500, 3000);
    }
    this.returnToMonitoring('Tracking runway...');
  }

  async onHeartbeat() {
    // Small yield generation to simulate DeFi returns
    const yieldAmount = 50 + Math.random() * 200;
    this.daoState.treasury += yieldAmount;
    this.socketio.emit('dao_metrics', {
      treasury: this.daoState.treasury,
      risk: this.daoState.riskScore,
      proposals: this.daoState.activeProposals,
      last_action: this.daoState.lastAction,
    });
  }
}
export default TreasuryAgent;
