-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 001_schema.sql
-- Fecha: 2026-08-04
-- Descripción: Creación de tablas, índices y triggers del sistema
-- ==============================================================================

-- Trigger general para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Centros de salud
CREATE TABLE health_centers (
    id TEXT PRIMARY KEY, -- Ej: 'BAR-CS-001'
    name TEXT NOT NULL,
    municipality TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Barinas',
    address TEXT,
    phone TEXT,
    center_type TEXT NOT NULL CHECK (center_type IN ('ambulatorio', 'hospital', 'CDI', 'SRI', 'consultorio')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Perfiles de usuario (Extiende auth.users de Supabase)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    cedula TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'medico', 'enfermero', 'recepcion')),
    health_center_id TEXT NOT NULL REFERENCES health_centers(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula TEXT NOT NULL UNIQUE, -- (format: V12345678, E87654321, V20111222-01)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone TEXT,
    address TEXT,
    municipality TEXT,
    state TEXT DEFAULT 'Barinas',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    parent_id UUID REFERENCES patients(id), -- Para menores
    is_minor BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at en pacientes
CREATE TRIGGER trigger_update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- 4. Registros médicos (INMUTABLE)
CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    health_center_id TEXT NOT NULL REFERENCES health_centers(id),
    attending_user_id UUID NOT NULL REFERENCES user_profiles(id),
    record_type TEXT NOT NULL DEFAULT 'consulta' CHECK (record_type IN ('consulta', 'emergencia', 'control', 'referencia')),
    blood_pressure_sys INT,
    blood_pressure_dia INT,
    heart_rate INT,
    temperature NUMERIC(4,1),
    weight NUMERIC(5,1),
    height NUMERIC(4,1),
    oxygen_sat INT,
    reason TEXT NOT NULL,
    current_illness TEXT,
    physical_exam TEXT,
    diagnosis TEXT NOT NULL,
    diagnosis_code TEXT,
    treatment TEXT,
    observations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Log de auditoría (INMUTABLE)
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'SEARCH', 'LOGIN')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('patient', 'medical_record', 'user')),
    entity_id TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    health_center_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Migración de IDs de menores
CREATE TABLE id_migration_log (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    old_cedula TEXT NOT NULL,
    new_cedula TEXT NOT NULL,
    migrated_by UUID NOT NULL REFERENCES user_profiles(id),
    migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices necesarios
CREATE INDEX idx_user_profiles_health_center ON user_profiles(health_center_id);
CREATE INDEX idx_patients_parent ON patients(parent_id);
CREATE INDEX idx_patients_cedula_prefix ON patients (cedula text_pattern_ops);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_center ON medical_records(health_center_id);
CREATE INDEX idx_medical_records_user ON medical_records(attending_user_id);
CREATE INDEX idx_medical_records_created_at ON medical_records(created_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
