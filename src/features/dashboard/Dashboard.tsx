import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../lib/db';
import { AnimalFormModal } from '../animals/components/AnimalFormModal';
import { Search, Plus, Activity, ClipboardList, AlertTriangle, Users } from 'lucide-react';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Animals
  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: async () => {
      try {
        const res = await db.query(`SELECT * FROM animals WHERE is_deleted = false ORDER BY name ASC`);
        return res.rows;
      } catch (e) {
        console.error('Failed to fetch animals', e);
        return [];
      }
    }
  });

  // 2. Fetch Pending Tasks
  const { data: pendingTasks = [] } = useQuery({
    queryKey: ['dashboard_tasks'],
    queryFn: async () => {
      try {
        const res = await db.query(`SELECT * FROM tasks WHERE status = 'PENDING' AND is_deleted = false`);
        return res.rows;
      } catch (e) { 
        return []; 
      }
    }
  });

  // 3. Fetch Open Incidents
  const { data: openIncidents = [] } = useQuery({
    queryKey: ['dashboard_incidents'],
    queryFn: async () => {
      try {
        const res = await db.query(`SELECT * FROM safety_incidents WHERE status = 'OPEN' AND is_deleted = false`);
        return res.rows;
      } catch (e) { 
        return []; 
      }
    }
  });

  // 4. Fetch Active Shifts
  const { data: activeShifts = [] } = useQuery({
    queryKey: ['dashboard_shifts'],
    queryFn: async () => {
      try {
        const res = await db.query(`SELECT * FROM timesheets WHERE clock_out_time IS NULL AND is_deleted = false`);
        return res.rows;
      } catch (e) { 
        return []; 
      }
    }
  });

  // Filter roster based on search
  const filteredAnimals = animals.filter((a: any) => 
    (a.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (a.species?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
      <div className={`p-3 rounded-xl bg-slate-800 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Command Center</h1>
          <p className="text-sm text-slate-400 font-medium">Live facility overview and roster management.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Plus size={16} /> New Animal
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Roster" value={animals.length} icon={Users} color="text-blue-400" />
        <StatCard title="Pending Tasks" value={pendingTasks.length} icon={ClipboardList} color="text-amber-400" />
        <StatCard title="Open Incidents" value={openIncidents.length} icon={AlertTriangle} color="text-rose-400" />
        <StatCard title="Active Shifts" value={activeShifts.length} icon={Activity} color="text-emerald-400" />
      </div>

      {/* Roster Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Clinical Roster</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search animals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0A0B0E] border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors w-64 placeholder-slate-600"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {filteredAnimals.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-medium text-sm space-y-2">
              <Users size={32} className="text-slate-700" />
              <p>No animals found in local database.</p>
            </div>
          ) : (
            filteredAnimals.map((animal: any) => (
              <div key={animal.id} className="flex items-center justify-between p-4 bg-[#0A0B0E] border border-slate-800/50 rounded-xl hover:border-slate-700 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-emerald-500 uppercase">
                    {animal.name ? animal.name.substring(0, 2) : 'UK'}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{animal.name || 'Unnamed'}</h3>
                    <p className="text-xs text-slate-500">{animal.species}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Location</p>
                    <p className="text-slate-300 font-medium">{animal.location || 'Unknown'}</p>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Category</p>
                    <p className="text-slate-300 font-medium truncate">{animal.category || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Entry Uplink - Renders when isModalOpen is true */}
      {isModalOpen && (
        <AnimalFormModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}