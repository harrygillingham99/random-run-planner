'use client';

import dynamic from 'next/dynamic';
import { useRunPlannerState } from '../hooks/useRunPlannerState';
import { RunPlannerContext } from '../context/RunPlannerContext';
import Sidebar from './Sidebar';
import FloatingStats from './FloatingStats';
import styles from 'styles/RunPlanner.module.scss';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function RunPlanner() {
  const plannerState = useRunPlannerState();
  const { sidebarOpen, setSidebarOpen } = plannerState;

  return (
    <RunPlannerContext.Provider value={plannerState}>
      <div className={styles.layout}>
        {sidebarOpen && (
          <div className={styles.menuBackdrop} onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar />

        <Map />

        <FloatingStats />

        <button
          className={styles.menuToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
    </RunPlannerContext.Provider>
  );
}
