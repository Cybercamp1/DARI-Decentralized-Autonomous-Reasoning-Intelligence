// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Base Agent: Foundation for all autonomous AI agents
// Agents react to REAL events, reason with REAL AI, and produce REAL proofs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { eventBus } from '../engine/event-bus.js';
import { reason } from '../engine/ai-reasoning.js';
import { createProof } from '../engine/proof-system.js';
import { storeReasoning, getAgentHistory } from '../engine/memory-store.js';

export class BaseAgent {
  constructor(id, name, role, integration, socketio, daoState) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.integration = integration;
    this.socketio = socketio;
    this.daoState = daoState; // shared mutable reference
    
    this.status = 'IDLE';
    this.currentTask = 'Initializing...';
    this.isProcessing = false;
    this.eventSubscriptions = [];
    this.lastActivityTime = Date.now();
  }

  /**
   * Subscribe to events this agent cares about
   * Subclasses override getEventSubscriptions() to specify their events
   */
  start() {
    const subscriptions = this.getEventSubscriptions();
    for (const { eventType, handler } of subscriptions) {
      const wrappedHandler = async (event) => {
        // Don't queue up work if already processing
        if (this.isProcessing) return;
        try {
          this.isProcessing = true;
          await handler.call(this, event);
        } catch (err) {
          console.error(`[${this.name}] Error processing ${eventType}:`, err.message);
        } finally {
          this.isProcessing = false;
        }
      };
      eventBus.subscribe(eventType, wrappedHandler);
      this.eventSubscriptions.push({ eventType, handler: wrappedHandler });
    }
    
    this.updateStatus('MONITORING', `Watching ${subscriptions.length} event channels...`);
    console.log(`[${this.name}] Agent started — subscribed to ${subscriptions.length} event types`);
  }

  /**
   * Override in subclasses — return array of { eventType, handler }
   */
  getEventSubscriptions() {
    return [];
  }

  /**
   * Update agent status and broadcast to frontend
   */
  updateStatus(status, task) {
    this.status = status;
    this.currentTask = task;
    this.lastActivityTime = Date.now();
    
    this.socketio.emit('agent_update', {
      agent_id: this.id,
      task,
      status,
    });
  }

  /**
   * Emit a log message to the frontend terminal
   */
  emitLog(text) {
    this.socketio.emit('system_log', {
      sender: this.name,
      text,
    });
  }

  /**
   * Perform AI reasoning on a task using the current DAO context
   */
  async think(taskPrompt, additionalContext = {}) {
    this.updateStatus('ANALYZING', 'AI reasoning in progress...');

    // Build context from DAO state + agent history
    const history = getAgentHistory(this.id, 5);
    const context = {
      treasury: this.daoState.treasury,
      riskScore: this.daoState.riskScore,
      activeProposals: this.daoState.activeProposals,
      lastAction: this.daoState.lastAction,
      recentHistory: history.map(h => ({
        task: h.task,
        risk: h.risk_level,
        confidence: h.confidence,
        time: h.timestamp,
      })),
      ...additionalContext,
    };

    const output = await reason(this.name, taskPrompt, context);

    // Store reasoning in persistent memory
    storeReasoning(this.id, this.role, taskPrompt, output);

    return output;
  }

  /**
   * Generate a proof-of-work for a completed task
   */
  generateProof(taskName, reasoning, eventSource = 'autonomous') {
    const proof = createProof(this.name, taskName, reasoning, eventSource);
    
    // Broadcast updated proofs to frontend
    this.socketio.emit('new_proof', proof);
    
    return proof;
  }

  /**
   * Communicate a finding to other agents via the event bus
   */
  broadcast(eventType, payload) {
    eventBus.publish(eventType, {
      ...payload,
      sourceAgent: this.id,
      sourceAgentName: this.name,
    });
  }

  /**
   * Return to monitoring state after completing work
   */
  returnToMonitoring(message = null) {
    const msg = message || `Monitoring ${this.eventSubscriptions.length} channels...`;
    this.updateStatus('MONITORING', msg);
  }

  /**
   * Simulate processing delay to reflect realistic AI work timing
   */
  async workDelay(minMs = 1500, maxMs = 4000) {
    const delay = minMs + Math.random() * (maxMs - minMs);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export default BaseAgent;
