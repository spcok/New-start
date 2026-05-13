import { PGlite } from '@electric-sql/pglite';
import { electricSync } from '@electric-sql/pglite-sync';

class DatabaseService {
  public pg: PGlite;
  public waitReady: Promise<void>;

  constructor() {
    this.pg = new PGlite('idb://koa-local-db', {
      extensions: {
        sync: electricSync()
      }
    });
    this.waitReady = this.initDb();
  }

  private async initDb() {
    try {
      await this.pg.waitReady;
      console.log('⏳ [DB] Booting local IndexedDB vault...');

      // Split into individual executions to prevent a single typo 
      // from rolling back the entire database.
      const schemas = [
        `CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY NOT NULL,
          email text,
          name text,
          full_name text,
          initials text,
          role text DEFAULT 'STAFF',
          is_deleted boolean NOT NULL DEFAULT false,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS animals (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          entity_type text NOT NULL,
          parent_mob_id uuid,
          census_count integer NOT NULL,
          name text,
          species text,
          latin_name text,
          category text,
          location text,
          image_url text,
          distribution_map_url text,
          hazard_rating text,
          is_venomous boolean NOT NULL DEFAULT false,
          weight_unit text NOT NULL,
          flying_weight_g numeric,
          winter_weight_g numeric,
          average_target_weight numeric,
          date_of_birth date,
          is_dob_unknown boolean NOT NULL DEFAULT false,
          gender text,
          microchip_id text,
          ring_number text,
          has_no_id boolean NOT NULL DEFAULT false,
          red_list_status text NOT NULL,
          description text,
          special_requirements text,
          critical_husbandry_notes text,
          ambient_temp_only boolean NOT NULL DEFAULT false,
          target_day_temp_c numeric,
          target_night_temp_c numeric,
          water_tipping_temp numeric,
          target_humidity_min_percent numeric,
          target_humidity_max_percent numeric,
          misting_frequency text,
          acquisition_date date,
          acquisition_type text,
          origin text,
          origin_location text,
          lineage_unknown boolean NOT NULL DEFAULT false,
          sire_id uuid,
          dam_id uuid,
          is_boarding boolean NOT NULL DEFAULT false,
          is_quarantine boolean NOT NULL DEFAULT false,
          display_order integer NOT NULL DEFAULT 0,
          archived boolean NOT NULL DEFAULT false,
          archive_reason text,
          archive_type text,
          archived_at timestamp with time zone,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now(),
          sign_content text
        );`,

        `CREATE TABLE IF NOT EXISTS daily_logs (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          animal_id uuid NOT NULL,
          log_type text NOT NULL DEFAULT 'GENERAL',
          log_date timestamp with time zone NOT NULL DEFAULT now(),
          notes text,
          weight_grams numeric,
          weight_unit text,
          basking_temp_c numeric,
          cool_temp_c numeric,
          temperature_c numeric,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS daily_rounds (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          animal_id uuid NOT NULL,
          date date NOT NULL,
          shift text NOT NULL,
          section text,
          is_alive boolean NOT NULL DEFAULT true,
          water_checked boolean NOT NULL DEFAULT false,
          locks_secured boolean NOT NULL DEFAULT false,
          animal_issue_note text,
          general_section_note text,
          completed_by uuid,
          completed_at timestamp with time zone,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS feeding_schedules (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          animal_id uuid NOT NULL,
          scheduled_date date NOT NULL,
          food_type text NOT NULL,
          quantity numeric NOT NULL,
          calci_dust boolean NOT NULL DEFAULT false,
          additional_notes text,
          is_completed boolean NOT NULL DEFAULT false,
          completed_at timestamp with time zone,
          completed_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now(),
          next_feed_date date,
          interval_days integer DEFAULT 1
        );`,

        `CREATE TABLE IF NOT EXISTS clinical_schedule (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          animal_id uuid NOT NULL,
          schedule_type text NOT NULL,
          title text NOT NULL,
          start_date date NOT NULL,
          end_date date NOT NULL,
          frequency text NOT NULL,
          status text NOT NULL DEFAULT 'ACTIVE',
          assigned_to uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS clinical_records (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          animal_id uuid NOT NULL,
          record_type text NOT NULL,
          record_date timestamp with time zone NOT NULL DEFAULT now(),
          soap_subjective text NOT NULL,
          soap_objective text NOT NULL,
          soap_assessment text NOT NULL,
          soap_plan text NOT NULL,
          weight_grams numeric NOT NULL,
          conductor_role text NOT NULL,
          conducted_by uuid,
          external_vet_name text NOT NULL,
          external_vet_clinic text NOT NULL,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS clinical_attachments (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          record_id uuid NOT NULL,
          file_name text NOT NULL,
          file_type text NOT NULL,
          file_url text NOT NULL,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS timesheets (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          user_id uuid,
          shift_date date NOT NULL,
          clock_in_time timestamp with time zone NOT NULL DEFAULT now(),
          clock_out_time timestamp with time zone,
          status text NOT NULL,
          notes text,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS tasks (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          title text NOT NULL,
          description text,
          assigned_to uuid,
          due_date date,
          task_type text,
          status text DEFAULT 'PENDING',
          completed_at timestamp with time zone,
          completed_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now(),
          location text,
          priority text NOT NULL DEFAULT 'MEDIUM'
        );`,

        `CREATE TABLE IF NOT EXISTS safety_incidents (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          incident_date timestamp with time zone NOT NULL DEFAULT now(),
          title text NOT NULL DEFAULT 'Safety Incident',
          incident_type text NOT NULL,
          severity_level text NOT NULL,
          location text NOT NULL,
          description text,
          immediate_action_taken text,
          animal_involved boolean NOT NULL DEFAULT false,
          linked_animal_id uuid,
          first_aid_required boolean NOT NULL DEFAULT false,
          root_cause text,
          preventative_action text,
          status text NOT NULL DEFAULT 'OPEN',
          reported_by uuid,
          assigned_to uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS fire_drill_logs (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          drill_date timestamp with time zone NOT NULL DEFAULT now(),
          drill_type text NOT NULL,
          areas_involved text NOT NULL,
          evacuation_duration text NOT NULL,
          roll_call_completed boolean NOT NULL DEFAULT false,
          issues_observed text,
          corrective_actions text,
          status text NOT NULL,
          conducted_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS incidents (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          incident_date timestamp with time zone NOT NULL DEFAULT now(),
          person_involved_name text NOT NULL,
          person_type text NOT NULL,
          location text NOT NULL,
          incident_description text,
          injury_details text,
          treatment_provided text,
          outcome text NOT NULL,
          is_riddor_reportable boolean NOT NULL DEFAULT false,
          witness_details text,
          animal_involved boolean NOT NULL DEFAULT false,
          linked_animal_id uuid,
          assigned_to uuid,
          reported_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS isolation_logs (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          animal_id uuid NOT NULL,
          isolation_type text NOT NULL,
          start_date date NOT NULL DEFAULT CURRENT_DATE,
          end_date date,
          location text NOT NULL,
          reason_notes text NOT NULL,
          status text NOT NULL DEFAULT 'ACTIVE',
          authorized_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS maintenance_tickets (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          title text NOT NULL,
          description text,
          category text NOT NULL,
          status text NOT NULL,
          priority text NOT NULL,
          location text NOT NULL,
          equipment_tag text,
          assigned_to uuid,
          reported_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS medication_logs (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          schedule_id uuid NOT NULL,
          animal_id uuid NOT NULL,
          administered_at timestamp with time zone NOT NULL DEFAULT now(),
          status text NOT NULL,
          notes text,
          administered_by uuid,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS operational_lists (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          name text NOT NULL,
          description text,
          category text,
          is_deleted boolean NOT NULL DEFAULT false,
          created_by uuid,
          modified_by uuid,
          created_at timestamp with time zone NOT NULL DEFAULT now(),
          updated_at timestamp with time zone NOT NULL DEFAULT now()
        );`,

        `CREATE TABLE IF NOT EXISTS role_permissions (
          id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
          role text NOT NULL,
          permission text NOT NULL
        );`
      ];

      for (let i = 0; i < schemas.length; i++) {
        try {
          await this.pg.exec(schemas[i]);
        } catch (e: any) {
          console.error(`🚨 [DB] Schema ${i + 1} Failed: `, e.message);
        }
      }

      // Verify what successfully built
      const res = await this.pg.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
      const tables = res.rows.map((r: any) => r.tablename);
      console.log(`✅ [DB] Successfully built ${tables.length} tables: `, tables.join(', '));

      // Indexes
      await this.pg.exec(`
        CREATE INDEX IF NOT EXISTS idx_animals_is_deleted ON animals(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_timesheets_user_date ON timesheets(user_id, shift_date);
      `);

    } catch (error) {
      console.error('🚨 [DB] Fatal Error during init:', error);
      throw error;
    }
  }

  public async query(sql: string, params?: any[]) {
    await this.waitReady;
    return this.pg.query(sql, params);
  }
}

// ============================================================================
// 🚀 THE VITE HMR LOCK FIX
// Prevent Vite from creating multiple locked instances of PGlite on file save
// ============================================================================
const globalForDb = globalThis as unknown as { __koaDb: DatabaseService };

export const db = globalForDb.__koaDb || new DatabaseService();

if (import.meta.env.DEV) {
  globalForDb.__koaDb = db;
}