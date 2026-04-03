'use client';

import dynamic from 'next/dynamic';
import { useRunPlannerState } from '../hooks/useRunPlannerState';
import { RunPlannerContext } from '../context/RunPlannerContext';
import Sidebar from './Sidebar';
import FloatingStats from './FloatingStats';
import '../styles/RunPlanner.scss';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function RunPlanner() {
  const plannerState = useRunPlannerState();
  const { sidebarOpen, setSidebarOpen } = plannerState;

  return (
    <RunPlannerContext.Provider value={plannerState}>
      {sidebarOpen && <div className="menu-backdrop" onClick={() => setSidebarOpen(false)} />}

      <Sidebar />

      <Map />

      <FloatingStats />

      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </RunPlannerContext.Provider>
  );
}
