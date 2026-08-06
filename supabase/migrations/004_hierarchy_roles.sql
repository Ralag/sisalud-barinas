-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 004_hierarchy_roles.sql
-- Fecha: 2026-08-05
-- Descripción: Implementación de Jerarquía Territorial, PractitionerRole (Asignaciones),
--              Motor de Confidencialidad, y Auditoría Forense
-- ==============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  1. JERARQUÍA TERRITORIAL E INSTITUCIONAL                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 1a. Tabla ASICs (Áreas de Salud Integral Comunitaria)
CREATE TABLE asics (
    id TEXT PRIMARY KEY, -- Ej: ASIC-BAR-01
    name TEXT NOT NULL,
    municipality TEXT NOT NULL,
    parish TEXT,
    state TEXT NOT NULL DEFAULT 'Barinas',
    headquarters_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar datos iniciales de ejemplo (Barinas tiene 17, insertamos algunas)
INSERT INTO asics (id, name, municipality, parish) VALUES
('ASIC-BAR-01', 'ASIC Corazón de Jesús', 'Barinas', 'Corazón de Jesús'),
('ASIC-BAR-02', 'ASIC Alto Barinas', 'Barinas', 'Alto Barinas'),
('ASIC-BAR-03', 'ASIC Ramón Ignacio Méndez', 'Barinas', 'Ramón Ignacio Méndez'),
('ASIC-SOC-01', 'ASIC Socopó', 'Antonio José de Sucre', 'Ticoporo')
ON CONFLICT DO NOTHING;

-- 1b. Modificar Centros de Salud (Añadir CUES y Redes)
ALTER TABLE health_centers
    ADD COLUMN IF NOT EXISTS asic_id TEXT REFERENCES asics(id),
    ADD COLUMN IF NOT EXISTS network_type TEXT CHECK (network_type IN (
        'comunal', 'especializada', 'hospitalaria', 'ivss', 'fundasalud', 'ipasme', 'privada'
    ));

-- Asumimos que el 'id' actual de health_centers actuará como CUES (Código Único de Establecimiento de Salud)
-- Ejemplo: CPT-BAR01-042


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  2. ARQUITECTURA DE USUARIOS Y PERMISOS (PractitionerRole FHIR)              ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- 2a. Modificar Perfil de Usuario (Desvincular del centro único)
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS mpps_number TEXT UNIQUE, -- Registro Ministerio de Salud
    ADD COLUMN IF NOT EXISTS medical_college_number TEXT UNIQUE; -- Número Colegio de Médicos

-- NOTA: No eliminamos la columna health_center_id ni role de user_profiles inmediatamente 
-- para no romper código legacy, pero las marcaremos como "legacy" y permitiremos nulos.
ALTER TABLE user_profiles ALTER COLUMN health_center_id DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN role DROP NOT NULL;

-- 2b. Tabla de Asignaciones (PractitionerRole - Relación N a M)
CREATE TABLE practitioner_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    health_center_id TEXT NOT NULL REFERENCES health_centers(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('medico_tratante', 'triaje', 'director', 'enfermero', 'recepcion', 'especialista', 'admin')),
    specialty TEXT, -- Ej: 'Infectólogo', 'Psiquiatra' (Útil para desbloqueos Nivel R)
    shift TEXT CHECK (shift IN ('mañana', 'tarde', 'noche', 'guardia_24h', 'rotativo')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, health_center_id, role) -- Evitar duplicados exactos
);

CREATE INDEX idx_practitioner_user ON practitioner_roles(user_id);
CREATE INDEX idx_practitioner_center ON practitioner_roles(health_center_id);

-- Migrar datos existentes (De la relación 1:1 a la nueva tabla N:M)
INSERT INTO practitioner_roles (user_id, health_center_id, role, shift)
SELECT id, health_center_id, 
       CASE 
           WHEN role = 'medico' THEN 'medico_tratante'
           ELSE role
       END, 
       'rotativo'
FROM user_profiles
WHERE health_center_id IS NOT NULL AND role IS NOT NULL
ON CONFLICT DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  3. MOTOR DE CONFIDENCIALIDAD Y CLASIFICACIÓN DE DATOS                       ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- Añadir Security Labels a tablas de historial médico
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS security_label TEXT DEFAULT 'N' CHECK (security_label IN ('N', 'R', 'V'));
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS security_label TEXT DEFAULT 'N' CHECK (security_label IN ('N', 'R', 'V'));
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS security_label TEXT DEFAULT 'N' CHECK (security_label IN ('N', 'R', 'V'));
ALTER TABLE mental_health_records ADD COLUMN IF NOT EXISTS security_label TEXT DEFAULT 'R' CHECK (security_label IN ('N', 'R', 'V')); -- Por defecto R

-- 3a. Protocolo Break-Glass (Accesos de Emergencia)
CREATE TABLE break_glass_events (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    health_center_id TEXT NOT NULL REFERENCES health_centers(id),
    reason TEXT NOT NULL CHECK (length(reason) >= 50), -- Justificación médica obligatoria
    granted_until TIMESTAMPTZ NOT NULL, -- Cuánto tiempo dura el acceso (Ej: NOW() + 8 horas)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  4. TRAZABILIDAD Y AUDITORÍA FORENSE INMUTABLE                               ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE auditoria_accesos_medicos (
    id BIGSERIAL PRIMARY KEY,
    timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    doctor_id UUID NOT NULL REFERENCES user_profiles(id),
    cues_id TEXT NOT NULL REFERENCES health_centers(id), -- Desde dónde se accedió
    patient_id UUID NOT NULL REFERENCES patients(id),
    ip_address TEXT,
    action TEXT NOT NULL CHECK (action IN ('VIEW_PROFILE', 'BREAK_GLASS', 'CONSULT', 'PRINT')),
    confidentiality_level_accessed TEXT NOT NULL CHECK (confidentiality_level_accessed IN ('N', 'R', 'V')),
    reason TEXT
);

-- IMPLEMENTACIÓN DE INMUTABILIDAD VÍA RLS (Row Level Security)
ALTER TABLE auditoria_accesos_medicos ENABLE ROW LEVEL SECURITY;

-- Política 1: Solo se permiten INSERTS (Cualquier usuario autenticado puede insertar)
CREATE POLICY insert_audit_log ON auditoria_accesos_medicos
    FOR INSERT 
    WITH CHECK (true);

-- Política 2: Solo admins o el propio paciente (futuro portal) pueden hacer SELECT
CREATE POLICY select_audit_log ON auditoria_accesos_medicos
    FOR SELECT 
    USING (true); -- Simplificado por ahora, se puede restringir más

-- NO se crean políticas para UPDATE ni DELETE, logrando inmutabilidad efectiva.


-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  5. RESILIENCIA OPERATIVA (OFFLINE-FIRST) - PREPARACIÓN ESTRUCTURAL          ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- Añadimos columnas de metadatos de sincronización a las tablas críticas
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN SELECT unnest(ARRAY['patients', 'medical_records', 'prescriptions', 'dispensation_history', 'vaccinations', 'lab_results', 'hospitalizations', 'emergency_records'])
    LOOP
        EXECUTE format('
            ALTER TABLE %I 
                ADD COLUMN IF NOT EXISTS sync_hash TEXT,
                ADD COLUMN IF NOT EXISTS origin_cues TEXT REFERENCES health_centers(id),
                ADD COLUMN IF NOT EXISTS local_id TEXT,
                ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
        ', t_name);
    END LOOP;
END;
$$;
