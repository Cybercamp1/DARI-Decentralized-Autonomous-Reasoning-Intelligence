# 🏙️ DARI: AI-Civilization-OS

**DARI** is a Next-Generation Autonomous AI Governance Intelligence System. It transforms traditional DAO governance into a real-time, event-driven autonomous civilization where AI agents independently monitor, analyze, and coordinate governance actions.

## 🚀 Key Features

- **True Autonomous Intelligence**: Powered by **Gemini 2.0 Flash**, agents perform real-time reasoning on actual blockchain events.
- **Event-Driven Architecture**: Agents react to `ProposalCreated`, `VoteCast`, and `TreasuryTransfer` events published on a central Event Bus.
- **Multi-Agent Orchestration**: 6 specialized agents (Security, Strategy, Treasury, Market, Governance, Analysis) coordinate through a shared memory system.
- **Proof-of-Work Tracking**: Every AI task generates a verifiable SHA-256 hash derived from the reasoning data.
- **Cyberpunk UI**: Immersive terminal-style interface for monitoring the "Hacker Office" and live AI coordination logs.

## ⚡ Real-Time Event-Driven Engine

Unlike traditional governance dashboards that rely on static data or simulated loops, **DARI operates on a live, event-driven architecture**:

1.  **Instant Event Detection**: Every on-chain event (or synthetic trigger) is captured by the `BlockchainMonitor` and injected into the system within milliseconds.
2.  **Autonomous Reactive Agents**: Agents do not sleep; they "listen." When a `ProposalCreated` or `SecurityAlert` event occurs, the relevant AI agents activate immediately to begin analysis.
3.  **WebSocket Synchronization**: Using **Socket.IO**, the backend pushes state changes, logs, and AI proofs to the frontend in real time. The dashboard you see is a live reflection of the AI Civilization's current state.
4.  **Continuous Proof of Work**: As the AI reasons, SHA-256 proofs are generated and streamed to the UI, providing a verifiable and live audit trail of every autonomous decision.


## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS + Framer Motion (Cyberpunk Visualization)
- **Backend**: Node.js + Express + Socket.IO (Orchestration & Event Bus)
- **AI Engine**: Gemini 2.0 Flash (Real-time Reasoning)
- **Persistence**: JSON-based File Memory (Pure JS, no native deps)
- **Blockchain**: ethers.js (Real-time Monitoring & Event Simulation)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+
- Gemini API Key

### 1. Clone & Install
```bash
git clone <repository-url>
cd ai_civilization
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## 🌐 Deployment Guide

### Smart Contract (SecureChain AI)
The contracts are located in `contracts/contracts/`.
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Copy `ProposalManager.sol` and `Treasury.sol`.
3. Compile using Solidity 0.8.19.
4. Set Environment to "Injected Provider - MetaMask".
5. Connect to **SecureChain AI Mainnet**.
6. Deploy and save the addresses.

### Live DApp (Vercel)
The frontend is optimized for Vercel deployment.
1. Connect your GitHub repo to Vercel.
2. Set the Root Directory to `frontend`.
3. Set the Environment Variable `VITE_SOCKET_URL` to your backend URL.
4. Deploy.

## 🤖 AI Agents
1. **Proposal Analysis Agent**: Evaluates treasury impact and approval probability.
2. **Security Intelligence Agent**: Scans calldata for malicious patterns and monitors whale wallets.
3. **Governance Validation Agent**: Simulates contract calls and verifies compliance rules.
4. **DAO Strategy Agent**: Optimizes participation and coordinates AI consensus.
5. **Market Intelligence Agent**: Tracks ETH volatility and whale movements.
6. **Treasury Operations Agent**: Monitored reserves and calculates financial runway.

## 📜 Commands
Type these into the dashboard terminal:
- `/create proposal <desc>`: Initiate a new governance proposal.
- `/vote <id> yes/no`: Cast a simulated/real vote.
- `/check treasury`: Detailed audit of DAO reserves.
- `/scan`: Targeted security scan of the network.
- `/status`: Summary of the entire AI civilization state.

---
**Build for the future of decentralized coordination.**
