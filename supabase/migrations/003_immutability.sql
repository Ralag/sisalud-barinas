-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 003_immutability.sql
-- Fecha: 2026-08-04
-- Descripción: Reglas de inmutabilidad para registros médicos y logs
-- ==============================================================================

-- 1. (RLS implementado en el archivo 002)

-- 2. Revocar permisos UPDATE y DELETE
REVOKE UPDATE, DELETE ON medical_records FROM authenticated, anon, public;
REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon, public;

-- 3. Triggers BEFORE UPDATE OR DELETE para lanzar excepción (defensa profunda)
CREATE OR REPLACE FUNCTION prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operación denegada. Los registros en esta tabla son inmutables.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutability_medical_records
BEFORE UPDATE OR DELETE ON medical_records
FOR EACH ROW
EXECUTE FUNCTION prevent_modification();

CREATE TRIGGER enforce_immutability_audit_log
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW
EXECUTE FUNCTION prevent_modification();
