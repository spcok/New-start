import { create } from 'zustand';
import { db, initDb } from '../lib/db';

interface SyncState {
  status: 'initializing' | 'ready' | 'syncing' | 'error';
  error: string | null;
  initialize: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'initializing',
  error: null,
  initialize: async () => {
    try {
      await db.waitReady;
      await initDb();

      set({ status: 'syncing' });

      const tables = [
        'animals', 'clinical_attachments', 'clinical_records', 'clinical_schedule',
        'daily_logs', 'daily_rounds', 'feeding_schedules', 'fire_drill_logs',
        'incidents', 'isolation_logs', 'maintenance_tickets', 'medication_logs',
        'operational_lists', 'role_permissions', 'safety_incidents', 'tasks',
        'timesheets', 'users'
      ];

      await Promise.all(tables.map(table =>
        db.electric.syncShapeToTable({
          url: `https://xpodjreg4ltb.share.zrok.io/v1/shape/${table}`,
          table: table,
          primaryKey: ['id']
        })
      ));

      set({ status: 'ready' });
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Unknown sync error' });
    }
  }
}));
