-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 002_rls_policies.sql
-- Fecha: 2026-08-04
-- Descripción: Habilitar Row Level Security (RLS) y crear políticas
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_migration_log ENABLE ROW LEVEL SECURITY;

-- 1. health_centers: SELECT para todos los autenticados
CREATE POLICY "Centros de salud visibles para usuarios autenticados" 
ON health_centers FOR SELECT 
TO authenticated 
USING (true);

-- 2. user_profiles: SELECT para todos los autenticados, los usuarios pueden leer el suyo
CREATE POLICY "Perfiles visibles para usuarios autenticados" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (true);

-- 3. patients: SELECT para todos los autenticados, 
-- INSERT para roles (admin, medico, enfermero, recepcion), 
-- UPDATE para (admin, medico, enfermero)
CREATE POLICY "Pacientes visibles para usuarios autenticados" 
ON patients FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Pacientes insertables por personal autorizado" 
ON patients FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'medico', 'enfermero', 'recepcion')
    )
);

CREATE POLICY "Pacientes actualizables por personal médico/admin" 
ON patients FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'medico', 'enfermero')
    )
);

-- 4. medical_records: SELECT for authenticated, INSERT ONLY for role='medico' 
-- (NO UPDATE/DELETE policies = blocked by RLS)
CREATE POLICY "Registros médicos visibles para usuarios autenticados" 
ON medical_records FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Registros médicos insertables solo por médicos" 
ON medical_records FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'medico'
    )
);

-- 5. audit_log: INSERT for authenticated, SELECT for admin only
CREATE POLICY "Log de auditoría insertable por usuarios autenticados" 
ON audit_log FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Log de auditoría visible solo para admin" 
ON audit_log FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- 6. id_migration_log: INSERT for admin/medico, SELECT for admin
CREATE POLICY "Registro de migración de ID insertable por admin/médico" 
ON id_migration_log FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'medico')
    )
);

CREATE POLICY "Registro de migración de ID visible solo para admin" 
ON id_migration_log FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);
