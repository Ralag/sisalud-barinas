-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 005_expanded_registry.sql
-- Fecha: 2026-08-05
-- Descripción: Expansión de la tabla patients para incluir programas de salud, 
--              determinantes sociales y campos faltantes del HCEN.
-- ==============================================================================

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS organ_donor BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS disabilities JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS family_history JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS surgeries JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS implants JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS assigned_center_id TEXT REFERENCES health_centers(id),
    ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES user_profiles(id),
    ADD COLUMN IF NOT EXISTS social_determinants JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS health_programs JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS sensitive_programs JSONB DEFAULT '{}'::jsonb;

-- Índices GIN para facilitar búsquedas dentro de los JSONB si se requiere a futuro
CREATE INDEX IF NOT EXISTS idx_patients_health_programs ON patients USING GIN (health_programs);
CREATE INDEX IF NOT EXISTS idx_patients_social_determinants ON patients USING GIN (social_determinants);
