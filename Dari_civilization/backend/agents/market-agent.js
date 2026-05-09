import { BaseAgent } from './base-agent.js';
import { EventTypes } from '../engine/event-bus.js';

export class MarketAgent extends BaseAgent {
  constructor(socketio, daoState) {
    super('trader_001', 'Market Intel', 'Market', 'Chainlink Oracles', socketio, daoState);
    this.lastEthPrice = 2800;
  }

  getEventSubscriptions() {
    return [
      { eventType: EventTypes.PRICE_UPDATE, handler: this.onPriceUpdate },
      { eventType: EventTypes.WHALE_ACTIVITY, handler: this.onWhaleActivity },
      { eventType: EventTypes.SYSTEM_HEARTBEAT, handler: this.onHeartbeat },
    ];
  }

  async onPriceUpdate(event) {
    const { symbol, price, change24h, volatility } = event.payload;
    this.lastEthPrice = price;

    this.updateStatus('MONITORING', `${symbol} $${price.toFixed(0)} (${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%)`);

    if (volatility > 4) {
      this.updateStatus('ANALYZING', `High volatility: ${volatility.toFixed(1)}%`);
      const reasoning = await this.think(
        `ETH price: $${price.toFixed(2)}, 24h change: ${change24h.toFixed(2)}%, volatility: ${volatility.toFixed(2)}%. Analyze impact on DAO governance participation and token value.`,
        { symbol, price, change24h, volatility }
      );
      this.emitLog(`Market: ${reasoning.summary?.slice(0, 120)}`);
      this.generateProof('Volatility Analysis', reasoning, 'PriceUpdate');

      this.broadcast(EventTypes.MARKET_VOLATILITY, { symbol, price, volatility, analysis: reasoning.summary });
      await this.workDelay(2000, 4000);
    }

    this.returnToMonitoring(`Tracking ${symbol} volatility...`);
  }

  async onWhaleActivity(event) {
    const { wallet, action, amount, token } = event.payload;
    this.updateStatus('ANALYZING', `Whale ${action}: ${amount} ${token}`);
    this.emitLog(`Whale ${wallet?.slice(0, 10)}... ${action} ${amount.toLocaleString()} ${token}`);

    const reasoning = await this.think(
      `Whale wallet ${wallet} performed ${action} of ${amount} ${token}. Analyze market impact and governance implications.`,
      { wallet, action, amount, token, ethPrice: this.lastEthPrice }
    );
    this.emitLog(`Analysis: ${reasoning.summary?.slice(0, 100)}`);
    this.generateProof('Whale Analysis', reasoning, 'WhaleActivity');
    await this.workDelay(1500, 3000);
    this.returnToMonitoring('Analyzing volatility...');
  }

  async onHeartbeat() {
    // Periodic market check
    if (Math.random() > 0.5) {
      this.updateStatus('MONITORING', `ETH ~$${this.lastEthPrice.toFixed(0)} — stable`);
    }
  }
}
export default MarketAgent;
