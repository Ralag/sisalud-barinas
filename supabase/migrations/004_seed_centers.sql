-- ==============================================================================
-- Sistema Informático de Salud (SISALUD) - Venezuela
-- Archivo: 004_seed_centers.sql
-- Fecha: 2026-08-04
-- Descripción: Inserción de centros de salud (ASIC Guanapa, Barinas)
-- ==============================================================================

INSERT INTO health_centers (id, name, municipality, state, center_type, is_active) VALUES
('BAR-CDI-GUA-001', 'CDI Guanapa', 'Barinas', 'Barinas', 'CDI', true),
('BAR-CP-GUA-001', 'Consultorio Popular Guanapa 01', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-002', 'Consultorio Popular Guanapa 02', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-003', 'Consultorio Popular Guanapa 03', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-004', 'Consultorio Popular Guanapa 04', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-005', 'Consultorio Popular Guanapa 05', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-006', 'Consultorio Popular Guanapa 06', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-007', 'Consultorio Popular Guanapa 07', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-008', 'Consultorio Popular Guanapa 08', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-009', 'Consultorio Popular Guanapa 09', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-010', 'Consultorio Popular Guanapa 10', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-011', 'Consultorio Popular Guanapa 11', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-012', 'Consultorio Popular Guanapa 12', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-013', 'Consultorio Popular Guanapa 13', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-014', 'Consultorio Popular Guanapa 14', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-015', 'Consultorio Popular Guanapa 15', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-016', 'Consultorio Popular Guanapa 16', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-017', 'Consultorio Popular Guanapa 17', 'Barinas', 'Barinas', 'consultorio', true),
('BAR-CP-GUA-018', 'Consultorio Popular Guanapa 18', 'Barinas', 'Barinas', 'consultorio', true)
ON CONFLICT (id) DO NOTHING;
