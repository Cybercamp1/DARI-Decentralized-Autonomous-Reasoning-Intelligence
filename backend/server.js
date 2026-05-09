const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// Serve Static Frontend Build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA Wildcard Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const { agents } = require('./agents/AgentManager');

let logs = [];

// Main Simulation Loop
setInterval(() => {
  // Update Agent Positions & trigger thinking
  agents.forEach(agent => {
    // Movement simulation
    const dx = (Math.random() - 0.5) * 15;
    const dy = (Math.random() - 0.5) * 15;
    agent.pos.x = Math.min(Math.max(agent.pos.x + dx, 50), 1150);
    agent.pos.y = Math.min(Math.max(agent.pos.y + dy, 50), 750);

    // Random Thinking
    if (Math.random() > 0.95 && agent.status !== 'thinking') {
      agent.think({ asset: 'ETH', blockHeight: 19842042 });
    }
  });

  io.emit('agent_update', agents.map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    status: a.status,
    pos: a.pos
  })));
}, 1000);

// Log listener for agent insights
agents.forEach(agent => {
  agent.on('insight', ({ insight }) => {
    const newLog = {
      id: Date.now() + Math.random(),
      type: 'agent_insight',
      message: `[${agent.name}] ${insight}`,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    if (logs.length > 50) logs.shift();
    io.emit('new_log', newLog);
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.emit('initial_state', { 
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      pos: a.pos
    })), 
    logs 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`DariDAO Backend listening on port ${PORT}`);
});
