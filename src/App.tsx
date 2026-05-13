import { useEffect } from 'react';
import { useSyncStore } from './store/syncStore';

export default function App() {
  const { status, error, initialize } = useSyncStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans text-slate-300 overflow-hidden border-4 border-slate-800">
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded text-slate-900 font-bold">
            V1
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider uppercase">VetEngine Core v3.0</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Phase: Foundation & Sync Protocol</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-sm w-full max-w-md text-center">
          <h1 className="text-xl font-bold mb-4">Clinical Vet System</h1>
          <div className="text-sm">
            <strong>Sync Status:</strong> <span className="font-mono text-emerald-400">{status}</span>
          </div>
          {error && <div className="text-red-500 mt-2">Error: {error}</div>}
          {status === 'ready' && <div className="text-emerald-500 mt-2 font-bold uppercase tracking-widest text-xs">System Ready</div>}
        </div>
      </main>

      <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-500">Foundation ready for UI integration.</span>
      </footer>
    </div>
  );
}
