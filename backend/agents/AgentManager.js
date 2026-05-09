const { EventEmitter } = require('events');

class Agent extends EventEmitter {
  constructor(id, name, role, behavior) {
    super();
    this.id = id;
    this.name = name;
    this.role = role;
    this.status = 'initializing';
    this.pos = { x: Math.random() * 800, y: Math.random() * 600 };
    this.behavior = behavior;
    this.memory = [];
  }

  think(context) {
    this.status = 'thinking';
    this.emit('status_change', { id: this.id, status: this.status });
    
    // Simulate AI processing
    setTimeout(() => {
      const insight = this.behavior(context);
      this.status = 'active';
      this.memory.push(insight);
      this.emit('insight', { id: this.id, insight });
      this.emit('status_change', { id: this.id, status: this.status });
    }, 2000 + Math.random() * 3000);
  }

  move(target) {
    this.status = 'moving';
    this.emit('status_change', { id: this.id, status: this.status });
    // Movement logic is handled by the main loop for simplicity
  }
}

const agents = [
  new Agent('alpha-trader', 'Alpha Trader', 'Market Intelligence', (ctx) => {
    return `Detected bullish pattern on ${ctx.asset || 'BTC'}. Sentiment score: 0.85.`;
  }),
  new Agent('mastermind', 'Mastermind', 'Strategist', (ctx) => {
    return `Governance participation is up 12%. Recommending incentive adjustment.`;
  }),
  new Agent('hermes-sentinel', 'Hermes Sentinel', 'Security', (ctx) => {
    return `No intrusion detected in block ${ctx.blockHeight}. Network integrity at 99.9%.`;
  }),
  new Agent('treasury-architect', 'Treasury Architect', 'Finance', (ctx) => {
    return `Vault rebalancing complete. Projected APY increased by 1.2%.`;
  }),
  new Agent('community-nexus', 'Community Nexus', 'Communications', (ctx) => {
    return `Social sentiment analyzed. DAO community growth: +5% this week.`;
  }),
  new Agent('logistics-pro', 'Logistics Pro', 'Operations', (ctx) => {
    return `Optimized task queue. Resource allocation efficiency at 94%.`;
  })
];

module.exports = { agents };
