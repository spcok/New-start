import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { useSyncStore } from '../store/syncStore';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { status, initialize } = useSyncStore();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function boot() {
      await db.waitReady;
      setDbReady(true);
      initialize();
    }
    boot();
  }, [initialize]);

  if (!dbReady) {
    return <div className="p-4">Loading database...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-300 overflow-hidden border-4 border-slate-800">
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded text-slate-900 font-bold">
            V1
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider uppercase">VetEngine Core v3.0</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Phase: Router & Cache</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <span className={status === 'ready' ? 'text-emerald-400' : 'text-blue-400'}>
            SYNC: {status.toUpperCase()}
          </span>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        <div className="col-span-3 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-4">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-1">Database Stats</h2>
          <div className="text-[10px] text-slate-400 font-mono">18 Tables Synced</div>
        </div>
        <div className="col-span-9 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Foundation Ready</span>
      </footer>
    </div>
  );
}
