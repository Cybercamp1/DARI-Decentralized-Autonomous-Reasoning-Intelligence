// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARI — Autonomous AI Governance Civilization Server
// The central orchestration hub: Express + Socket.IO + AI + Blockchain
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Engine imports
import { initAI } from './engine/ai-reasoning.js';
import { eventBus } from './engine/event-bus.js';
import { initBlockchainMonitor, getMonitoringStatus } from './engine/blockchain-monitor.js';
import { getProofsForDashboard } from './engine/proof-system.js';
import { handleCommand } from './engine/command-handler.js';

// Agent imports
import { ProposalAgent } from './agents/proposal-agent.js';
import { SecurityAgent } from './agents/security-agent.js';
import { GovernanceAgent } from './agents/governance-agent.js';
import { StrategyAgent } from './agents/strategy-agent.js';
import { MarketAgent } from './agents/market-agent.js';
import { TreasuryAgent } from './agents/treasury-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── App Setup ──────────────────────────────────
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// ── Shared DAO State (mutable reference shared across agents) ──
const daoState = {
  treasury: 2500000,
  riskScore: 12,
  activeProposals: 3,
  lastAction: 'System Initialized',
};

// ── Initialize Memory Store ──────────────────
// Use synchronous initialization to avoid top-level await issues
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Lazy memory init — we'll init memory inside the start function
let memoryInitialized = false;

async function initMemoryStore() {
  if (memoryInitialized) return;
  try {
    const { initMemory } = await import('./engine/memory-store.js');
    await initMemory();
    memoryInitialized = true;
  } catch (err) {
    console.warn('[Memory] SQLite init failed, running without persistence:', err.message);
    // Provide no-op stubs so the rest of the system works
  }
}

// ── Initialize AI ──────────────────────────────
const aiReady = initAI(process.env.GEMINI_API_KEY);

// ── Create Agents ──────────────────────────────
const agents = {
  evaluator: new ProposalAgent(io, daoState),
  researcher: new SecurityAgent(io, daoState),
  verifier: new GovernanceAgent(io, daoState),
  strategist: new StrategyAgent(io, daoState),
  trader_001: new MarketAgent(io, daoState),
  dropship_001: new TreasuryAgent(io, daoState),
};

// ── Socket.IO Connection Handler ───────────────
io.on('connection', (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`);

  // Send initial state
  socket.emit('system_log', { sender: 'SYSTEM', text: 'Connected to Autonomous AI Governance Engine.' });
  socket.emit('system_log', { sender: 'SYSTEM', text: `AI Mode: ${aiReady ? 'Gemini 2.0 Flash ACTIVE' : 'Structured Fallback (set GEMINI_API_KEY for real AI)'}` });
  socket.emit('system_log', { sender: 'SYSTEM', text: `Blockchain: ${getMonitoringStatus().mode} mode` });

  socket.emit('dao_metrics', {
    treasury: daoState.treasury,
    risk: daoState.riskScore,
    proposals: daoState.activeProposals,
    last_action: daoState.lastAction,
  });

  // Send existing proofs
  const existingProofs = getProofsForDashboard(10);
  if (existingProofs.length > 0) {
    socket.emit('ai_proofs', existingProofs);
  }

  // Handle user commands
  socket.on('user_command', (data) => {
    const command = data?.command || '';
    handleCommand(command, io, daoState);
  });

  socket.on('disconnect', () => {
    console.log(`[Server] Client disconnected: ${socket.id}`);
  });
});

// ── Proof broadcast — collect new proofs and periodically push ──
let proofBuffer = [];
eventBus.on('*', (event) => {
  // Log all events for debugging
  if (event.type !== 'system:heartbeat') {
    console.log(`[EventBus] ${event.type}`);
  }
});

// Listen for new proofs from agents
io.on('connection', (socket) => {
  // This is handled per-socket above
});

// Broadcast proof updates periodically
setInterval(() => {
  const proofs = getProofsForDashboard(10);
  if (proofs.length > 0) {
    io.emit('ai_proofs', proofs);
  }
}, 5000);

// ── REST API ───────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    ...daoState,
    agents: Object.entries(agents).map(([id, a]) => ({
      id, name: a.name, role: a.role, status: a.status, task: a.currentTask,
    })),
    blockchain: getMonitoringStatus(),
    aiMode: aiReady ? 'gemini' : 'fallback',
    uptime: process.uptime(),
  });
});

app.get('/api/proofs', (req, res) => {
  res.json(getProofsForDashboard(20));
});

// ── Start Server ───────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  // Init memory (may fail gracefully if better-sqlite3 not available)
  await initMemoryStore();

  // Start all agents (subscribe to events)
  Object.values(agents).forEach(agent => agent.start());
  console.log('[Server] All 6 autonomous agents activated');

  // Start blockchain monitor (real or synthetic)
  await initBlockchainMonitor({
    rpcUrl: process.env.ETH_RPC_URL,
    proposalAddress: process.env.PROPOSAL_CONTRACT,
    treasuryAddress: process.env.TREASURY_CONTRACT,
  });

  server.listen(PORT, () => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  DARI Autonomous AI Governance Server`);
    console.log(`  Port: ${PORT}`);
    console.log(`  AI: ${aiReady ? 'Gemini 2.0 Flash' : 'Structured Fallback'}`);
    console.log(`  Agents: 6 autonomous agents online`);
    console.log(`  Events: Real-time event bus active`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
}

start().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
