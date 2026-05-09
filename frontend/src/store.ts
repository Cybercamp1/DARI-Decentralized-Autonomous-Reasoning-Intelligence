import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  pos: { x: number; y: number };
}

interface Log {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface DaoState {
  agents: Agent[];
  logs: Log[];
  socket: Socket | null;
  setAgents: (agents: Agent[]) => void;
  addLog: (log: Log) => void;
  connect: () => void;
}

export const useDaoStore = create<DaoState>((set, get) => ({
  agents: [],
  logs: [],
  socket: null,
  setAgents: (agents) => set({ agents }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 50) })),
  connect: () => {
    const socket = io(window.location.origin);
    
    socket.on('initial_state', (data) => {
      set({ agents: data.agents, logs: data.logs });
    });

    socket.on('agent_update', (agents) => {
      set({ agents });
    });

    socket.on('new_log', (log) => {
      get().addLog(log);
    });

    set({ socket });
  },
}));
