// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Event Bus: The nervous system of the civilization
// All agent activity is triggered by REAL events, never fake loops
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this.eventHistory = [];
    this.maxHistory = 500;
  }

  /**
   * Publish a typed event to all subscribed agents
   * Every event is logged with a timestamp for traceability
   */
  publish(eventType, payload) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      processed: false,
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistory);
    }

    this.emit(eventType, event);
    this.emit('*', event); // wildcard for monitoring
    return event;
  }

  /**
   * Subscribe an agent to specific event types
   */
  subscribe(eventType, handler) {
    this.on(eventType, handler);
  }

  /**
   * Get recent event history for agent memory context
   */
  getRecentEvents(count = 20, eventType = null) {
    let events = this.eventHistory;
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    return events.slice(-count);
  }
}

// Event type constants
export const EventTypes = {
  // Blockchain events
  PROPOSAL_CREATED: 'proposal:created',
  VOTE_CAST: 'vote:cast',
  PROPOSAL_EXECUTED: 'proposal:executed',
  TREASURY_TRANSFER: 'treasury:transfer',
  
  // Market events
  WHALE_ACTIVITY: 'market:whale_activity',
  MARKET_VOLATILITY: 'market:volatility',
  PRICE_UPDATE: 'market:price_update',
  
  // Security events
  SECURITY_ALERT: 'security:alert',
  GOVERNANCE_ANOMALY: 'security:governance_anomaly',
  
  // Agent coordination events
  AGENT_ANALYSIS_COMPLETE: 'agent:analysis_complete',
  AGENT_REQUEST_COORDINATION: 'agent:request_coordination',
  AGENT_CONSENSUS_REACHED: 'agent:consensus_reached',
  
  // System events
  USER_COMMAND: 'system:user_command',
  SYSTEM_HEARTBEAT: 'system:heartbeat',
  AI_REASONING_COMPLETE: 'ai:reasoning_complete',
};

export const eventBus = new EventBus();
export default eventBus;
