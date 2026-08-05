-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 002_ehr_phase1.sql
-- Fecha: 2026-08-04
-- Descripción: Expansión de la tabla 'patients' para soportar Estándares HCEN (Fase 1)
-- ==============================================================================

-- Añadir nuevas columnas a la tabla patients
ALTER TABLE patients
    ADD COLUMN insurance_number TEXT,
    ADD COLUMN assigned_center_id TEXT REFERENCES health_centers(id),
    ADD COLUMN assigned_doctor_id UUID REFERENCES user_profiles(id),
    ADD COLUMN disabilities JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN surgeries JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN implants JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN family_history JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN organ_donor BOOLEAN DEFAULT false;

-- Crear índices para búsquedas por centro y médico asignado
CREATE INDEX idx_patients_assigned_center ON patients(assigned_center_id);
CREATE INDEX idx_patients_assigned_doctor ON patients(assigned_doctor_id);
