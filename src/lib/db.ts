import { PGlite } from "@electric-sql/pglite";
import { electricSync } from "@electric-sql/pglite-sync";

export const db = new PGlite({
  extensions: {
    electric: electricSync(),
  },
});

export async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS animals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type TEXT NOT NULL,
      parent_mob_id UUID,
      census_count INTEGER NOT NULL,
      name TEXT,
      species TEXT,
      latin_name TEXT,
      category TEXT,
      location TEXT,
      image_url TEXT,
      distribution_map_url TEXT,
      hazard_rating TEXT,
      is_venomous BOOLEAN NOT NULL DEFAULT false,
      weight_unit TEXT NOT NULL,
      flying_weight_g NUMERIC,
      winter_weight_g NUMERIC,
      average_target_weight NUMERIC,
      date_of_birth DATE,
      is_dob_unknown BOOLEAN NOT NULL DEFAULT false,
      gender TEXT,
      microchip_id TEXT,
      ring_number TEXT,
      has_no_id BOOLEAN NOT NULL DEFAULT false,
      red_list_status TEXT NOT NULL,
      description TEXT,
      special_requirements TEXT,
      critical_husbandry_notes TEXT,
      ambient_temp_only BOOLEAN NOT NULL DEFAULT false,
      target_day_temp_c NUMERIC,
      target_night_temp_c NUMERIC,
      water_tipping_temp NUMERIC,
      target_humidity_min_percent NUMERIC,
      target_humidity_max_percent NUMERIC,
      misting_frequency TEXT,
      acquisition_date DATE,
      acquisition_type TEXT,
      origin TEXT,
      origin_location TEXT,
      lineage_unknown BOOLEAN NOT NULL DEFAULT false,
      sire_id UUID,
      dam_id UUID,
      is_boarding BOOLEAN NOT NULL DEFAULT false,
      is_quarantine BOOLEAN NOT NULL DEFAULT false,
      display_order INTEGER NOT NULL,
      archived BOOLEAN NOT NULL DEFAULT false,
      archive_reason TEXT,
      archive_type TEXT,
      archived_at TIMESTAMPTZ,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      sign_content TEXT
    );

    CREATE TABLE IF NOT EXISTS clinical_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      record_id UUID NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_url TEXT NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS clinical_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      animal_id UUID NOT NULL,
      record_type TEXT NOT NULL,
      record_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      soap_subjective TEXT NOT NULL,
      soap_objective TEXT NOT NULL,
      soap_assessment TEXT NOT NULL,
      soap_plan TEXT NOT NULL,
      weight_grams NUMERIC NOT NULL,
      conductor_role TEXT NOT NULL,
      conducted_by UUID NOT NULL,
      external_vet_name TEXT NOT NULL,
      external_vet_clinic TEXT NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID NOT NULL,
      modified_by UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS clinical_schedule (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      animal_id UUID NOT NULL,
      schedule_type TEXT NOT NULL,
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      frequency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      assigned_to UUID NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID NOT NULL,
      modified_by UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      animal_id UUID NOT NULL,
      log_type TEXT NOT NULL,
      log_date TIMESTAMPTZ NOT NULL,
      notes TEXT,
      weight_grams NUMERIC,
      weight_unit TEXT,
      basking_temp_c NUMERIC,
      cool_temp_c NUMERIC,
      temperature_c NUMERIC,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS daily_rounds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      animal_id UUID NOT NULL,
      date DATE NOT NULL,
      shift TEXT NOT NULL,
      section TEXT,
      is_alive BOOLEAN NOT NULL DEFAULT false,
      water_checked BOOLEAN NOT NULL DEFAULT false,
      locks_secured BOOLEAN NOT NULL DEFAULT false,
      animal_issue_note TEXT,
      general_section_note TEXT,
      completed_by UUID NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS feeding_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      animal_id UUID NOT NULL,
      scheduled_date DATE NOT NULL,
      food_type TEXT NOT NULL,
      quantity NUMERIC NOT NULL,
      calci_dust BOOLEAN NOT NULL DEFAULT false,
      additional_notes TEXT,
      is_completed BOOLEAN NOT NULL DEFAULT false,
      completed_at TIMESTAMPTZ,
      completed_by UUID,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      next_feed_date DATE,
      interval_days INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS fire_drill_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      drill_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      drill_type TEXT NOT NULL,
      areas_involved TEXT NOT NULL,
      evacuation_duration TEXT NOT NULL,
      roll_call_completed BOOLEAN NOT NULL DEFAULT false,
      issues_observed TEXT,
      corrective_actions TEXT,
      status TEXT NOT NULL,
      conducted_by UUID,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      person_involved_name TEXT NOT NULL,
      person_type TEXT NOT NULL,
      location TEXT NOT NULL,
      incident_description TEXT,
      injury_details TEXT,
      treatment_provided TEXT,
      outcome TEXT NOT NULL,
      is_riddor_reportable BOOLEAN NOT NULL DEFAULT false,
      witness_details TEXT,
      animal_involved BOOLEAN NOT NULL DEFAULT false,
      linked_animal_id UUID,
      assigned_to UUID,
      reported_by UUID,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS isolation_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      animal_id UUID NOT NULL,
      isolation_type TEXT NOT NULL,
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      end_date DATE NOT NULL,
      location TEXT NOT NULL,
      reason_notes TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      authorized_by UUID NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID NOT NULL,
      modified_by UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS maintenance_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      location TEXT NOT NULL,
      equipment_tag TEXT,
      assigned_to UUID,
      reported_by UUID,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      schedule_id UUID NOT NULL,
      animal_id UUID NOT NULL,
      administered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      administered_by UUID NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID NOT NULL,
      modified_by UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS operational_lists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      role TEXT NOT NULL,
      permission TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS safety_incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      title TEXT NOT NULL,
      incident_type TEXT NOT NULL,
      severity_level TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      immediate_action_taken TEXT,
      animal_involved BOOLEAN NOT NULL DEFAULT false,
      linked_animal_id UUID,
      first_aid_required BOOLEAN NOT NULL DEFAULT false,
      root_cause TEXT,
      preventative_action TEXT,
      status TEXT NOT NULL,
      reported_by UUID,
      assigned_to UUID,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      assigned_to UUID,
      due_date DATE,
      task_type TEXT,
      status TEXT DEFAULT 'PENDING',
      completed_at TIMESTAMPTZ,
      completed_by UUID,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      location TEXT,
      priority TEXT NOT NULL DEFAULT 'MEDIUM'
    );

    CREATE TABLE IF NOT EXISTS timesheets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      shift_date DATE NOT NULL,
      clock_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      clock_out_time TIMESTAMPTZ,
      status TEXT NOT NULL,
      notes TEXT,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_by UUID,
      modified_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT,
      name TEXT,
      initials TEXT,
      role TEXT DEFAULT 'STAFF',
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}
