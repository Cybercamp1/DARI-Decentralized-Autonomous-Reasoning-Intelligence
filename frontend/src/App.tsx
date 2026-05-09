import { useEffect } from 'react';
import { useDaoStore } from './store';
import PixelOffice from './city/PixelOffice';
import GovernanceChat from './ai/GovernanceChat';

function App() {
  const { connect } = useDaoStore();

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="h-screen w-screen bg-[#050505] text-white overflow-hidden font-mono flex">
      {/* ── LEFT: The Office Simulation (60%) ── */}
      <div className="w-[60%] h-full relative">
        <PixelOffice />
      </div>

      {/* ── RIGHT: Governance Chat (40%) ── */}
      <div className="w-[40%] h-full relative">
        <GovernanceChat />
      </div>
    </div>
  );
}

export default App;
