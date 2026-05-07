// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Memory Store: Persistent agent memory via JSON files
// Pure JS — no native modules required
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

// In-memory stores backed by JSON files
let reasoningHistory = [];
let governanceEvents = [];
let taskProofs = [];
let daoSnapshots = [];
let idCounter = 0;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromDisk(filename) {
  const filepath = join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch { /* ignore corrupted files */ }
  return [];
}

function saveToDisk(filename, data) {
  try {
    const filepath = join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data.slice(-500), null, 0));
  } catch { /* non-critical */ }
}

// Debounced save — don't write on every single event
const saveTimers = {};
function debouncedSave(filename, data) {
  if (saveTimers[filename]) clearTimeout(saveTimers[filename]);
  saveTimers[filename] = setTimeout(() => saveToDisk(filename, data), 3000);
}

/**
 * Initialize persistent memory
 */
export async function initMemory() {
  ensureDataDir();
  reasoningHistory = loadFromDisk('reasoning.json');
  governanceEvents = loadFromDisk('governance.json');
  taskProofs = loadFromDisk('proofs.json');
  daoSnapshots = loadFromDisk('snapshots.json');
  idCounter = reasoningHistory.length + governanceEvents.length + taskProofs.length;
  console.log(`[Memory] Loaded: ${reasoningHistory.length} reasonings, ${taskProofs.length} proofs, ${governanceEvents.length} events`);
}

export function storeReasoning(agentId, agentRole, task, output, eventType = null) {
  const entry = {
    id: ++idCounter, agent_id: agentId, agent_role: agentRole,
    event_type: eventType, task,
    reasoning_output: JSON.stringify(output),
    risk_level: output.risk || 'unknown',
    confidence: output.confidence || 0,
    timestamp: new Date().toISOString(),
    metadata: JSON.stringify(output.details || {}),
  };
  reasoningHistory.push(entry);
  if (reasoningHistory.length > 500) reasoningHistory = reasoningHistory.slice(-500);
  debouncedSave('reasoning.json', reasoningHistory);
  return entry;
}

export function getAgentHistory(agentId, limit = 10) {
  return reasoningHistory
    .filter(r => r.agent_id === agentId)
    .slice(-limit)
    .reverse();
}

export function storeGovernanceEvent(eventType, payload, source = 'system') {
  const entry = {
    id: ++idCounter, event_type: eventType,
    payload: JSON.stringify(payload), source,
    timestamp: new Date().toISOString(),
  };
  governanceEvents.push(entry);
  if (governanceEvents.length > 500) governanceEvents = governanceEvents.slice(-500);
  debouncedSave('governance.json', governanceEvents);
  return entry;
}

export function storeProof(agentName, taskName, status, txHash, reasoningSummary, confidence, eventSource) {
  const entry = {
    id: ++idCounter, agent_name: agentName, task_name: taskName,
    status, tx_hash: txHash, reasoning_summary: reasoningSummary,
    confidence, event_source: eventSource,
    timestamp: new Date().toISOString(),
  };
  taskProofs.push(entry);
  if (taskProofs.length > 500) taskProofs = taskProofs.slice(-500);
  debouncedSave('proofs.json', taskProofs);
  return entry;
}

export function getRecentProofs(limit = 15) {
  return taskProofs.slice(-limit).reverse();
}

export function storeSnapshot(treasury, riskScore, activeProposals, lastAction) {
  const entry = {
    id: ++idCounter, treasury, risk_score: riskScore,
    active_proposals: activeProposals, last_action: lastAction,
    timestamp: new Date().toISOString(),
  };
  daoSnapshots.push(entry);
  if (daoSnapshots.length > 200) daoSnapshots = daoSnapshots.slice(-200);
  debouncedSave('snapshots.json', daoSnapshots);
  return entry;
}

export function getDaoHistory(limit = 50) {
  return daoSnapshots.slice(-limit).reverse();
}

export function getGovernanceHistory(limit = 30) {
  return governanceEvents.slice(-limit).reverse();
}

export default {
  initMemory, storeReasoning, getAgentHistory,
  storeGovernanceEvent, storeProof, getRecentProofs,
  storeSnapshot, getDaoHistory, getGovernanceHistory,
};
