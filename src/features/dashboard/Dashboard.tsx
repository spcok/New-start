import { useQuery } from '@tanstack/react-query';
import { db } from '../../lib/db';
import { useState } from 'react';

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const [animals, tasks, incidents, timesheets] = await Promise.all([
          db.query('SELECT count(*) FROM animals WHERE is_deleted = false'),
          db.query('SELECT count(*) FROM tasks WHERE status = \'PENDING\' AND is_deleted = false'),
          db.query('SELECT count(*) FROM safety_incidents WHERE status != \'CLOSED\' AND is_deleted = false'),
          db.query('SELECT count(*) FROM timesheets WHERE clock_out_time IS NULL AND is_deleted = false')
        ]);
        
        return {
          animals: (animals.rows[0] as any).count,
          tasks: (tasks.rows[0] as any).count,
          incidents: (incidents.rows[0] as any).count,
          shifts: (timesheets.rows[0] as any).count,
        };
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
        return { animals: 0, tasks: 0, incidents: 0, shifts: 0 };
      }
    }
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals', searchTerm],
    queryFn: async () => {
      try {
        const query = searchTerm 
          ? `SELECT id, name, species, category FROM animals WHERE name ILIKE '%${searchTerm}%' AND is_deleted = false`
          : 'SELECT id, name, species, category FROM animals WHERE is_deleted = false';
        const res = await db.query(query);
        return res.rows as any[];
      } catch (e) {
        console.error('Failed to fetch animals', e);
        return [];
      }
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-sm">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Active Roster</div>
          <div className="text-2xl font-mono text-white mt-1">{stats?.animals || 0}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-sm">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Pending Tasks</div>
          <div className="text-2xl font-mono text-white mt-1">{stats?.tasks || 0}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-sm">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Open Incidents</div>
          <div className="text-2xl font-mono text-white mt-1">{stats?.incidents || 0}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-700 rounded-sm">
          <div className="text-[10px] uppercase text-slate-500 font-bold">Active Shifts</div>
          <div className="text-2xl font-mono text-white mt-1">{stats?.shifts || 0}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-sm p-4">
        <input
          type="text"
          placeholder="Search roster..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white mb-4"
        />
        <div className="grid grid-cols-1 gap-2">
          {animals.map((animal: any) => (
            <div key={animal.id} className="flex justify-between items-center p-2 border-b border-slate-800 last:border-0 hover:bg-slate-800">
              <span className="text-sm font-medium">{animal.name}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{animal.species} • {animal.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
